
'use client'

import { Button, Table } from 'antd';

const CertificationsPage = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Issuer', dataIndex: 'issuer', key: 'issuer' },
    { title: 'Issue Date', dataIndex: 'issueDate', key: 'issueDate' },
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
        Add Certification
      </Button>
      <Table columns={columns} dataSource={[]} />
    </div>
  );
};

export default CertificationsPage;
