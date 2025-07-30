
'use client'

import { Button, Table } from 'antd';

const SkillsPage = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <span>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }}>
        Add Skill
      </Button>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
};

export default SkillsPage;
