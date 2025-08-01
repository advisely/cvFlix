
'use client'

import { Button, Table, Modal, Form, Input, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import { Education } from '@prisma/client';
import dayjs from 'dayjs';

const EducationPage = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Education | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchEducation = async () => {
      const response = await fetch('/api/education');
      const data = await response.json();
      setEducation(data);
    };

    fetchEducation();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/education/${editingRecord.id}` : '/api/education';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate ? values.endDate.toISOString() : null,
        }),
      });

      if (response.ok) {
        const savedEducation = await response.json();
        if (editingRecord) {
          setEducation(education.map((edu) => (edu.id === savedEducation.id ? savedEducation : edu)));
        } else {
          setEducation([...education, savedEducation]);
        }
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to save education:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: Education) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEducation(education.filter(edu => edu.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete education:', error);
    }
  };

  const columns = [
    { title: 'Institution', dataIndex: 'institution', key: 'institution' },
    { title: 'Degree', dataIndex: 'degree', key: 'degree' },
    { title: 'Field of Study', dataIndex: 'field', key: 'field' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Present' },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Education) => (
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
        Add Education
      </Button>
      <Table columns={columns} dataSource={education} rowKey="id" />
      <Modal title={editingRecord ? 'Edit Education' : 'Add Education'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="institution" label="Institution" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="field" label="Field of Study" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EducationPage;
