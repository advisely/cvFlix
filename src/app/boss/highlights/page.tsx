'use client'

import { Button, Table, Modal, Form, Input, DatePicker, Upload, message, Image, Row, Col, Switch, Space, Card, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { HighlightWithMedia, MediaItem, MediaApiResponse } from './types';
import dayjs from 'dayjs';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, CloseOutlined, TableOutlined, AppstoreOutlined, HomeOutlined, CreditCardOutlined } from '@ant-design/icons';
import HighlightCardGrid from '@/components/HighlightCardGrid';

const HighlightsPage = () => {
  const [highlights, setHighlights] = useState<HighlightWithMedia[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HighlightWithMedia | null>(null);
  const [form] = Form.useForm();

  // Separate state for homepage and card media
  const [homepageMedia, setHomepageMedia] = useState<MediaItem[]>([]);
  const [cardMedia, setCardMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);

  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryType, setGalleryType] = useState<'homepage' | 'card'>('homepage');
  const [galleryHighlightId, setGalleryHighlightId] = useState<string | null>(null);
  const [isCardView, setIsCardView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [highlightsResponse, mediaResponse] = await Promise.all([
        fetch('/api/highlights'),
        fetch('/api/media')
      ]);
      const highlightsData = await highlightsResponse.json();
      const mediaData = await mediaResponse.json();

      // Map all media data to ensure proper typing
      const allMediaData = mediaData.map((item: MediaApiResponse) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        experienceId: item.experienceId || null,
        educationId: item.educationId || null,
        skillId: item.skillId || null,
        certificationId: item.certificationId || null,
        highlightId: item.highlightId || null,
        highlightHomepageId: item.highlightHomepageId || null,
        highlightCardId: item.highlightCardId || null,
        createdAt: item.createdAt
      }));

      setHighlights(highlightsData);
      setAllMedia(allMediaData);
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/highlights/${editingRecord.id}` : '/api/highlights';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Save homepage media
        if (homepageMedia.length > 0) {
          await Promise.all(homepageMedia.map(async (item) => {
            if (!item.id) { // New media
              await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: item.url,
                  type: item.type,
                  highlightHomepageId: result.id
                })
              });
            }
          }));
        }

        // Save card media
        if (cardMedia.length > 0) {
          await Promise.all(cardMedia.map(async (item) => {
            if (!item.id) { // New media
              await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  url: item.url,
                  type: item.type,
                  highlightCardId: result.id
                })
              });
            }
          }));
        }

        // Refresh data
        const [highlightsResponse, mediaResponse] = await Promise.all([
          fetch('/api/highlights'),
          fetch('/api/media')
        ]);
        const highlightsData = await highlightsResponse.json();
        const mediaData = await mediaResponse.json();

        // Map all media data to ensure proper typing
        const allMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          highlightId: item.highlightId,
          highlightHomepageId: item.highlightHomepageId,
          highlightCardId: item.highlightCardId,
          createdAt: item.createdAt
        }));

        setHighlights(highlightsData);
        setAllMedia(allMediaData);

        setIsModalVisible(false);
        message.success('Highlight saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save highlight:', error);
      message.error('Failed to save highlight');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (record: HighlightWithMedia) => {
    setEditingRecord(record);

    // Map homepage media
    const mappedHomepageMedia = (record.homepageMedia || []).map((item: MediaApiResponse) => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      experienceId: item.experienceId || null,
      educationId: item.educationId || null,
      skillId: item.skillId || null,
      certificationId: item.certificationId || null,
      highlightId: item.highlightId || null,
      highlightHomepageId: item.highlightHomepageId || record.id,
      highlightCardId: item.highlightCardId || null,
      createdAt: item.createdAt
    }));
    setHomepageMedia(mappedHomepageMedia);

    // Map card media
    const mappedCardMedia = (record.cardMedia || []).map((item: MediaApiResponse) => ({
      id: item.id,
      url: item.url,
      type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
      experienceId: item.experienceId || null,
      educationId: item.educationId || null,
      skillId: item.skillId || null,
      certificationId: item.certificationId || null,
      highlightId: item.highlightId || null,
      highlightHomepageId: item.highlightHomepageId || null,
      highlightCardId: item.highlightCardId || record.id,
      createdAt: item.createdAt
    }));
    setCardMedia(mappedCardMedia);

    form.setFieldsValue({
      title: record.title,
      company: record.company,
      description: record.description,
      startDate: dayjs(record.startDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/highlights/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHighlights(highlights.filter(highlight => highlight.id !== id));
        message.success('Highlight deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete highlight:', error);
      message.error('Failed to delete highlight');
    }
  };

  const handleMediaUpload = async (file: File, highlightId: string, mediaType: 'homepage' | 'card') => {
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
      formData.append('highlightId', highlightId === 'new' ? 'temp' : highlightId);

      // Upload to server
      const response = await fetch('/api/upload/highlights', {
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
        createdAt: new Date(),
        experienceId: null,
        educationId: null,
        skillId: null,
        certificationId: null,
        highlightId: null,
        highlightHomepageId: mediaType === 'homepage' ? (highlightId === 'new' ? '' : highlightId) : null,
        highlightCardId: mediaType === 'card' ? (highlightId === 'new' ? '' : highlightId) : null
      };

      // If editing existing highlight, save media immediately
      if (highlightId !== 'new') {
        try {
          const mediaResponse = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: result.url,
              type: isImage ? 'image' : 'video',
              ...(mediaType === 'homepage'
                ? { highlightHomepageId: highlightId }
                : { highlightCardId: highlightId }
              )
            })
          });

          if (mediaResponse.ok) {
            const savedMedia = await mediaResponse.json();
            newMedia.id = savedMedia.id;

            // Refresh all media and highlights
            const [allMediaResponse, highlightsResponse] = await Promise.all([
              fetch('/api/media'),
              fetch('/api/highlights')
            ]);
            const allMediaData = await allMediaResponse.json();
            const highlightsData = await highlightsResponse.json();

            const mappedAllMedia = allMediaData.map((item: MediaApiResponse) => ({
              id: item.id,
              url: item.url,
              type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
              experienceId: item.experienceId || null,
              educationId: item.educationId || null,
              skillId: item.skillId || null,
              certificationId: item.certificationId || null,
              highlightId: item.highlightId || null,
              highlightHomepageId: item.highlightHomepageId || null,
              highlightCardId: item.highlightCardId || null,
              createdAt: item.createdAt
            }));
            setAllMedia(mappedAllMedia);
            setHighlights(highlightsData);
          }
        } catch (mediaError) {
          console.error('Failed to save media to database:', mediaError);
        }
      }

      // Add to appropriate media state
      if (mediaType === 'homepage') {
        setHomepageMedia([...homepageMedia, newMedia]);
      } else {
        setCardMedia([...cardMedia, newMedia]);
      }

      message.success('File uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file');
    }

    return false; // Prevent default upload behavior
  };

  const handleGalleryOpen = (highlightId: string, mediaType: 'homepage' | 'card') => {
    setGalleryHighlightId(highlightId);
    setGalleryType(mediaType);
    setIsGalleryVisible(true);
  };

  const isBrokenBlobUrl = (url: string) => {
    return url.startsWith('blob:');
  };

  const handleReupload = (item: MediaItem, mediaType: 'homepage' | 'card') => {
    message.info('Please upload a new file to replace the broken image');
    const highlightId = item.highlightHomepageId || item.highlightCardId;
    if (highlightId) {
      handleGalleryOpen(highlightId, mediaType);
    }
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    // Check if this media is already selected for this type
    const currentMedia = galleryType === 'homepage' ? homepageMedia : cardMedia;
    const isAlreadySelected = currentMedia.some(m => m.id === selectedMedia.id || m.url === selectedMedia.url);

    if (isAlreadySelected) {
      message.warning('This media is already selected for this section');
      setIsGalleryVisible(false);
      return;
    }

    const mediaToAdd: MediaItem = {
      ...selectedMedia,
      ...(galleryType === 'homepage'
        ? { highlightHomepageId: galleryHighlightId || '' }
        : { highlightCardId: galleryHighlightId || '' }
      )
    };

    if (galleryType === 'homepage') {
      setHomepageMedia([...homepageMedia, mediaToAdd]);
    } else {
      setCardMedia([...cardMedia, mediaToAdd]);
    }

    setIsGalleryVisible(false);
    message.success(`Media added to ${galleryType} section`);
  };

  const handleMediaRemove = async (mediaUrl: string, mediaType: 'homepage' | 'card') => {
    try {
      // Find the media item to get its ID
      const allMedia = mediaType === 'homepage' ? homepageMedia : cardMedia;
      const mediaItem = allMedia.find(m => m.url === mediaUrl);

      if (mediaItem?.id) {
        // Delete from database
        const response = await fetch(`/api/media/${mediaItem.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete media from server');
        }
      }

      // Remove from local state
      if (mediaType === 'homepage') {
        setHomepageMedia(homepageMedia.filter(m => m.url !== mediaUrl));
      } else {
        setCardMedia(cardMedia.filter(m => m.url !== mediaUrl));
      }

      message.success('Media removed successfully!');
    } catch (error) {
      console.error('Error removing media:', error);
      message.error('Failed to remove media');
    }
  };

  const renderMediaGrid = (media: MediaItem[], mediaType: 'homepage' | 'card') => (
    <Row gutter={[16, 16]}>
      {media.map((item, index) => (
        <Col key={`${mediaType}-${item.id || item.url}-${index}`} xs={12} sm={8} md={6} lg={4}>
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
                    onClick={() => handleReupload(item, mediaType)}
                  >
                    Re-upload
                  </Button>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`${mediaType} media`}
                  style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                />
              )
            ) : (
              <div style={{
                position: 'relative',
                width: '100%',
                height: 100,
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <video
                  src={item.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  muted
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  pointerEvents: 'none'
                }}>
                  <PlayCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
              </div>
            )}
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              size="small"
              style={{ position: 'absolute', top: 4, right: 4 }}
              onClick={() => handleMediaRemove(item.url, mediaType)}
            />
          </div>
        </Col>
      ))}
    </Row>
  );

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: "Description", dataIndex: "description", key: "description", render: (text: string) => text || "No description" },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    {
      title: 'Media',
      key: 'media',
      render: (_: unknown, record: HighlightWithMedia) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Homepage: {record.homepageMedia?.length || 0} | Card: {record.cardMedia?.length || 0}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: HighlightWithMedia) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </span>
      ),
    },
  ];return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onClick={handleAdd} type="primary">
          Add Highlight
        </Button>

        <div style={{
          background: '#f5f5f5',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #d9d9d9',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          <Space align="center">
            <TableOutlined
              style={{
                color: !isCardView ? '#1890ff' : '#8c8c8c',
                fontSize: '16px',
                transition: 'color 0.3s ease'
              }}
            />
            <Switch
              checked={isCardView}
              onChange={setIsCardView}
              size="default"
              style={{
                background: isCardView ? '#1890ff' : '#d9d9d9'
              }}
            />
            <AppstoreOutlined
              style={{
                color: isCardView ? '#1890ff' : '#8c8c8c',
                fontSize: '16px',
                transition: 'color 0.3s ease'
              }}
            />
            <span style={{
              marginLeft: 8,
              color: '#333',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'color 0.3s ease'
            }}>
              {isCardView ? 'Card View' : 'Table View'}
            </span>
          </Space>
        </div>
      </div>

      <div
        className="view-container"
        style={{
          position: 'relative',
          minHeight: '400px'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: isCardView ? 1 : 0,
            visibility: isCardView ? 'visible' : 'hidden',
            transform: isCardView ? 'translateY(0px)' : 'translateY(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: isCardView ? 2 : 1
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
              padding: '32px',
              borderRadius: '12px',
              minHeight: '400px',
              border: '1px solid #404040',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(229, 9, 20, 0.1)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <HighlightCardGrid
              highlights={highlights.map(highlight => ({
                ...highlight,
                media: [...(highlight.homepageMedia || []), ...(highlight.cardMedia || [])].map(item => ({
                  ...item,
                  experienceHomepageId: null,
                  experienceCardId: null
                }))
              }))}
              title=""
              variant="detailed"
              showActions={true}
              gridProps={{ xs: 24, sm: 12, md: 12, lg: 8, xl: 6, xxl: 4 }}
              onCardClick={(highlight) => {
                const originalHighlight = highlights.find(h => h.id === highlight.id);
                if (originalHighlight) handleEdit(originalHighlight);
              }}
              onCardEdit={(highlight) => {
                const originalHighlight = highlights.find(h => h.id === highlight.id);
                if (originalHighlight) handleEdit(originalHighlight);
              }}
              onCardDelete={(highlight) => handleDelete(highlight.id)}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: !isCardView ? 1 : 0,
            visibility: !isCardView ? 'visible' : 'hidden',
            transform: !isCardView ? 'translateY(0px)' : 'translateY(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: !isCardView ? 2 : 1
          }}
        >
          <Table
            columns={columns}
            dataSource={highlights}
            rowKey="id"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} highlights`
            }}
          />
        </div>
      </div>

      <Modal
        title={editingRecord ? 'Edit Highlight' : 'Add Highlight'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Position Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description for this highlight" />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <Divider />

          {/* Homepage Media Section */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HomeOutlined style={{ color: '#1890ff' }} />
                <span>Homepage Media</span>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                  (For hero display on homepage)
                </span>
              </div>
            }
            style={{ marginBottom: 24 }}
            size="small"
          >
            <div>
              <Space style={{ marginBottom: 16 }}>
                <Upload
                  beforeUpload={(file) => {
                    handleMediaUpload(file, editingRecord?.id || 'new', 'homepage');
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*,video/*"
                >
                  <Button icon={<UploadOutlined />} type="primary">
                    Upload Homepage Media
                  </Button>
                </Upload>
                <Button
                  icon={<PictureOutlined />}
                  onClick={() => handleGalleryOpen(editingRecord?.id || 'new', 'homepage')}
                >
                  Gallery
                </Button>
              </Space>

              {/* Preview of homepage media */}
              {homepageMedia.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>Homepage Media Preview:</h4>
                  {renderMediaGrid(homepageMedia, 'homepage')}
                </div>
              )}
            </div>
          </Card>

          {/* Card Media Section */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCardOutlined style={{ color: '#52c41a' }} />
                <span>Card Media</span>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                  (For detailed popup card)
                </span>
              </div>
            }
            size="small"
          >
            <div>
              <Space style={{ marginBottom: 16 }}>
                <Upload
                  beforeUpload={(file) => {
                    handleMediaUpload(file, editingRecord?.id || 'new', 'card');
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*,video/*"
                >
                  <Button icon={<UploadOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}>
                    Upload Card Media
                  </Button>
                </Upload>
                <Button
                  icon={<PictureOutlined />}
                  onClick={() => handleGalleryOpen(editingRecord?.id || 'new', 'card')}
                >
                  Gallery
                </Button>
              </Space>

              {/* Preview of card media */}
              {cardMedia.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>Card Media Preview:</h4>
                  {renderMediaGrid(cardMedia, 'card')}
                </div>
              )}
            </div>
          </Card>
        </Form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PictureOutlined style={{ color: galleryType === 'homepage' ? '#1890ff' : '#52c41a' }} />
            <span>Select {galleryType === 'homepage' ? 'Homepage' : 'Card'} Media from Gallery</span>
          </div>
        }
        open={isGalleryVisible}
        onCancel={() => setIsGalleryVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '20px' } }}
      >
        {allMedia.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <p style={{ color: '#999', fontSize: 16 }}>No media files available</p>
            <p style={{ color: '#666', fontSize: 14 }}>Upload some images or videos first</p>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {allMedia.map((item) => (
              <Col xs={12} sm={8} md={6} key={item.id}>
                <div
                  style={{
                    position: 'relative',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = galleryType === 'homepage' ? '#1890ff' : '#52c41a';
                    e.currentTarget.style.boxShadow = `0 4px 16px rgba(${galleryType === 'homepage' ? '24, 144, 255' : '82, 196, 26'}, 0.2)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f0f0f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Media Preview */}
                  <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt="Gallery item"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Ccm9rZW4gSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <video
                          src={item.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          muted
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          pointerEvents: 'none'
                        }}>
                          <PlayCircleOutlined style={{ fontSize: 32, color: 'white' }} />
                        </div>
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {item.type}
                    </div>
                  </div>

                  {/* Media Info & Select Button */}
                  <div style={{ padding: '12px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {item.url.split('/').pop()?.substring(0, 20) || 'Media file'}
                      {(item.url.split('/').pop()?.length || 0) > 20 && '...'}
                    </div>

                    <Button
                      type="primary"
                      size="small"
                      block
                      onClick={() => handleGallerySelect(item)}
                      style={{
                        backgroundColor: galleryType === 'homepage' ? '#1890ff' : '#52c41a',
                        borderColor: galleryType === 'homepage' ? '#1890ff' : '#52c41a',
                        fontWeight: 500,
                        height: '32px',
                        borderRadius: '6px'
                      }}
                      icon={galleryType === 'homepage' ? <HomeOutlined /> : <CreditCardOutlined />}
                    >
                      Select for {galleryType === 'homepage' ? 'Homepage' : 'Card'}
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default HighlightsPage;
