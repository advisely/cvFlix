'use client'

import { Button, Table, Modal, Form, Input, DatePicker, Upload, message, Image, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import { Certification } from '@prisma/client';
import dayjs from 'dayjs';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, CloseOutlined } from '@ant-design/icons';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  certificationId: string;
}

interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  certificationId?: string;
}

interface CertificationWithMedia extends Certification {
  media: MediaItem[];
}

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState<CertificationWithMedia[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CertificationWithMedia | null>(null);
  const [form] = Form.useForm();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryCertificationId, setGalleryCertificationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [certificationsResponse, mediaResponse] = await Promise.all([
        fetch('/api/certifications'),
        fetch('/api/media')
      ]);
      const certificationsData = await certificationsResponse.json();
      const mediaData = await mediaResponse.json();

      // Map media data to ensure proper typing
      const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        certificationId: item.certificationId || ''
      }));

      setCertifications(certificationsData);
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
      const url = editingRecord ? `/api/certifications/${editingRecord.id}` : '/api/certifications';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          issueDate: values.issueDate.toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Save media for this certification
        if (media.length > 0) {
          await Promise.all(media.map(async (item) => {
            if (!item.id) { // New media
              await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: item.url,
                  type: item.type,
                  certificationId: result.id
                })
              });
            }
          }));
        }

        // Refresh data
        const [certificationsResponse, mediaResponse] = await Promise.all([
          fetch('/api/certifications'),
          fetch('/api/media')
        ]);
        const certificationsData = await certificationsResponse.json();
        const mediaData = await mediaResponse.json();

        // Map media data to ensure proper typing
        const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          certificationId: item.certificationId || ''
        }));

        setCertifications(certificationsData);
        setAllMedia(mappedMediaData);

        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Failed to save certification:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (record: CertificationWithMedia) => {
    setEditingRecord(record);

    // Map the media to ensure proper typing
    const mappedMedia = (record.media || []).map((item: MediaApiResponse) => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      certificationId: item.certificationId || record.id
    }));
    setMedia(mappedMedia);

    form.setFieldsValue({
      name: record.name,
      issuer: record.issuer,
      issueDate: dayjs(record.issueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCertifications(certifications.filter(cert => cert.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  };

  const handleMediaUpload = async (file: File, certificationId: string) => {
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
      formData.append('certificationId', certificationId === 'new' ? 'temp' : certificationId);

      // Upload to server
      const response = await fetch('/api/upload/certifications', {
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
        certificationId: certificationId === 'new' ? '' : certificationId
      };

      // If editing existing certification, save media immediately
      if (certificationId !== 'new') {
        try {
          const mediaResponse = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: result.url,
              type: isImage ? 'image' : 'video',
              certificationId: certificationId
            })
          });

          if (mediaResponse.ok) {
            const savedMedia = await mediaResponse.json();
            newMedia.id = savedMedia.id;

            // Refresh all media and certifications
            const [allMediaResponse, certificationsResponse] = await Promise.all([
              fetch('/api/media'),
              fetch('/api/certifications')
            ]);
            const allMediaData = await allMediaResponse.json();
            const certificationsData = await certificationsResponse.json();

            const mappedAllMedia = allMediaData.map((item: MediaApiResponse) => ({
              id: item.id,
              url: item.url,
              type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
              certificationId: item.certificationId || ''
            }));
            setAllMedia(mappedAllMedia);
            setCertifications(certificationsData);
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

  const handleGalleryOpen = (certificationId: string) => {
    setGalleryCertificationId(certificationId);
    const certificationMedia = allMedia.filter(item => item.certificationId === certificationId).map(item => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      certificationId: item.certificationId || ''
    }));
    setMedia(certificationMedia);
    setIsGalleryVisible(true);
  };

  const isBrokenBlobUrl = (url: string) => {
    return url.startsWith('blob:');
  };

  const handleReupload = (item: MediaItem) => {
    message.info('Please upload a new file to replace the broken image');
    // This will trigger the upload dialog for this certification
    if (item.certificationId) {
      handleGalleryOpen(item.certificationId);
    }
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    // Check if this media is already selected for this certification
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: CertificationWithMedia, b: CertificationWithMedia) => 
        a.name.localeCompare(b.name),
      showSorterTooltip: false
    },
    {
      title: 'Issuer',
      dataIndex: 'issuer',
      key: 'issuer',
      sorter: (a: CertificationWithMedia, b: CertificationWithMedia) => 
        a.issuer.localeCompare(b.issuer),
      showSorterTooltip: false
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a: CertificationWithMedia, b: CertificationWithMedia) => 
        dayjs(a.issueDate).valueOf() - dayjs(b.issueDate).valueOf(),
      showSorterTooltip: false
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: CertificationWithMedia) => (
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
        Add Certification
      </Button>
      <Table columns={columns} dataSource={certifications} rowKey="id" />
      <Modal
        title={editingRecord ? 'Edit Certification' : 'Add Certification'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="issuer" label="Issuer" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="issueDate" label="Issue Date" rules={[{ required: true }]}>
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
                              alt="Certification media"
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

export default CertificationsPage;
