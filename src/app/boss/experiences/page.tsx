
'use client'

import { Button, Table } from 'antd';

const ExperiencesPage = () => {
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
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
        Add Experience
      </Button>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
};

export default ExperiencesPage;
