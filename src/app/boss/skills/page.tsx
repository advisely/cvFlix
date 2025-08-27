'use client'

import { Button, Table, Modal, Form, Input, Select, Upload, message, Image, Row, Col, Alert, Progress, Typography, Space, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Skill } from '@prisma/client';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, CloseOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useUploadErrorHandler, validateUploadFile } from '@/hooks/useUploadErrorHandler';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  skillId: string;
}

interface MediaApiResponse {
  id: string;
  url: string;
  type: string;
  skillId?: string;
}

interface SkillWithMedia extends Skill {
  media: MediaItem[];
}

const SkillsPage = () => {
  const { t } = useLanguage();
  const {
    uploadState,
    handleUploadError,
    startUpload,
    completeUpload,
    retryUpload,
    clearError,
    canRetry,
    actionLabels
  } = useUploadErrorHandler();

  const [skills, setSkills] = useState<SkillWithMedia[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SkillWithMedia | null>(null);
  const [form] = Form.useForm();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [gallerySkillId, setGallerySkillId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [skillsResponse, mediaResponse] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/media')
      ]);
      const skillsData = await skillsResponse.json();
      const mediaData = await mediaResponse.json();

      // Map media data to ensure proper typing
      const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        skillId: item.skillId || ''
      }));

      setSkills(skillsData);
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
      const url = editingRecord ? `/api/skills/${editingRecord.id}` : '/api/skills';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();

        // Save media for this skill
        if (media.length > 0) {
          await Promise.all(media.map(async (item) => {
            if (!item.id) { // New media
              await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: item.url,
                  type: item.type,
                  skillId: result.id
                })
              });
            }
          }));
        }

        // Refresh data
        const [skillsResponse, mediaResponse] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/media')
        ]);
        const skillsData = await skillsResponse.json();
        const mediaData = await mediaResponse.json();

        // Map media data to ensure proper typing
        const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          skillId: item.skillId || ''
        }));

        setSkills(skillsData);
        setAllMedia(mappedMediaData);

        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (record: SkillWithMedia) => {
    setEditingRecord(record);

    // Map the media to ensure proper typing
    const mappedMedia = (record.media || []).map((item: MediaApiResponse) => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      skillId: item.skillId || record.id
    }));
    setMedia(mappedMedia);

    form.setFieldsValue({
      name: record.name,
      category: record.category,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSkills(skills.filter(skill => skill.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleMediaUpload = async (file: File, skillId: string): Promise<boolean> => {
    // Pre-upload validation
    const validation = validateUploadFile(file, t);
    if (!validation.isValid && validation.error) {
      handleUploadError(new Error(validation.error.message), file.name);
      return false;
    }

    try {
      startUpload();
      setPendingFile(file);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skillId', skillId === 'new' ? 'temp' : skillId);

      // Upload to server
      const response = await fetch('/api/upload/skills', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      const newMedia: MediaItem = {
        id: '', // Will be set by backend
        url: result.url,
        type: isImage ? 'image' : 'video',
        skillId: skillId === 'new' ? '' : skillId
      };

      // If editing existing skill, save media immediately
      if (skillId !== 'new') {
        try {
          const mediaResponse = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: result.url,
              type: isImage ? 'image' : 'video',
              skillId: skillId
            })
          });

          if (mediaResponse.ok) {
            const savedMedia = await mediaResponse.json();
            newMedia.id = savedMedia.id;

            // Refresh all media and skills
            const [allMediaResponse, skillsResponse] = await Promise.all([
              fetch('/api/media'),
              fetch('/api/skills')
            ]);
            const allMediaData = await allMediaResponse.json();
            const skillsData = await skillsResponse.json();

            const mappedAllMedia = allMediaData.map((item: MediaApiResponse) => ({
              id: item.id,
              url: item.url,
              type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
              skillId: item.skillId || ''
            }));
            setAllMedia(mappedAllMedia);
            setSkills(skillsData);
          }
        } catch (mediaError) {
          console.error('Failed to save media to database:', mediaError);
        }
      }

      setMedia([...media, newMedia]);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        completeUpload();
        setPendingFile(null);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setUploadProgress(0);
      handleUploadError(error, file.name);
    }

    return false; // Prevent default upload behavior
  };

  const handleGalleryOpen = (skillId: string) => {
    setGallerySkillId(skillId);
    const skillMedia = allMedia.filter(item => item.skillId === skillId).map(item => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      skillId: item.skillId || ''
    }));
    setMedia(skillMedia);
    setIsGalleryVisible(true);
  };

  const isBrokenBlobUrl = (url: string) => {
    return url.startsWith('blob:');
  };

  const handleReupload = (item: MediaItem) => {
    message.info('Please upload a new file to replace the broken image');
    // This will trigger the upload dialog for this skill
    if (item.skillId) {
      handleGalleryOpen(item.skillId);
    }
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    // Check if this media is already selected for this skill
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
      sorter: (a: SkillWithMedia, b: SkillWithMedia) => 
        a.name.localeCompare(b.name),
      showSorterTooltip: false
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      sorter: (a: SkillWithMedia, b: SkillWithMedia) => 
        a.category.localeCompare(b.category),
      showSorterTooltip: false
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: SkillWithMedia) => (
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
        Add Skill
      </Button>
      <Table columns={columns} dataSource={skills} rowKey="id" />
      <Modal
        title={editingRecord ? 'Edit Skill' : 'Add Skill'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Frontend">Frontend</Select.Option>
              <Select.Option value="Backend">Backend</Select.Option>
              <Select.Option value="Database">Database</Select.Option>
              <Select.Option value="DevOps">DevOps</Select.Option>
              <Select.Option value="Tools">Tools</Select.Option>
            </Select>
          </Form.Item>

          {/* Media Upload Section */}
          <Form.Item label="Media">
            <div>
              {/* Error Alert */}
              {uploadState.error && (
                <Alert
                  type="error"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                  message={uploadState.error.message}
                  description={
                    uploadState.error.details && (
                      <div>
                        {uploadState.error.details.fileName && (
                          <Text type="secondary">File: {uploadState.error.details.fileName}</Text>
                        )}
                        {uploadState.error.details.currentSize && uploadState.error.details.maxSize && (
                          <div>
                            <Text type="secondary">
                              Current size: {uploadState.error.details.currentSize.toFixed(2)}MB, 
                              Max allowed: {uploadState.error.details.maxSize}MB
                            </Text>
                          </div>
                        )}
                      </div>
                    )
                  }
                  action={
                    <Space>
                      {canRetry && (
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            if (pendingFile) {
                              retryUpload();
                              handleMediaUpload(pendingFile, editingRecord?.id || 'new');
                            }
                          }}
                          loading={uploadState.isUploading}
                        >
                          {actionLabels.retry}
                        </Button>
                      )}
                      <Button size="small" onClick={clearError}>
                        {actionLabels.dismiss}
                      </Button>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                  closable
                  onClose={clearError}
                />
              )}
              
              {/* Upload Progress */}
              {uploadState.isUploading && (
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={Math.round(uploadProgress)}
                    status={uploadState.error ? 'exception' : 'active'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {pendingFile ? `Uploading ${pendingFile.name}...` : 'Uploading...'}
                  </Text>
                </div>
              )}

              <Space style={{ marginBottom: 16 }}>
                <Upload
                  beforeUpload={(file) => {
                    handleMediaUpload(file, editingRecord?.id || 'new');
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*,video/*"
                  disabled={uploadState.isUploading}
                >
                  <Button 
                    icon={uploadState.isUploading ? <Spin size="small" /> : <UploadOutlined />}
                    loading={uploadState.isUploading}
                    disabled={uploadState.isUploading}
                  >
                    {uploadState.isUploading ? 'Uploading...' : 'Upload Image/Video'}
                  </Button>
                </Upload>
                <Button
                  icon={<PictureOutlined />}
                  onClick={() => handleGalleryOpen(editingRecord?.id || 'new')}
                  disabled={uploadState.isUploading}
                >
                  Gallery
                </Button>
              </Space>
              
              {/* Help text */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Supported formats: Images (JPG, PNG, GIF, WebP, AVIF) up to 10MB, Videos (MP4, WebM, OGG, AVI, MOV) up to 50MB
                </Text>
              </div>

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
                              alt="Skill media"
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

export default SkillsPage;
