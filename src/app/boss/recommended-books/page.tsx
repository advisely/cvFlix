'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
  Space,
  message,
  Row,
  Col,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Media } from '@prisma/client'
import { PictureOutlined } from '@ant-design/icons'
import MediaUploadSection, { type MediaItem } from '@/components/MediaUploadSection'
import MultilingualFormTabs from '@/components/MultilingualFormTabs'

const { Text, Title } = Typography

type RecommendedBookWithMedia = {
  id: string
  title: string
  titleFr: string | null
  author: string
  authorFr: string | null
  recommendedReason: string | null
  recommendedReasonFr: string | null
  summary: string | null
  summaryFr: string | null
  purchaseUrl: string | null
  priority: number
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
  media: Media[]
}

type BookFormValues = {
  title: string
  titleFr?: string
  author: string
  authorFr?: string
  recommendedReason?: string
  recommendedReasonFr?: string
  summary?: string
  summaryFr?: string
  purchaseUrl?: string
  priority?: number
  coverImageUrl?: string
}

const mapToMediaItems = (items: Media[]): MediaItem[] =>
  items.map((item): MediaItem => ({
    id: item.id,
    url: item.url,
    type: item.type === 'video' ? 'video' : 'image',
  }))

const RecommendedBooksPage = () => {
  const [form] = Form.useForm<BookFormValues>()
  const [books, setBooks] = useState<RecommendedBookWithMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState<RecommendedBookWithMedia | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([])
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [isGalleryVisible, setIsGalleryVisible] = useState(false)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recommended-books')
      if (!response.ok) {
        throw new Error('Failed to fetch recommended books')
      }
      const data = (await response.json()) as RecommendedBookWithMedia[]
      setBooks(data)
    } catch (error) {
      console.error('Failed to fetch recommended books:', error)
      message.error('Failed to load recommended books')
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
    void fetchBooks()
    void fetchMedia()
  }, [fetchBooks, fetchMedia])

  const resetModalState = () => {
    form.resetFields()
    setSelectedMedia([])
    setEditingBook(null)
  }

  const handleAdd = () => {
    resetModalState()
    form.setFieldsValue({ priority: books.length + 1 })
    setIsModalVisible(true)
  }

  const handleEdit = (record: RecommendedBookWithMedia) => {
    setEditingBook(record)
    form.setFieldsValue({
      title: record.title,
      titleFr: record.titleFr ?? '',
      author: record.author,
      authorFr: record.authorFr ?? '',
      recommendedReason: record.recommendedReason ?? '',
      recommendedReasonFr: record.recommendedReasonFr ?? '',
      summary: record.summary ?? '',
      summaryFr: record.summaryFr ?? '',
      purchaseUrl: record.purchaseUrl ?? '',
      priority: record.priority ?? 0,
      coverImageUrl: record.coverImageUrl ?? '',
    })
    setSelectedMedia(mapToMediaItems(record.media ?? []))
    setIsModalVisible(true)
  }

  const handleDelete = (record: RecommendedBookWithMedia) => {
    Modal.confirm({
      title: 'Delete Recommended Book',
      content: `Are you sure you want to delete "${record.title}"?`,
      okType: 'danger',
      async onOk() {
        try {
          const response = await fetch(`/api/recommended-books/${record.id}`, { method: 'DELETE' })
          if (!response.ok) {
            throw new Error('Failed to delete recommended book')
          }
          message.success('Recommended book deleted')
          void fetchBooks()
        } catch (error) {
          console.error('Failed to delete recommended book:', error)
          message.error('Failed to delete recommended book')
        }
      },
    })
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        title: values.title,
        titleFr: values.titleFr || null,
        author: values.author,
        authorFr: values.authorFr || null,
        recommendedReason: values.recommendedReason || null,
        recommendedReasonFr: values.recommendedReasonFr || null,
        summary: values.summary || null,
        summaryFr: values.summaryFr || null,
        purchaseUrl: values.purchaseUrl || null,
        priority: values.priority ?? 0,
        coverImageUrl: values.coverImageUrl || null,
        media: selectedMedia.map((item) => ({ id: item.id })),
      }

      const method = editingBook ? 'PUT' : 'POST'
      const url = editingBook ? `/api/recommended-books/${editingBook.id}` : '/api/recommended-books'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save recommended book')
      }

      message.success(`Recommended book ${editingBook ? 'updated' : 'created'} successfully`)
      setIsModalVisible(false)
      resetModalState()
      void fetchBooks()
    } catch (error) {
      if ((error as Error).message.includes('validation')) {
        return
      }
      console.error('Failed to save recommended book:', error)
      message.error((error as Error).message || 'Failed to save recommended book')
    }
  }

  const handleMediaUpload = async (_file: File) => {
    message.warning('Direct upload is disabled. Please upload media from the Media section and select from the gallery.')
  }

  const handleGallerySelect = (item: MediaItem) => {
    const exists = selectedMedia.some((media) => media.id === item.id)
    if (exists) {
      message.warning('This media is already associated with the book')
      return
    }
    setSelectedMedia((prev) => [...prev, item])
  }

  const columns: ColumnsType<RecommendedBookWithMedia> = useMemo(
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
        title: 'Author',
        dataIndex: 'author',
        key: 'author',
        render: (_, record) => (
          <div>
            <div>{record.author}</div>
            {record.authorFr && <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.authorFr}</div>}
          </div>
        ),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        sorter: (a, b) => a.priority - b.priority,
        showSorterTooltip: false,
        render: (value: number) => <Tag color="gold">#{value}</Tag>,
      },
      {
        title: 'Purchase URL',
        dataIndex: 'purchaseUrl',
        key: 'purchaseUrl',
        render: (value: string | null) => (value ? <a href={value} target="_blank" rel="noreferrer">Link</a> : '—'),
      },
      {
        title: 'Summary',
        dataIndex: 'summary',
        key: 'summary',
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
            Recommended Books
          </Title>
          <Text type="secondary">Curate the reading list that complements your portfolio.</Text>
        </div>
        <Button type="primary" onClick={handleAdd}>
          Add Book
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={books}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBook ? 'Edit Recommended Book' : 'Add Recommended Book'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          resetModalState()
        }}
        onOk={() => void handleSave()}
        okText={editingBook ? 'Update' : 'Create'}
        destroyOnHidden
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: books.length + 1 }}
        >
          <MultilingualFormTabs
            form={form}
            englishFields={['title', 'author', 'recommendedReason', 'summary']}
            frenchFields={['titleFr', 'authorFr', 'recommendedReasonFr', 'summaryFr']}
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
                  name={language === 'en' ? 'author' : 'authorFr'}
                  label={`Author (${language === 'en' ? 'English' : 'Français'})`}
                  rules={[{ required: language === 'en', message: 'Author is required in English' }]}
                >
                  <Input placeholder={`Enter author in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'recommendedReason' : 'recommendedReasonFr'}
                  label={`Recommendation Reason (${language === 'en' ? 'English' : 'Français'})`}
                >
                  <Input.TextArea rows={3} placeholder={`Why recommend this book in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
                <Form.Item
                  name={language === 'en' ? 'summary' : 'summaryFr'}
                  label={`Summary (${language === 'en' ? 'English' : 'Français'})`}
                >
                  <Input.TextArea rows={3} placeholder={`Short summary in ${language === 'en' ? 'English' : 'French'}`} />
                </Form.Item>
              </>
            )}
          </MultilingualFormTabs>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Display Priority"
                tooltip="Lower numbers appear first"
                rules={[{ required: true, message: 'Priority is required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purchaseUrl" label="Purchase URL">
                <Input placeholder="https://" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="coverImageUrl" label="Cover Image URL">
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
            maxCount={4}
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

export default RecommendedBooksPage
