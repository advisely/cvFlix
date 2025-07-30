
'use client'

import { Button, Table } from 'antd';

const EducationPage = () => {
  const columns = [
    { title: 'Institution', dataIndex: 'institution', key: 'institution' },
    { title: 'Degree', dataIndex: 'degree', key: 'degree' },
    { title: 'Field', dataIndex: 'field', key: 'field' },
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
        Add Education
      </Button>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
};

export default EducationPage;
