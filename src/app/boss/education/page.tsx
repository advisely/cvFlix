'use client'

import { Button, Table, Modal, Form, Input, DatePicker, Upload, message, Image, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import { Education } from '@prisma/client';
import dayjs from 'dayjs';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, CloseOutlined } from '@ant-design/icons';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  educationId: string;
}

interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  educationId?: string;
}

interface EducationWithMedia extends Education {
  media: MediaItem[];
}

const EducationPage = () => {
  const [education, setEducation] = useState<EducationWithMedia[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EducationWithMedia | null>(null);
  const [form] = Form.useForm();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryEducationId, setGalleryEducationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [educationResponse, mediaResponse] = await Promise.all([
        fetch('/api/education'),
        fetch('/api/media')
      ]);
      const educationData = await educationResponse.json();
      const mediaData = await mediaResponse.json();

      // Map media data to ensure proper typing
      const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        educationId: item.educationId || ''
      }));

      setEducation(educationData);
      setAllMedia(mappedMediaData);
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    setMedia([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/education/${editingRecord.id}` : '/api/education';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate ? values.endDate.toISOString() : null,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Save media for this education
        if (media.length > 0) {
          await Promise.all(media.map(async (item) => {
            if (!item.id) { // New media
              await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: item.url,
                  type: item.type,
                  educationId: result.id
                })
              });
            }
          }));
        }

        // Refresh data
        const [educationResponse, mediaResponse] = await Promise.all([
          fetch('/api/education'),
          fetch('/api/media')
        ]);
        const educationData = await educationResponse.json();
        const mediaData = await mediaResponse.json();

        // Map media data to ensure proper typing
        const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          educationId: item.educationId || ''
        }));

        setEducation(educationData);
        setAllMedia(mappedMediaData);

        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Error saving education:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: EducationWithMedia) => {
    setEditingRecord(record);

    // Map the media to ensure proper typing
    const mappedMedia = (record.media || []).map((item: MediaApiResponse) => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      educationId: item.educationId || record.id
    }));
    setMedia(mappedMedia);

    form.setFieldsValue({
      institution: record.institution,
      degree: record.degree,
      field: record.field,
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEducation(education.filter(edu => edu.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete education:', error);
    }
  };

  const handleMediaUpload = async (file: File, educationId: string) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return false;
    }

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('educationId', educationId === 'new' ? 'temp' : educationId);

      // Upload to server
      const response = await fetch('/api/upload/education', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      const newMedia: MediaItem = {
        id: '', // Will be set by backend
        url: result.url,
        type: isImage ? 'image' : 'video',
        educationId: educationId === 'new' ? '' : educationId
      };

      // If editing existing education, save media immediately
      if (educationId !== 'new') {
        try {
          const mediaResponse = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: result.url,
              type: isImage ? 'image' : 'video',
              educationId: educationId
            })
          });

          if (mediaResponse.ok) {
            const savedMedia = await mediaResponse.json();
            newMedia.id = savedMedia.id;

            // Refresh all media and education
            const [allMediaResponse, educationResponse] = await Promise.all([
              fetch('/api/media'),
              fetch('/api/education')
            ]);
            const allMediaData = await allMediaResponse.json();
            const educationData = await educationResponse.json();

            const mappedAllMedia = allMediaData.map((item: MediaApiResponse) => ({
              id: item.id,
              url: item.url,
              type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
              educationId: item.educationId || ''
            }));
            setAllMedia(mappedAllMedia);
            setEducation(educationData);
          }
        } catch (mediaError) {
          console.error('Failed to save media to database:', mediaError);
        }
      }

      setMedia([...media, newMedia]);
      message.success('File uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file');
    }

    return false; // Prevent default upload behavior
  };

  const handleGalleryOpen = (educationId: string) => {
    setGalleryEducationId(educationId);
    const educationMedia = allMedia.filter(item => item.educationId === educationId).map(item => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      educationId: item.educationId || ''
    }));
    setMedia(educationMedia);
    setIsGalleryVisible(true);
  };

  const isBrokenBlobUrl = (url: string) => {
    return url.startsWith('blob:');
  };

  const handleReupload = (item: MediaItem) => {
    message.info('Please upload a new file to replace the broken image');
    // This will trigger the upload dialog for this education
    if (item.educationId) {
      handleGalleryOpen(item.educationId);
    }
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    // Check if this media is already selected for this education
    const isAlreadySelected = media.some(m => m.url === selectedMedia.url);
    if (!isAlreadySelected) {
      setMedia([...media, selectedMedia]);
    }
    setIsGalleryVisible(false);
  };

  const handleMediaRemove = (mediaUrl: string) => {
    setMedia(media.filter(m => m.url !== mediaUrl));
  };

  const columns = [
    {
      title: 'Institution',
      dataIndex: 'institution',
      key: 'institution',
    },
    {
      title: 'Degree',
      dataIndex: 'degree',
      key: 'degree',
    },
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'Present',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: EducationWithMedia) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add Education
      </Button>
      <Table columns={columns} dataSource={education} rowKey="id" />
      <Modal
        title={editingRecord ? 'Edit Education' : 'Add Education'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="institution" label="Institution" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="field" label="Field of Study" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <DatePicker />
          </Form.Item>

          {/* Media Upload Section */}
          <Form.Item label="Media">
            <div>
              <Upload
                beforeUpload={(file) => {
                  handleMediaUpload(file, editingRecord?.id || 'new');
                  return false;
                }}
                showUploadList={false}
                accept="image/*,video/*"
              >
                <Button icon={<UploadOutlined />}>Upload Image/Video</Button>
              </Upload>
              <Button
                icon={<PictureOutlined />}
                onClick={() => handleGalleryOpen(editingRecord?.id || 'new')}
                style={{ marginLeft: 8 }}
              >
                Gallery
              </Button>

              {/* Preview of uploaded media */}
              <div style={{ marginTop: 16 }}>
                <Row gutter={[16, 16]}>
                  {media.map(item => (
                    <Col key={item.id} xs={12} sm={8} md={6} lg={4}>
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        {item.type === 'image' ? (
                          isBrokenBlobUrl(item.url) ? (
                            <div style={{
                              width: '100%',
                              height: 100,
                              backgroundColor: '#ffe6e6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              flexDirection: 'column',
                              gap: 4
                            }}>
                              <PictureOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                              <span style={{ fontSize: 12, color: '#ff4d4f' }}>Broken Image</span>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleReupload(item)}
                              >
                                Re-upload
                              </Button>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt="Education media"
                              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                          )
                        ) : (
                          <div style={{ width: '100%', height: 100, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                            <PlayCircleOutlined style={{ fontSize: 24, color: '#666' }} />
                          </div>
                        )}
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          size="small"
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={() => handleMediaRemove(item.url)}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        title="Select from Gallery"
        open={isGalleryVisible}
        onCancel={() => setIsGalleryVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {allMedia.map((item) => (
            <Col span={8} key={item.id}>
              <div
                onClick={() => handleGallerySelect(item)}
                style={{ cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px' }}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt="Gallery item"
                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PlayCircleOutlined style={{ fontSize: '24px' }} />
                  </div>
                )}
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  {item.type === 'image' ? 'Image' : 'Video'}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default EducationPage;
