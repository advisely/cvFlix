'use client';

import { useState } from 'react';
import { Button, Modal, List, message, Spin } from 'antd';

const CleanupBlobUrls = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrls, setBlobUrls] = useState<any[]>([]);

  const findBlobUrls = async () => {
    try {
      const response = await fetch('/api/cleanup-blob-urls');
      const data = await response.json();
      setBlobUrls(data.items || []);
    } catch (error) {
      message.error('Failed to find blob URLs');
    }
  };

  const cleanupBlobUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cleanup-blob-urls', {
        method: 'DELETE'
      });
      const data = await response.json();
      message.success(`Cleaned up ${data.deletedCount} broken blob URLs`);
      setBlobUrls([]);
      setVisible(false);
    } catch (error) {
      message.error('Failed to cleanup blob URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setVisible(true);
    findBlobUrls();
  };

  return (
    <>
      <Button 
        type="dashed" 
        danger
        onClick={handleOpen}
        style={{ marginLeft: 8 }}
      >
        Clean Up Broken Images
      </Button>

      <Modal
        title="Clean Up Broken Blob URLs"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="cleanup" 
            type="primary" 
            danger 
            onClick={cleanupBlobUrls}
            loading={loading}
            disabled={blobUrls.length === 0}
          >
            Clean Up {blobUrls.length} Broken URLs
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          <p>Found {blobUrls.length} broken blob URLs from the old system:</p>
          <List
            size="small"
            dataSource={blobUrls}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`Experience ID: ${item.experienceId}`}
                  description={`Broken URL: ${item.url.substring(0, 50)}...`}
                />
              </List.Item>
            )}
          />
          <p style={{ color: '#ff4d4f', marginTop: 16 }}>
            <strong>Note:</strong> This will permanently remove these broken image records from the database. 
            You'll need to re-upload actual images for these experiences.
          </p>
        </Spin>
      </Modal>
    </>
  );
};

export default CleanupBlobUrls;
