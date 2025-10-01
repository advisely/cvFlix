'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Checkbox,
  message,
  Typography,
  Tag,
  Segmented,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { KnowledgeKind, KnowledgeLevel } from '@prisma/client'
import { KnowledgeWithMedia, KnowledgeFormValues } from './types'

const { Title, Text } = Typography

const KNOWLEDGE_KIND_LABELS: Record<KnowledgeKind, string> = {
  EDUCATION: 'Education',
  CERTIFICATION: 'Certification',
  SKILL: 'Skill',
  COURSE: 'Course',
  AWARD: 'Award',
}

const LEVEL_LABELS: Partial<Record<KnowledgeLevel, string>> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
  MASTER: 'Master',
}

const KnowledgePage = () => {
  const [form] = Form.useForm<KnowledgeFormValues>()
  const [rawData, setRawData] = useState<KnowledgeWithMedia[]>([])
  const [filteredData, setFilteredData] = useState<KnowledgeWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<KnowledgeWithMedia | null>(null)
  const [activeKindFilter, setActiveKindFilter] = useState<KnowledgeKind | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/knowledge')
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge entries')
      }
      const data: Record<KnowledgeKind, KnowledgeWithMedia[]> = await response.json()
      const flatData = (Object.values(data).flat() as KnowledgeWithMedia[]).map((item) => ({
        ...item,
        media: item.media ?? [],
      }))
      setRawData(flatData)
    } catch (error) {
      console.error('Failed to fetch knowledge entries:', error)
      message.error('Failed to load knowledge entries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    let data = [...rawData]

    if (activeKindFilter !== 'ALL') {
      data = data.filter((item) => item.kind === activeKindFilter)
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase()
      data = data.filter((item) =>
        [
          item.title,
          item.titleFr,
          item.issuer,
          item.issuerFr,
          item.category,
          item.categoryFr,
          item.description,
          item.descriptionFr,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(lower)),
      )
    }

    setFilteredData(data)
  }, [rawData, activeKindFilter, searchTerm])

  const resetModalState = useCallback(() => {
    form.resetFields()
    setEditingRecord(null)
  }, [form])

  const handleAdd = useCallback(() => {
    resetModalState()
    setIsModalOpen(true)
  }, [resetModalState])

  const handleEdit = useCallback(
    (record: KnowledgeWithMedia) => {
      setEditingRecord(record)
      form.setFieldsValue({
        kind: record.kind,
        title: record.title,
        titleFr: record.titleFr ?? '',
        issuer: record.issuer ?? '',
        issuerFr: record.issuerFr ?? '',
        category: record.category ?? '',
        categoryFr: record.categoryFr ?? '',
        description: record.description ?? '',
        descriptionFr: record.descriptionFr ?? '',
        url: record.url ?? '',
        location: record.location ?? '',
        startDate: record.startDate ? dayjs(record.startDate) : undefined,
        endDate: record.endDate ? dayjs(record.endDate) : undefined,
        validUntil: record.validUntil ? dayjs(record.validUntil) : undefined,
        isCurrent: record.isCurrent,
        competencyLevel: record.competencyLevel ?? undefined,
      })
      setIsModalOpen(true)
    },
    [form],
  )

  const handleDelete = useCallback(
    async (record: KnowledgeWithMedia) => {
      Modal.confirm({
        title: 'Delete Knowledge Entry',
        content: `Are you sure you want to delete "${record.title}"?`,
        okType: 'danger',
        async onOk() {
          try {
            const response = await fetch(`/api/knowledge/${record.id}`, {
              method: 'DELETE',
            })
            if (!response.ok) {
              throw new Error('Failed to delete knowledge entry')
            }
            message.success('Knowledge entry deleted')
            void fetchData()
          } catch (error) {
            console.error('Failed to delete knowledge entry:', error)
            message.error('Failed to delete knowledge entry')
          }
        },
      })
    },
    [fetchData],
  )

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false)
    resetModalState()
  }, [resetModalState])

  const serializeDateField = (value: KnowledgeFormValues['startDate']): string | null => {
    if (!value) {
      return null
    }
    return dayjs.isDayjs(value) ? value.toDate().toISOString() : value
  }

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const payload: KnowledgeFormValues = {
        ...values,
        startDate: serializeDateField(values.startDate),
        endDate: serializeDateField(values.endDate),
        validUntil: serializeDateField(values.validUntil),
      }

      const method = editingRecord ? 'PUT' : 'POST'
      const url = editingRecord ? `/api/knowledge/${editingRecord.id}` : '/api/knowledge'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save knowledge entry')
      }

      message.success(`Knowledge entry ${editingRecord ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      resetModalState()
      void fetchData()
    } catch (error) {
      if ((error as Error).message.includes('validation')) {
        return
      }
      console.error('Failed to save knowledge entry:', error)
      message.error('Failed to save knowledge entry')
    }
  }, [editingRecord, fetchData, form, resetModalState])

  const columns: ColumnsType<KnowledgeWithMedia> = useMemo(() => {
    const renderDateRange = (record: KnowledgeWithMedia) => {
      const start = record.startDate ? dayjs(record.startDate).format('YYYY') : 'Unknown'
      const end = record.isCurrent ? 'Present' : record.endDate ? dayjs(record.endDate).format('YYYY') : ''
      return `${start}${end ? ` - ${end}` : ''}`
    }

    return [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        sorter: (a, b) => a.title.localeCompare(b.title),
        showSorterTooltip: false,
        render: (value, record) => (
          <div>
            <Text strong>{value}</Text>
            {record.titleFr && (
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.titleFr}</div>
            )}
          </div>
        ),
      },
      {
        title: 'Kind',
        dataIndex: 'kind',
        key: 'kind',
        filters: Object.entries(KNOWLEDGE_KIND_LABELS).map(([value, label]) => ({
          text: label,
          value,
        })),
        onFilter: (value, record) => record.kind === (value as KnowledgeKind),
        render: (kind: KnowledgeKind) => <Tag color="geekblue">{KNOWLEDGE_KIND_LABELS[kind]}</Tag>,
      },
      {
        title: 'Issuer / Category',
        key: 'issuer',
        render: (_, record) => (
          <div>
            {record.issuer && <div>{record.issuer}</div>}
            {record.category && <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.category}</div>}
          </div>
        ),
      },
      {
        title: 'Dates',
        key: 'dates',
        render: (_, record) => renderDateRange(record),
      },
      {
        title: 'Media',
        dataIndex: 'media',
        key: 'media',
        render: (media: KnowledgeWithMedia['media']) => `${media?.length || 0} asset${media?.length === 1 ? '' : 's'}`,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="link" onClick={() => handleEdit(record)}>
              Edit
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record)}>
              Delete
            </Button>
          </div>
        ),
      },
    ]
  }, [handleDelete, handleEdit])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            Knowledge
          </Title>
          <Text type="secondary">Manage education, certifications, skills, and more from a single hub.</Text>
        </div>
        <Button type="primary" onClick={handleAdd}>
          Add Knowledge Entry
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Segmented
          value={activeKindFilter}
          onChange={(value) => setActiveKindFilter(value as KnowledgeKind | 'ALL')}
          options={['ALL', 'EDUCATION', 'CERTIFICATION', 'SKILL', 'COURSE', 'AWARD']}
        />
        <Input.Search
          placeholder="Search by title, issuer, or description"
          allowClear
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
        open={isModalOpen}
        onCancel={handleModalCancel}
        onOk={() => void handleSave()}
        okText={editingRecord ? 'Update' : 'Create'}
        destroyOnHidden
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={{ kind: 'EDUCATION', isCurrent: false }}>
          <Form.Item
            name="kind"
            label="Kind"
            rules={[{ required: true, message: 'Kind is required' }]}
          >
            <Select options={Object.entries(KNOWLEDGE_KIND_LABELS).map(([value, label]) => ({ value, label }))} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="titleFr" label="Title (French)">
            <Input />
          </Form.Item>

          <Form.Item name="issuer" label="Issuer / Institution">
            <Input />
          </Form.Item>

          <Form.Item name="issuerFr" label="Issuer / Institution (French)">
            <Input />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>

          <Form.Item name="categoryFr" label="Category (French)">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="descriptionFr" label="Description (French)">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="url" label="URL">
            <Input />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>

          <Form.Item name="competencyLevel" label="Competency Level">
            <Select allowClear options={Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }))} />
          </Form.Item>

          <Form.Item label="Dates">
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item name="startDate" style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} picker="month" />
              </Form.Item>
              <Form.Item name="endDate" style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} picker="month" />
              </Form.Item>
              <Form.Item name="isCurrent" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>Current</Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item name="validUntil" label="Valid Until">
            <DatePicker style={{ width: '100%' }} picker="month" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KnowledgePage
