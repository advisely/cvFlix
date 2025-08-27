'use client'

import { Button, Table, Modal, Form, Input, Select, message, Row, Col, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Company } from '@prisma/client';
import { ExperienceWithCompany, MediaItem, MediaApiResponse, ExperienceDateRange } from './types';
import dayjs from 'dayjs';
import { PlayCircleOutlined } from '@ant-design/icons';
import CleanupBlobUrls from './cleanup-blob-urls';
import MultilingualFormTabs from '@/components/MultilingualFormTabs';
import DateRangeManager from '@/components/DateRangeManager';
import MediaUploadSection from '@/components/MediaUploadSection';

const { Text } = Typography;

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
  const [dateRanges, setDateRanges] = useState<ExperienceDateRange[]>([
    { id: '', startDate: '', endDate: null, isCurrent: false }
  ]);


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
    setDateRanges([{ id: `range-${Date.now()}`, startDate: '', endDate: null, isCurrent: false }]);
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

    // Convert single date fields to date ranges for backward compatibility
    const existingDateRanges = record.dateRanges || [{
      id: `range-${Date.now()}`,
      startDate: typeof record.startDate === 'string' ? record.startDate : new Date(record.startDate).toISOString(),
      endDate: record.endDate ? (typeof record.endDate === 'string' ? record.endDate : new Date(record.endDate).toISOString()) : null,
      isCurrent: !record.endDate,
      experienceId: record.id
    }];

    setDateRanges(existingDateRanges);

    form.setFieldsValue({
      title: record.title,
      titleFr: record.titleFr,
      companyId: record.companyId,
      description: record.description,
      descriptionFr: record.descriptionFr,
      dateRanges: existingDateRanges
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/experiences/${editingRecord.id}` : '/api/experiences';
      const method = editingRecord ? 'PUT' : 'POST';

      // For backward compatibility, use the first date range for startDate/endDate
      const primaryRange = dateRanges.find(r => r.startDate) || dateRanges[0];
      
      const experienceData = {
        ...values,
        startDate: primaryRange?.startDate ? dayjs(primaryRange.startDate).toISOString() : new Date().toISOString(),
        endDate: primaryRange?.endDate ? dayjs(primaryRange.endDate).toISOString() : null,
        dateRanges: dateRanges.map(range => ({
          startDate: range.startDate,
          endDate: range.isCurrent ? null : range.endDate
        })),
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
        message.success('Experience saved successfully!');
      } else {
        const errorData = await response.json();
        message.error(`Failed to save experience: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save experience:', error);
      message.error('An unexpected error occurred while saving the experience.');
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
        message.success('Experience deleted successfully!');
      } else {
        message.error('Failed to delete experience');
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
      message.error('An unexpected error occurred while deleting the experience.');
    }
  };

  // Enhanced media upload handler with proper error handling
  const handleMediaUpload = async (file: File, experienceId: string, type: 'homepage' | 'card'): Promise<void> => {
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

  const formatDateRanges = (ranges: ExperienceDateRange[]): string => {
    return ranges
      .filter(range => range.startDate)
      .map(range => {
        const start = dayjs(range.startDate).format('YYYY');
        const end = range.endDate ? dayjs(range.endDate).format('YYYY') : 'Present';
        return start === end.slice(0, 4) ? start : `${start}-${end}`;
      })
      .join(', ');
  };

  const handleDateRangesChange = (ranges: ExperienceDateRange[]) => {
    setDateRanges(ranges);
    form.setFieldsValue({ dateRanges: ranges });
  };

  // Custom validator for date ranges
  const validateDateRanges = (_: unknown, value: ExperienceDateRange[]) => {
    if (!value || value.length === 0) {
      return Promise.reject(new Error('At least one employment period is required'));
    }
    
    const hasValidRange = value.some(range => range.startDate);
    if (!hasValidRange) {
      return Promise.reject(new Error('At least one employment period must have a start date'));
    }
    
    return Promise.resolve();
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: ExperienceWithCompany, b: ExperienceWithCompany) =>
        a.title.localeCompare(b.title),
      showSorterTooltip: false
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company',
      sorter: (a: ExperienceWithCompany, b: ExperienceWithCompany) =>
        a.company.name.localeCompare(b.company.name),
      showSorterTooltip: false
    },
    {
      title: 'Employment Periods',
      key: 'dateRanges',
      render: (_, record: ExperienceWithCompany) => {
        // For backward compatibility, create date range from single dates if dateRanges doesn't exist
        const ranges = record.dateRanges || [{
          id: '1',
          startDate: typeof record.startDate === 'string' ? record.startDate : new Date(record.startDate).toISOString(),
          endDate: record.endDate ? (typeof record.endDate === 'string' ? record.endDate : new Date(record.endDate).toISOString()) : null,
          isCurrent: !record.endDate
        }];
        
        const formatted = formatDateRanges(ranges);
        const hasCurrent = ranges.some(r => !r.endDate || r.isCurrent);
        
        return (
          <div>
            <Text>{formatted}</Text>
            {hasCurrent && (
              <Tag color="green" style={{ marginLeft: 8 }}>
                Current
              </Tag>
            )}
          </div>
        );
      },
      sorter: (a: ExperienceWithCompany, b: ExperienceWithCompany) => {
        // Sort by earliest start date across all ranges
        const aRanges = a.dateRanges || [{ startDate: typeof a.startDate === 'string' ? a.startDate : new Date(a.startDate).toISOString(), endDate: a.endDate }];
        const bRanges = b.dateRanges || [{ startDate: typeof b.startDate === 'string' ? b.startDate : new Date(b.startDate).toISOString(), endDate: b.endDate }];
        
        const aEarliest = Math.min(...aRanges.map(r => new Date(r.startDate).getTime()));
        const bEarliest = Math.min(...bRanges.map(r => new Date(r.startDate).getTime()));
        return bEarliest - aEarliest; // Most recent first
      },
      showSorterTooltip: false
    },
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
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
            <Select>
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id}>{company.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Employment Periods"
            name="dateRanges"
            rules={[
              { required: true, message: 'At least one employment period is required' },
              { validator: validateDateRanges }
            ]}
          >
            <DateRangeManager
              value={dateRanges}
              onChange={handleDateRangesChange}
              validation={{
                allowOverlaps: true,
                maxRanges: 10,
                requireMinimumDuration: true
              }}
            />
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
                  label={`Title (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: true, message: `Please enter the title in ${language === 'en' ? 'English' : 'French'}` }]}
                >
                  <Input placeholder={`Enter title in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'description' : 'descriptionFr'}
                  label={`Description (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: true, message: `Please enter the description in ${language === 'en' ? 'English' : 'French'}` }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder={`Enter description in ${language === 'en' ? 'English' : 'French'}`}
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
