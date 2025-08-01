
'use client'

import { Button, Table, Modal, Form, Input, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import { Certification } from '@prisma/client';
import dayjs from 'dayjs';

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Certification | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCertifications = async () => {
      const response = await fetch('/api/certifications');
      const data = await response.json();
      setCertifications(data);
    };

    fetchCertifications();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/certifications/${editingRecord.id}` : '/api/certifications';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          issueDate: values.issueDate.toISOString(),
        }),
      });

      if (response.ok) {
        const savedCertification = await response.json();
        if (editingRecord) {
          setCertifications(certifications.map((cert) => (cert.id === savedCertification.id ? savedCertification : cert)));
        } else {
          setCertifications([...certifications, savedCertification]);
        }
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to save certification:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: Certification) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      issueDate: dayjs(record.issueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCertifications(certifications.filter(cert => cert.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Issuer', dataIndex: 'issuer', key: 'issuer' },
    { title: 'Issue Date', dataIndex: 'issueDate', key: 'issueDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Certification) => (
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
        Add Certification
      </Button>
      <Table columns={columns} dataSource={certifications} rowKey="id" />
      <Modal title={editingRecord ? 'Edit Certification' : 'Add Certification'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="issuer" label="Issuer" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="issueDate" label="Issue Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificationsPage;
