
'use client'

import { Button, Table, Modal, Form, Input, DatePicker, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Company, Experience } from '@prisma/client';
import { ExperienceWithCompany } from './types';
import dayjs from 'dayjs';

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState<ExperienceWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExperienceWithCompany | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      const [expResponse, compResponse] = await Promise.all([
        fetch('/api/experiences'),
        fetch('/api/companies')
      ]);
      const expData = await expResponse.json();
      const compData = await compResponse.json();
      setExperiences(expData);
      setCompanies(compData);
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/experiences/${editingRecord.id}` : '/api/experiences';
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
        const savedExperience = await response.json();
        if (editingRecord) {
          setExperiences(experiences.map((exp) => (exp.id === savedExperience.id ? savedExperience : exp)));
        } else {
          setExperiences([...experiences, savedExperience]);
        }
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to save experience:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: Experience & { company: Company }) => {
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
      const response = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setExperiences(experiences.filter(exp => exp.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', dataIndex: ['company', 'name'], key: 'company' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Present' },
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
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add Experience
      </Button>
      <Table columns={columns} dataSource={experiences} rowKey="id" />
      <Modal title={editingRecord ? 'Edit Experience' : 'Add Experience'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="companyId" label="Company" rules={[{ required: true }]}>
            <Select>
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id}>{company.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
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

export default ExperiencesPage;
