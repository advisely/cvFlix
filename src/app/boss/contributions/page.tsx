'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  InputNumber,
  Typography,
  Space,
  Tag,
  message,
  Row,
  Col,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import type { Media } from '@prisma/client'
import { PictureOutlined } from '@ant-design/icons'
import MediaUploadSection, { type MediaItem } from '@/components/MediaUploadSection'
import MultilingualFormTabs from '@/components/MultilingualFormTabs'

const { Text, Title } = Typography

const CONTRIBUTION_TYPE_OPTIONS = [
  { value: 'OPEN_SOURCE', label: 'Open Source' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'THOUGHT_LEADERSHIP', label: 'Thought Leadership' },
]

type ContributionWithMedia = {
  id: string
  title: string
  titleFr: string | null
  organization: string | null
  organizationFr: string | null
  role: string | null
  roleFr: string | null
  description: string | null
  descriptionFr: string | null
  type: string
  impact: string | null
  impactFr: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  url: string | null
  downloadUrl: string | null
  thumbnailUrl: string | null
  displayOrder: number | null
  createdAt: string
  updatedAt: string
  media: Media[]
}

type ContributionFormValues = {
  title: string
  titleFr?: string
  organization?: string
  organizationFr?: string
  role?: string
  roleFr?: string
  description?: string
  descriptionFr?: string
  type?: string
  impact?: string
  impactFr?: string
  startDate?: Dayjs | null
  endDate?: Dayjs | null
  isCurrent?: boolean
  url?: string
  downloadUrl?: string
  thumbnailUrl?: string
  displayOrder?: number
}

const mapToMediaItems = (items: Media[]): MediaItem[] =>
  items.map((item): MediaItem => ({
    id: item.id,
    url: item.url,
    type: item.type === 'video' ? 'video' : 'image',
  }))

