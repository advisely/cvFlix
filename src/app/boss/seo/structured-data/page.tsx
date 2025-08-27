'use client'

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, message, Typography, Row, Col, Tabs, Tag } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import StructuredDataManager from '@/components/seo/StructuredDataManager';
import { ValidationResult } from '@/components/seo/utils/schema-utils';

const { Title, Text } = Typography;

interface StructuredDataItem {
  id: string;
  type: string;
  page: string;
  jsonData: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const StructuredDataPage = () => {
  const [structuredData, setStructuredData] = useState<StructuredDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StructuredDataItem | null>(null);
  const [activeTab, setActiveTab] = useState('manage');

  useEffect(() => {
    fetchStructuredData();
  }, []);

  const fetchStructuredData = async () => {
    try {
      const response = await fetch('/api/seo/structured-data');
      if (response.ok) {
        const data = await response.json();
        setStructuredData(data);
      } else {
        setStructuredData([]);
      }
    } catch (error) {
      console.error('Error fetching structured data:', error);
      setStructuredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (jsonData: string, validation: ValidationResult) => {
    try {
      // Parse JSON to extract basic info
      const parsedData = JSON.parse(jsonData);
      const type = parsedData['@type'] || 'Unknown';
      const page = '/'; // Default page, could be made configurable
      
      const url = editingRecord 
        ? `/api/seo/structured-data?id=${editingRecord.id}`
        : '/api/seo/structured-data';
      
      const method = editingRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          page,
          jsonData,
          isActive: true
        })
      });

      if (response.ok) {
        message.success(editingRecord ? 'Schema updated successfully' : 'Schema created successfully');
        setIsModalVisible(false);
        setEditingRecord(null);
        fetchStructuredData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save schema');
      }
    } catch (error) {
      console.error('Error saving structured data:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to save structured data');
      }
      throw error;
    }
  };

  const handleEdit = (record: StructuredDataItem) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/seo/structured-data?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Schema deleted successfully');
        fetchStructuredData();
      } else {
        throw new Error('Failed to delete schema');
      }
    } catch (error) {
      console.error('Error deleting structured data:', error);
      message.error('Failed to delete structured data');
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  const handlePreview = (record: StructuredDataItem) => {
    Modal.info({
      title: `${record.type} Schema Preview`,
      width: 800,
      content: (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {JSON.stringify(JSON.parse(record.jsonData), null, 2)}
        </pre>
      )
    });
  };

  const columns = [
    {
      title: 'Schema Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          <CodeOutlined />
          <Text code>@{type}</Text>
        </Space>
      )
    },
    {
      title: 'Page',
      dataIndex: 'page',
      key: 'page',
      render: (page: string) => (
        <Text style={{ fontFamily: 'monospace' }}>{page}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: StructuredDataItem) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            title="Preview Schema"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit Schema"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Structured Data',
                content: `Are you sure you want to delete the ${record.type} schema?`,
                onOk: () => handleDelete(record.id)
              });
            }}
            title="Delete Schema"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="structured-data-page">
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: '0 0 8px 0' }}>
                Structured Data Management
              </Title>
              <Text type="secondary">
                Create and manage Schema.org JSON-LD structured data for enhanced search engine understanding
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Create New Schema
            </Button>
          </div>
        </Col>

        <Col span={24}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'manage',
                  label: (
                    <Space>
                      <CodeOutlined />
                      Manage Schemas
                    </Space>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={structuredData}
                      loading={loading}
                      rowKey="id"
                      pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} of ${total} schemas`
                      }}
                      locale={{
                        emptyText: 'No structured data configured yet. Click "Create New Schema" to get started.'
                      }}
                    />
                  )
                },
                {
                  key: 'create',
                  label: (
                    <Space>
                      <FileTextOutlined />
                      Schema Builder
                    </Space>
                  ),
                  children: (
                    <StructuredDataManager
                      onSave={handleSave}
                      showSaveButton={true}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Edit/Create Modal */}
      <Modal
        title={editingRecord ? 'Edit Structured Data' : 'Create Structured Data'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        destroyOnHidden
      >
        <StructuredDataManager
          initialJson={editingRecord ? editingRecord.jsonData : ''}
          onSave={handleSave}
          showSaveButton={true}
        />
      </Modal>
    </div>
  );
};

export default StructuredDataPage;
