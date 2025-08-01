
'use client'

import { Button, Table, Modal, Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Skill } from '@prisma/client';

const SkillsPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Skill | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSkills = async () => {
      const response = await fetch('/api/skills');
      const data = await response.json();
      setSkills(data);
    };

    fetchSkills();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = editingRecord ? `/api/skills/${editingRecord.id}` : '/api/skills';
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const savedSkill = await response.json();
        if (editingRecord) {
          setSkills(skills.map((skill) => (skill.id === savedSkill.id ? savedSkill : skill)));
        } else {
          setSkills([...skills, savedSkill]);
        }
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: Skill) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSkills(skills.filter(skill => skill.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Skill) => (
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
        Add Skill
      </Button>
      <Table columns={columns} dataSource={skills} rowKey="id" />
      <Modal title={editingRecord ? 'Edit Skill' : 'Add Skill'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Frontend">Frontend</Select.Option>
              <Select.Option value="Backend">Backend</Select.Option>
              <Select.Option value="Database">Database</Select.Option>
              <Select.Option value="DevOps">DevOps</Select.Option>
              <Select.Option value="Tools">Tools</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillsPage;
