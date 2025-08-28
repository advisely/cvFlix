'use client'

import { Button, Table, Modal, Form, Input, DatePicker, message, Row, Col, Switch, Typography, Space, Select } from 'antd';
const { Text } = Typography;
import { useEffect, useState } from 'react';
import { HighlightWithMedia, MediaItem, MediaApiResponse } from './types';
import { Company } from '@prisma/client';
import dayjs from 'dayjs';
import { PictureOutlined, PlayCircleOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import HighlightCardGrid from '@/components/HighlightCardGrid';
import MultilingualFormTabs from '@/components/MultilingualFormTabs';
import MediaUploadSection from '@/components/MediaUploadSection';

const HighlightsPage = () => {

  const [highlights, setHighlights] = useState<HighlightWithMedia[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HighlightWithMedia | null>(null);
  const [form] = Form.useForm();

  // Separate state for homepage and card media
  const [homepageMedia, setHomepageMedia] = useState<MediaItem[]>([]);
  const [cardMedia, setCardMedia] = useState<MediaItem[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);

  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isCardView, setIsCardView] = useState(false);
  const [mediaType, setMediaType] = useState<'homepage' | 'card'>('homepage');

  useEffect(() => {
    const fetchData = async () => {
      const [highlightsResponse, mediaResponse, companiesResponse] = await Promise.all([
        fetch('/api/highlights'),
        fetch('/api/media'),
        fetch('/api/companies')
      ]);
      const highlightsData = await highlightsResponse.json();
      const mediaData = await mediaResponse.json();
      const companiesData = await companiesResponse.json();

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
      setCompanies(companiesData);
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
      const values = await form.validateFields([
        "title", "titleFr", "companyId", "startDate", "description", "descriptionFr"
      ]);
      const url = editingRecord ? `/api/highlights/${editingRecord.id}` : '/api/highlights';
      const method = editingRecord ? 'PUT' : 'POST';

      const highlightData = {
        ...values,
        startDate: dayjs(values.startDate).toISOString(),
        homepageMedia: homepageMedia.map(m => ({ id: m.id, url: m.url, type: m.type })),
        cardMedia: cardMedia.map(m => ({ id: m.id, url: m.url, type: m.type }))
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highlightData),
      });

      if (response.ok) {
        const [highlightsResponse, mediaResponse] = await Promise.all([
          fetch('/api/highlights'),
          fetch('/api/media')
        ]);
        const highlightsData = await highlightsResponse.json();
        const mediaData = await mediaResponse.json();

        const mappedMediaData = mediaData.map((item: MediaApiResponse) => ({
          id: item.id,
          url: item.url,
          type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
          highlightId: item.highlightId || ''
        }));

        setHighlights(highlightsData);
        setAllMedia(mappedMediaData);

        setIsModalVisible(false);
        message.success('Highlight saved successfully!');
      } else {
        const errorData = await response.json();
        message.error(`Failed to save highlight: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save highlight:', error);
      message.error('An unexpected error occurred while saving the highlight.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (record: HighlightWithMedia) => {
    setEditingRecord(record);

    // Clean media mapping following experiences pattern
    const getMediaFor = (relation?: { id: string; url: string; type: string }[]) =>
      (relation || []).map((item) => ({
        id: item.id,
        url: item.url,
        type: (item.type === 'image' || item.type === 'video') ? item.type : 'image' as 'image' | 'video',
        highlightId: record.id
      }));

    setHomepageMedia(getMediaFor(record.homepageMedia));
    setCardMedia(getMediaFor(record.cardMedia));

    form.setFieldsValue({
      title: record.title,
      titleFr: record.titleFr,
      companyId: record.companyId,
      description: record.description,
      descriptionFr: record.descriptionFr,
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

  // Enhanced media upload handler following experiences pattern
  const handleMediaUpload = async (file: File, highlightId: string, type: 'homepage' | 'card'): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('highlightId', highlightId === 'new' ? 'temp' : highlightId);
    formData.append('mediaType', type);

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
      id: result.id,
      url: result.url,
      type: result.type,
      highlightId: highlightId === 'new' ? '' : highlightId
    };

    if (type === 'homepage') setHomepageMedia([...homepageMedia, newMedia]);
    if (type === 'card') setCardMedia([...cardMedia, newMedia]);
  };

  const handleGalleryOpen = (_highlightId: string, type: 'homepage' | 'card') => {
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
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: HighlightWithMedia, b: HighlightWithMedia) =>
        a.title.localeCompare(b.title),
      showSorterTooltip: false
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "No description",
      sorter: (a: HighlightWithMedia, b: HighlightWithMedia) => {
        const aDesc = a.description || '';
        const bDesc = b.description || '';
        return aDesc.localeCompare(bDesc);
      },
      showSorterTooltip: false
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company',
      sorter: (a: HighlightWithMedia, b: HighlightWithMedia) =>
        a.company.name.localeCompare(b.company.name),
      showSorterTooltip: false
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a: HighlightWithMedia, b: HighlightWithMedia) =>
        dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
      showSorterTooltip: false
    },
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
                company: highlight.company.name, // Convert company object to string
                media: (highlight.homepageMedia || []).map(item => ({
                  id: item.id,
                  url: item.url,
                  type: item.type,
                  experienceId: item.experienceId,
                  educationId: item.educationId,
                  skillId: item.skillId,
                  certificationId: item.certificationId,
                  highlightId: item.highlightId,
                  highlightHomepageId: item.highlightHomepageId,
                  highlightCardId: item.highlightCardId,
                  experienceHomepageId: null,
                  experienceCardId: null,
                  createdAt: item.createdAt
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
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
            <Select placeholder="Select a company">
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id}>{company.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <MultilingualFormTabs
            form={form}
            englishFields={['title', 'description']}
            frenchFields={['titleFr', 'descriptionFr']}
          >
            {(language) => (
              <>
                <Form.Item
                  name={language === 'en' ? 'title' : 'titleFr'}
                  label={`Position Title (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: true, message: `Please enter the position title in ${language === 'en' ? 'English' : 'French'}` }]}
                >
                  <Input placeholder={`Enter position title in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'description' : 'descriptionFr'}
                  label={`Description (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: false }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder={`Optional description in ${language === 'en' ? 'English' : 'French'}`}
                  />
                </Form.Item>
              </>
            )}
          </MultilingualFormTabs>

          <MediaUploadSection
            title="Homepage Media"
            media={homepageMedia}
            onUpload={(file: File) => handleMediaUpload(file, editingRecord?.id || 'new', 'homepage')}
            onRemove={(url: string) => handleMediaRemove(url, 'homepage')}
            onGalleryOpen={() => handleGalleryOpen(editingRecord?.id || 'new', 'homepage')}
            maxCount={5}
            showProgress={true}
          />

          <MediaUploadSection
            title="Card Media"
            media={cardMedia}
            onUpload={(file: File) => handleMediaUpload(file, editingRecord?.id || 'new', 'card')}
            onRemove={(url: string) => handleMediaRemove(url, 'card')}
            onGalleryOpen={() => handleGalleryOpen(editingRecord?.id || 'new', 'card')}
            maxCount={3}
            showProgress={true}
          />
        </Form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PictureOutlined style={{ color: mediaType === 'homepage' ? '#1890ff' : '#52c41a' }} />
            <span>Select {mediaType === 'homepage' ? 'Homepage' : 'Card'} Media from Gallery</span>
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
                    e.currentTarget.style.borderColor = mediaType === 'homepage' ? '#1890ff' : '#52c41a';
                    e.currentTarget.style.boxShadow = `0 4px 16px rgba(${mediaType === 'homepage' ? '24, 144, 255' : '82, 196, 26'}, 0.2)`;
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
                        backgroundColor: mediaType === 'homepage' ? '#1890ff' : '#52c41a',
                        borderColor: mediaType === 'homepage' ? '#1890ff' : '#52c41a',
                        fontWeight: 500,
                        height: '32px',
                        borderRadius: '6px'
                      }}
                    >
                      Select for {mediaType === 'homepage' ? 'Homepage' : 'Card'}
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