const ContributionsPage = () => {
  const [form] = Form.useForm<ContributionFormValues>()
  const [contributions, setContributions] = useState<ContributionWithMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingContribution, setEditingContribution] = useState<ContributionWithMedia | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([])
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [isGalleryVisible, setIsGalleryVisible] = useState(false)
  const tempUploadIdRef = useRef<string | null>(null)

  const isCurrentValue = Form.useWatch('isCurrent', form) ?? false

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contributions')
      if (!response.ok) {
        throw new Error('Failed to fetch contributions')
      }
      const data = (await response.json()) as ContributionWithMedia[]
      setContributions(data)
    } catch (error) {
      console.error('Failed to fetch contributions:', error)
      message.error('Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch('/api/media')
      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }
      const data = (await response.json()) as Media[]
      setAllMedia(mapToMediaItems(data))
    } catch (error) {
      console.error('Failed to fetch media:', error)
    }
  }, [])

  useEffect(() => {
    void fetchContributions()
    void fetchMedia()
  }, [fetchContributions, fetchMedia])

  const resetModalState = () => {
    form.resetFields()
    setSelectedMedia([])
    setEditingContribution(null)
    tempUploadIdRef.current = null
  }

  const handleAdd = () => {
    resetModalState()
    form.setFieldsValue({
      type: 'OPEN_SOURCE',
      isCurrent: false,
      displayOrder: contributions.length + 1,
    })
    tempUploadIdRef.current = crypto.randomUUID()
    setIsModalVisible(true)
  }

  const handleEdit = (record: ContributionWithMedia) => {
    setEditingContribution(record)
    form.setFieldsValue({
      title: record.title,
      titleFr: record.titleFr ?? '',
      organization: record.organization ?? '',
      organizationFr: record.organizationFr ?? '',
      role: record.role ?? '',
      roleFr: record.roleFr ?? '',
      description: record.description ?? '',
      descriptionFr: record.descriptionFr ?? '',
      type: record.type,
      impact: record.impact ?? '',
      impactFr: record.impactFr ?? '',
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      isCurrent: record.isCurrent,
      url: record.url ?? '',
      downloadUrl: record.downloadUrl ?? '',
      thumbnailUrl: record.thumbnailUrl ?? '',
      displayOrder: record.displayOrder ?? 0,
    })
    setSelectedMedia(mapToMediaItems(record.media ?? []))
    tempUploadIdRef.current = record.id
    setIsModalVisible(true)
  }

  const handleDelete = (record: ContributionWithMedia) => {
    Modal.confirm({
      title: 'Delete Contribution',
      content: `Are you sure you want to delete "${record.title}"?`,
      okType: 'danger',
      async onOk() {
        try {
          const response = await fetch(`/api/contributions/${record.id}`, { method: 'DELETE' })
          if (!response.ok) {
            throw new Error('Failed to delete contribution')
          }
          message.success('Contribution deleted')
          void fetchContributions()
        } catch (error) {
          console.error('Failed to delete contribution:', error)
          message.error('Failed to delete contribution')
        }
      },
    })
  }

  const serializeDate = (value?: Dayjs | null) => {
    if (!value) {
      return null
    }
    return value.toDate().toISOString()
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        title: values.title,
        titleFr: values.titleFr || null,
        organization: values.organization || null,
        organizationFr: values.organizationFr || null,
        role: values.role || null,
        roleFr: values.roleFr || null,
        description: values.description || null,
        descriptionFr: values.descriptionFr || null,
        type: values.type || 'OPEN_SOURCE',
        impact: values.impact || null,
        impactFr: values.impactFr || null,
        startDate: serializeDate(values.startDate ?? null),
        endDate: values.isCurrent ? null : serializeDate(values.endDate ?? null),
        isCurrent: values.isCurrent ?? false,
        url: values.url || null,
        downloadUrl: values.downloadUrl || null,
        thumbnailUrl: values.thumbnailUrl || null,
        displayOrder: values.displayOrder ?? 0,
        media: selectedMedia.map((item) => ({ id: item.id })),
      }

      const method = editingContribution ? 'PUT' : 'POST'
      const url = editingContribution ? `/api/contributions/${editingContribution.id}` : '/api/contributions'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save contribution')
      }

      message.success(`Contribution ${editingContribution ? 'updated' : 'created'} successfully`)
      setIsModalVisible(false)
      resetModalState()
      void fetchContributions()
      tempUploadIdRef.current = null
    } catch (error) {
      if ((error as Error).message.includes('validation')) {
        return
      }
      console.error('Failed to save contribution:', error)
      message.error((error as Error).message || 'Failed to save contribution')
    }
  }

  const getUploadContextId = async () => {
    if (editingContribution) {
      return editingContribution.id
    }

    const values = form.getFieldsValue()
    if (!values.title) {
      await form.validateFields(['title'])
    }

    if (!tempUploadIdRef.current) {
      tempUploadIdRef.current = crypto.randomUUID()
    }

    return tempUploadIdRef.current
  }

  const handleMediaUpload = async (file: File) => {
    try {
      const contributionContextId = await getUploadContextId()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('contributionId', contributionContextId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Upload failed')
      }

      const result = await response.json()

      const uploadedMedia: MediaItem = {
        id: result.id ?? crypto.randomUUID(),
        url: result.url,
        type: result.type,
      }

      setSelectedMedia((prev) => [...prev, uploadedMedia])
      message.success('Media uploaded successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload media'
      console.error('Contribution media upload failed:', error)
      message.error(errorMessage)
    }
  }

  const handleGallerySelect = (item: MediaItem) => {
    const exists = selectedMedia.some((media) => media.id === item.id)
    if (exists) {
      message.warning('This media is already associated with the contribution')
      return
    }
    setSelectedMedia((prev) => [...prev, item])
  }

  const columns: ColumnsType<ContributionWithMedia> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        sorter: (a, b) => a.title.localeCompare(b.title),
        showSorterTooltip: false,
        render: (value, record) => (
          <div>
            <Text strong>{value}</Text>
            {record.titleFr && <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.titleFr}</div>}
          </div>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (value: ContributionWithMedia['type']) => {
          const label = CONTRIBUTION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
          return <Tag color="red-inverse">{label}</Tag>
        },
      },
      {
        title: 'Organization',
        dataIndex: 'organization',
        key: 'organization',
        render: (_, record) => (
          <div>
            {record.organization && <div>{record.organization}</div>}
            {record.organizationFr && <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.organizationFr}</div>}
          </div>
        ),
      },
      {
        title: 'Timeline',
        key: 'timeline',
        render: (_, record) => {
          const start = record.startDate ? dayjs(record.startDate).format('YYYY-MM-DD') : 'Unknown'
          const end = record.isCurrent ? 'Present' : record.endDate ? dayjs(record.endDate).format('YYYY-MM-DD') : '—'
          return (
            <Text>{`${start} → ${end}`}</Text>
          )
        },
      },
      {
        title: 'Impact',
        dataIndex: 'impact',
        key: 'impact',
        ellipsis: true,
        render: (value: string | null) => value || '—',
      },
      {
        title: 'Media',
        dataIndex: 'media',
        key: 'media',
        render: (media: Media[]) => `${media?.length || 0} asset${media?.length === 1 ? '' : 's'}`,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              Edit
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [handleDelete],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            Contributions
          </Title>
          <Text type="secondary">Manage open-source, corporate, community, and research contributions.</Text>
        </div>
        <Button type="primary" onClick={handleAdd}>
          Add Contribution
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={contributions}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingContribution ? 'Edit Contribution' : 'Add Contribution'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          resetModalState()
        }}
        onOk={() => void handleSave()}
        okText={editingContribution ? 'Update' : 'Create'}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ type: 'OPEN_SOURCE', isCurrent: false }}
        >
          <Form.Item
            name="type"
            label="Contribution Type"
            rules={[{ required: true, message: 'Type is required' }]}
          >
            <Select options={CONTRIBUTION_TYPE_OPTIONS} placeholder="Select contribution type" />
          </Form.Item>

          <Form.Item name="displayOrder" label="Display Order">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <MultilingualFormTabs
            form={form}
            englishFields={['title', 'organization', 'role', 'description', 'impact']}
            frenchFields={['titleFr', 'organizationFr', 'roleFr', 'descriptionFr', 'impactFr']}
          >
            {(language) => (
              <>
                <Form.Item
                  name={language === 'en' ? 'title' : 'titleFr'}
                  label={`Title (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: language === 'en', message: 'Title is required in English' }]}
                >
                  <Input placeholder={`Enter title in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'organization' : 'organizationFr'}
                  label={`Organization (${language === 'en' ? 'English' : 'Français'})`}
                >
                  <Input placeholder={`Organization in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'role' : 'roleFr'}
                  label={`Role (${language === 'en' ? 'English' : 'Français'})`}
                >
                  <Input placeholder={`Role in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item name={language === 'en' ? 'description' : 'descriptionFr'} label={`Description (${language === 'en' ? 'English' : 'Français'})`}>
                  <Input.TextArea rows={3} placeholder={`Describe the contribution in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item name={language === 'en' ? 'impact' : 'impactFr'} label={`Impact (${language === 'en' ? 'English' : 'Français'})`}>
                  <Input.TextArea rows={2} placeholder={`Impact summary in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
              </>
            )}
          </MultilingualFormTabs>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: '100%' }} disabled={isCurrentValue} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isCurrent"
            label="Current Contribution"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Current"
              unCheckedChildren="Ended"
              onChange={(checked) => {
                if (checked) {
                  form.setFieldsValue({ endDate: null })
                }
              }}
            />
          </Form.Item>

          <Form.Item name="url" label="Primary URL">
            <Input placeholder="https://" />
          </Form.Item>

          <Form.Item name="downloadUrl" label="Download URL">
            <Input placeholder="https://" />
          </Form.Item>

          <Form.Item name="thumbnailUrl" label="Thumbnail URL">
            <Input placeholder="https://" />
          </Form.Item>

          <MediaUploadSection
            title="Associated Media"
            media={selectedMedia}
            onUpload={handleMediaUpload}
            onRemove={(url: string) => {
              setSelectedMedia((prev) => prev.filter((item) => item.url !== url))
            }}
            onGalleryOpen={() => setIsGalleryVisible(true)}
            maxCount={6}
            showProgress={false}
          />
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>Select Media</span>
          </Space>
        }
        open={isGalleryVisible}
        onCancel={() => setIsGalleryVisible(false)}
        footer={null}
        width={900}
        style={{ top: 32 }}
      >
        {allMedia.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <p style={{ color: '#999' }}>No media available. Upload media from the Media section first.</p>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {allMedia.map((item) => (
              <Col xs={12} sm={8} md={6} key={item.id}>
                <div
                  onClick={() => {
                    handleGallerySelect(item)
                    setIsGalleryVisible(false)
                  }}
                  style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ position: 'relative', height: 120, background: '#000' }}>
                    {item.type === 'image' ? (
                      <img src={item.url} alt="Media preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.type}
                    </div>
                  </div>
                  <div style={{ padding: '12px', fontSize: 12, color: '#666' }}>
                    {item.url.split('/').pop()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </div>
  )
}

export default ContributionsPage
