'use client'

import { Button, Table, Modal, Form, Input, DatePicker, Select, Upload, message, Image, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import { Company } from '@prisma/client';
import { ExperienceWithCompany, MediaItem, MediaApiResponse } from './types';
import dayjs from 'dayjs';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, CloseOutlined } from '@ant-design/icons';
import CleanupBlobUrls from './cleanup-blob-urls';

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState<ExperienceWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExperienceWithCompany | null>(null);
  const [form] = Form.useForm();
  const [homepageMedia, setHomepageMedia] = useState<MediaItem[]>([]);
  const [cardMedia, setCardMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [mediaType, setMediaType] = useState<'homepage' | 'card'>('homepage');


  useEffect(() => {
    const fetchData = async () => {
      const [expResponse, compResponse, mediaResponse] = await Promise.all([
        fetch('/api/experiences'),
        fetch('/api/companies'),
        fetch('/api/media')
      ]);
      const expData = await expResponse.json();
      const compData = await compResponse.json();
      const mediaData = await mediaResponse.json();

      const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        experienceId: item.experienceId || ''
      }));

      setExperiences(expData);
      setCompanies(compData);
      setAllMedia(mappedMediaData);
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    setHomepageMedia([]);
    setCardMedia([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: ExperienceWithCompany) => {
    setEditingRecord(record);

    const getMediaFor = (relation?: { id: string; url: string; type: string }[]) =>
      (relation || []).map((item) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        experienceId: record.id
      }));

    setHomepageMedia(getMediaFor(record.homepageMedia));
    setCardMedia(getMediaFor(record.cardMedia));

    form.setFieldsValue({
      title: record.title,
      companyId: record.companyId,
      description: record.description,
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/experiences/${editingRecord.id}` : '/api/experiences';
      const method = editingRecord ? 'PUT' : 'POST';

      const experienceData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,
        homepageMedia: homepageMedia.map(m => ({ id: m.id, url: m.url, type: m.type })),
        cardMedia: cardMedia.map(m => ({ id: m.id, url: m.url, type: m.type }))
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceData),
      });

      if (response.ok) {
        const [expResponse, mediaResponse] = await Promise.all([
          fetch('/api/experiences'),
          fetch('/api/media')
        ]);
        const expData = await expResponse.json();
        const mediaData = await mediaResponse.json();

        const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          experienceId: item.experienceId || ''
        }));

        setExperiences(expData);
        setAllMedia(mappedMediaData);

        setIsModalVisible(false);
      } else {
        const errorData = await response.json();
        message.error(`Failed to save experience: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save experience:', error);
      message.error('An unexpected error occurred.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setExperiences(experiences.filter(exp => exp.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  const handleMediaUpload = async (file: File, experienceId: string, type: 'homepage' | 'card') => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('experienceId', experienceId === 'new' ? 'temp' : experienceId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      const newMedia: MediaItem = {
        id: result.id,
        url: result.url,
        type: result.type,
        experienceId: experienceId === 'new' ? '' : experienceId
      };

      if (type === 'homepage') setHomepageMedia([...homepageMedia, newMedia]);
      if (type === 'card') setCardMedia([...cardMedia, newMedia]);

      message.success('File uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file');
    }

    return false;
  };

  const handleGalleryOpen = (_experienceId: string, type: 'homepage' | 'card') => {
    setMediaType(type);
    setIsGalleryVisible(true);
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    // Check if this media is already selected for this type
    const currentMedia = mediaType === 'homepage' ? homepageMedia : cardMedia;
    const isAlreadySelected = currentMedia.some(m => m.id === selectedMedia.id || m.url === selectedMedia.url);

    if (isAlreadySelected) {
      message.warning('This media is already selected for this section');
      setIsGalleryVisible(false);
      return;
    }

    if (mediaType === 'homepage') setHomepageMedia([...homepageMedia, selectedMedia]);
    if (mediaType === 'card') setCardMedia([...cardMedia, selectedMedia]);
    setIsGalleryVisible(false);
  };

  const handleMediaRemove = (mediaUrl: string, type: 'homepage' | 'card') => {
    if (type === 'homepage') setHomepageMedia(homepageMedia.filter(m => m.url !== mediaUrl));
    if (type === 'card') setCardMedia(cardMedia.filter(m => m.url !== mediaUrl));
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', dataIndex: ['company', 'name'], key: 'company' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Present' },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: ExperienceWithCompany) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </span>
      ),
    },
  ];

  const MediaUploadSection = ({
    title,
    media,
    onUpload,
    onRemove,
    onGalleryOpen
  }: {
    title: string;
    media: MediaItem[];
    onUpload: (file: File) => void;
    onRemove: (url: string) => void;
    onGalleryOpen: () => void;
  }) => (
    <Form.Item label={title}>
      <div>
        <Upload
          beforeUpload={(file) => onUpload(file)}
          showUploadList={false}
          accept="image/*,video/*"
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
        <Button
          icon={<PictureOutlined />}
          onClick={onGalleryOpen}
          style={{ marginLeft: 8 }}
        >
          Gallery
        </Button>
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            {media.map((item: MediaItem, index: number) => (
              <Col key={`${title.toLowerCase().replace(/ /g, "-")}-${item.id || item.url}-${index}`} xs={12} sm={8} md={6} lg={4}>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt="Media"
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : (
                    <video
                      src={item.url}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                      muted
                      onMouseEnter={(e) => {
                        (e.target as HTMLVideoElement).play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLVideoElement).pause();
                        (e.target as HTMLVideoElement).currentTime = 0;
                      }}
                      onError={(e) => {
                        // Fallback to icon if video fails to load
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.style.cssText = 'width: 100%; height: 100px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px;';
                        fallback.innerHTML = '<span style="font-size: 24px; color: #666;">▶</span>';
                        target.parentNode?.appendChild(fallback);
                      }}
                    />
                  )}
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    style={{ position: 'absolute', top: 4, right: 4 }}
                    onClick={() => onRemove(item.url)}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Form.Item>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleAdd} type="primary" style={{ marginRight: 8 }}>
          Add Experience
        </Button>
        <CleanupBlobUrls />
      </div>
      <Table columns={columns} dataSource={experiences} rowKey="id" />
      <Modal
        title={editingRecord ? 'Edit Experience' : 'Add Experience'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
            <Select>
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id}>{company.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <DatePicker />
          </Form.Item>

          <MediaUploadSection
            title="Homepage Media"
            media={homepageMedia}
            onUpload={(file: File) => handleMediaUpload(file, editingRecord?.id || 'new', 'homepage')}
            onRemove={(url: string) => handleMediaRemove(url, 'homepage')}
            onGalleryOpen={() => handleGalleryOpen(editingRecord?.id || 'new', 'homepage')}
          />

          <MediaUploadSection
            title="Card Media"
            media={cardMedia}
            onUpload={(file: File) => handleMediaUpload(file, editingRecord?.id || 'new', 'card')}
            onRemove={(url: string) => handleMediaRemove(url, 'card')}
            onGalleryOpen={() => handleGalleryOpen(editingRecord?.id || 'new', 'card')}
          />

        </Form>
      </Modal>

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
                  <img
                    src={item.url}
                    alt="Gallery item"
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                    <video
                      src={item.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                      onMouseEnter={(e) => {
                        (e.target as HTMLVideoElement).play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLVideoElement).pause();
                        (e.target as HTMLVideoElement).currentTime = 0;
                      }}
                      onError={() => {
                        // Fallback handled by parent div styling
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '24px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}>
                      <PlayCircleOutlined />
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '500' }}>
                  <span style={{
                    backgroundColor: item.type === 'image' ? '#52c41a' : '#1890ff',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                  }}>
                    {item.type === 'image' ? 'Image' : 'Video'}
                  </span>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.url.split('/').pop()?.split('.')[0] || 'Unknown'}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default ExperiencesPage;
