'use client'

import { Button, Table, Modal, Form, Input, Upload, message, Image } from 'antd';
import { useEffect, useState } from 'react';
import { Company } from '@prisma/client';
import { UploadOutlined, BankOutlined } from '@ant-design/icons';
import MultilingualFormTabs from '@/components/MultilingualFormTabs';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Company | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      message.error('Failed to load companies');
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Company) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      nameFr: record.nameFr,
      logoUrl: record.logoUrl,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/companies/${editingRecord.id}` : '/api/companies';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await fetchCompanies();
        setIsModalVisible(false);
        message.success(`Company ${editingRecord ? 'updated' : 'created'} successfully!`);
      } else {
        const errorData = await response.json();
        message.error(`Failed to save company: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save company:', error);
      message.error('Failed to save company');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchCompanies();
        message.success('Company deleted successfully!');
      } else {
        const errorData = await response.json();
        message.error(`Failed to delete company: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      message.error('Failed to delete company');
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      form.setFieldsValue({ logoUrl: result.url });
      message.success('Logo uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload logo');
    }

    return false; // Prevent default upload behavior
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 80,
      render: (logoUrl: string) => (
        logoUrl ? (
          <Image
            src={logoUrl}
            alt="Company logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain', borderRadius: 4 }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMxOC4zNDMxIDIwIDE3IDIxLjM0MzEgMTcgMjNWMjdDMTcgMjguNjU2OSAxOC4zNDMxIDMwIDIwIDMwSDIzQzI0LjY1NjkgMzAgMjYgMjguNjU2OSAyNiAyN1YyM0MyNiAyMS4zNDMxIDI0LjY1NjkgMjAgMjMgMjBIMjBaIiBmaWxsPSIjQzRDNEM0Ii8+CjxwYXRoIGQ9Ik0xNyAxN0MxNyAxNS4zNDMxIDE4LjM0MzEgMTQgMjAgMTRIMjNDMjQuNjU2OSAxNCAyNiAxNS4zNDMxIDI2IDE3VjE4SDI2LjVDMjcuMzI4NCAxOCAyOCAxOC42NzE2IDI4IDE5LjVWMjAuNUMyOCAyMS4zMjg0IDI3LjMyODQgMjIgMjYuNSAyMkgyNlYyM0MyNiAyNC42NTY5IDI0LjY1NjkgMjYgMjMgMjZIMjBDMTguMzQzMSAyNiAxNyAyNC42NTY5IDE3IDIzVjIySDEzLjVDMTIuNjcxNiAyMiAxMiAyMS4zMjg0IDEyIDIwLjVWMTkuNUMxMiAxOC42NzE2IDEyLjY3MTYgMTggMTMuNSAxOEgxN1YxN1oiIGZpbGw9IiNDNEM0QzQiLz4KPC9zdmc+"
          />
        ) : (
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4
          }}>
            <BankOutlined style={{ color: '#c4c4c4', fontSize: 16 }} />
          </div>
        )
      ),
    },
    {
      title: 'Company Name (English)',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Company, b: Company) => a.name.localeCompare(b.name),
      showSorterTooltip: false
    },
    {
      title: 'Company Name (French)',
      dataIndex: 'nameFr',
      key: 'nameFr',
      sorter: (a: Company, b: Company) => a.nameFr.localeCompare(b.nameFr),
      showSorterTooltip: false
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Company) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Companies</h1>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            Manage company information for experiences and highlights
          </p>
        </div>
        <Button onClick={handleAdd} type="primary" icon={<BankOutlined />}>
          Add Company
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={companies}
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
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} companies`
        }}
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1890ff' }} />
            <span>{editingRecord ? 'Edit Company' : 'Add Company'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          <MultilingualFormTabs
            form={form}
            englishFields={['name']}
            frenchFields={['nameFr']}
          >
            {(language) => (
              <Form.Item
                name={language === 'en' ? 'name' : 'nameFr'}
                label={`Company Name (${language === 'en' ? 'English' : 'Français'})`}
                rules={[{ required: true, message: `Please enter the company name in ${language === 'en' ? 'English' : 'French'}` }]}
              >
                <Input placeholder={`Enter company name in ${language === 'en' ? 'English' : 'French'}`} />
              </Form.Item>
            )}
          </MultilingualFormTabs>

          <Form.Item name="logoUrl" label="Company Logo">
            <div>
              <Upload
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
              <Form.Item name="logoUrl" noStyle>
                <Input
                  placeholder="Or enter logo URL directly"
                  style={{ marginTop: 8 }}
                />
              </Form.Item>
              {form.getFieldValue('logoUrl') && (
                <div style={{ marginTop: 8 }}>
                  <Image
                    src={form.getFieldValue('logoUrl')}
                    alt="Logo preview"
                    width={60}
                    height={60}
                    style={{ objectFit: 'contain', borderRadius: 4, border: '1px solid #d9d9d9' }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAzMEMyNy41MTQ3IDMwIDI1LjUgMzIuMDE0NyAyNS41IDM0LjVWNDAuNUMyNS41IDQyLjk4NTMgMjcuNTE0NyA0NSAzMCA0NUgzNC41QzM2Ljk4NTMgNDUgMzkgNDIuOTg1MyAzOSA0MC41VjM0LjVDMzkgMzIuMDE0NyAzNi45ODUzIDMwIDM0LjUgMzBIMzBaIiBmaWxsPSIjQzRDNEM0Ii8+CjxwYXRoIGQ9Ik0yNS41IDI1LjVDMjUuNSAyMy4wMTQ3IDI3LjUxNDcgMjEgMzAgMjFIMzQuNUMzNi45ODUzIDIxIDM5IDIzLjAxNDcgMzkgMjUuNVYyN0gzOS43NUMzOS43NSAyNy44Mjg0IDQwLjQyMTYgMjguNSA0MS4yNSAyOC41VjMwLjc1QzQxLjI1IDMxLjU3ODQgNDAuNTc4NCAzMi4yNSAzOS43NSAzMi4yNUgzOVYzNC41QzM5IDM2Ljk4NTMgMzYuOTg1MyAzOSAzNC41IDM5SDMwQzI3LjUxNDcgMzkgMjUuNSAzNi45ODUzIDI1LjUgMzQuNVYzMi4yNUgyMC4yNUMxOS40MjE2IDMyLjI1IDE4Ljc1IDMxLjU3ODQgMTguNzUgMzAuNzVWMjguNUMxOC43NSAyNy42NzE2IDE5LjQyMTYgMjcgMjAuMjUgMjdIMjUuNVYyNS41WiIgZmlsbD0iI0M0QzRDNCIvPgo8L3N2Zz4K"
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
