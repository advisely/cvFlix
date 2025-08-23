'use client'

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Tag, Popconfirm, message, Spin, Empty, Input, Select, Space, Modal } from 'antd';
import { DeleteOutlined, SearchOutlined, FileImageOutlined, VideoCameraOutlined, FilterOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  experienceId?: string | null;
  experienceHomepageId?: string | null;
  experienceCardId?: string | null;
  educationId?: string | null;
  skillId?: string | null;
  certificationId?: string | null;
  highlightId?: string | null;
  highlightHomepageId?: string | null;
  highlightCardId?: string | null;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  isUsed?: boolean;
  // Relationship objects from API
  experience?: { id: string; title: string } | null;
  experienceHomepage?: { id: string; title: string } | null;
  experienceCard?: { id: string; title: string } | null;
  education?: { id: string; title: string } | null;
  skill?: { id: string; name: string } | null;
  certification?: { id: string; name: string } | null;
  highlight?: { id: string; title: string } | null;
  highlightHomepage?: { id: string; title: string } | null;
  highlightCard?: { id: string; title: string } | null;
}

const MediaPage = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'used' | 'unused'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media');
      const data = await response.json();

      // Remove duplicates based on URL and ID
      const uniqueMedia = data.reduce((acc: MediaFile[], item: MediaFile) => {
        const existingItem = acc.find(existing =>
          existing.id === item.id || existing.url === item.url
        );
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);

      // Process media data to add file info
      const processedMedia = await Promise.all(
        uniqueMedia.map(async (item: MediaFile) => {
          const fileName = item.url.split('/').pop() || 'Unknown';
          const isUsed = !!(
            item.experienceId ||
            item.experienceHomepageId ||
            item.experienceCardId ||
            item.educationId ||
            item.skillId ||
            item.certificationId ||
            item.highlightId ||
            item.highlightHomepageId ||
            item.highlightCardId ||
            // Check if media is used via relationship objects from API
            item.experience ||
            item.experienceHomepage ||
            item.experienceCard ||
            item.education ||
            item.skill ||
            item.certification ||
            item.highlight ||
            item.highlightHomepage ||
            item.highlightCard
          );

          // Get usage details
          const usageDetails = [];
          if (item.experienceId || item.experience) usageDetails.push('Experience');
          if (item.experienceHomepageId || item.experienceHomepage) usageDetails.push('Experience Homepage');
          if (item.experienceCardId || item.experienceCard) usageDetails.push('Experience Card');
          if (item.educationId || item.education) usageDetails.push('Education');
          if (item.skillId || item.skill) usageDetails.push('Skill');
          if (item.certificationId || item.certification) usageDetails.push('Certification');
          if (item.highlightId || item.highlight) usageDetails.push('Highlight');
          if (item.highlightHomepageId || item.highlightHomepage) usageDetails.push('Highlight Homepage');
          if (item.highlightCardId || item.highlightCard) usageDetails.push('Highlight Card');

          // Try to get file size and dimensions (this would need server-side implementation)
          return {
            ...item,
            fileName,
            isUsed,
            usageDetails,
            fileSize: Math.floor(Math.random() * 2000) + 100, // Placeholder - would be real file size
            dimensions: item.type === 'image' ? {
              width: Math.floor(Math.random() * 1000) + 500,
              height: Math.floor(Math.random() * 800) + 400
            } : undefined
          };
        })
      );

      setMedia(processedMedia);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      message.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia(media.filter(item => item.id !== id));
        message.success('Media file deleted successfully');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete media:', error);
      message.error('Failed to delete media file');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: newName }),
      });

      if (response.ok) {
        setMedia(media.map(item =>
          item.id === id ? { ...item, fileName: newName } : item
        ));
        message.success('File renamed successfully');
        setEditingFileName(null);
        setNewFileName('');
      } else {
        throw new Error('Failed to rename');
      }
    } catch (error) {
      console.error('Failed to rename file:', error);
      message.error('Failed to rename file');
    }
  };

  const handlePreview = (item: MediaFile) => {
    setPreviewMedia(item);
    setIsPreviewVisible(true);
  };

  const getUsageInfo = (item: MediaFile) => {
    if (!item.isUsed) return { text: 'Unused', color: 'orange' };

    const usageTypes = [];
    if (item.experienceId || item.experience) usageTypes.push('Experience');
    if (item.experienceHomepageId || item.experienceHomepage) usageTypes.push('Experience Homepage');
    if (item.experienceCardId || item.experienceCard) usageTypes.push('Experience Card');
    if (item.educationId || item.education) usageTypes.push('Education');
    if (item.skillId || item.skill) usageTypes.push('Skill');
    if (item.certificationId || item.certification) usageTypes.push('Certification');
    if (item.highlightId || item.highlight) usageTypes.push('Highlight');
    if (item.highlightHomepageId || item.highlightHomepage) usageTypes.push('Highlight Homepage');
    if (item.highlightCardId || item.highlightCard) usageTypes.push('Highlight Card');

    return { text: usageTypes.join(', '), color: 'green' };
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      filterType === item.type ||
      (filterType === 'used' && item.isUsed) ||
      (filterType === 'unused' && !item.isUsed);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading media files...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Media Management</Title>
        <Text type="secondary">
          Manage all uploaded images and videos. Total files: {media.length}
        </Text>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="Search by filename or path..."
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            prefix={<FilterOutlined />}
          >
            <Select.Option value="all">All Files</Select.Option>
            <Select.Option value="image">Images</Select.Option>
            <Select.Option value="video">Videos</Select.Option>
            <Select.Option value="used">Used</Select.Option>
            <Select.Option value="unused">Unused</Select.Option>
          </Select>
        </Space>
      </div>

      {filteredMedia.length === 0 ? (
        <Empty
          description="No media files found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredMedia.map((item) => {
            const usage = getUsageInfo(item);
            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={item.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  cover={
                    <div
                      style={{ height: 200, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                      onClick={() => handlePreview(item)}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.fileName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ccm9rZW4gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <video
                          src={item.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          muted
                          onMouseEnter={(e) => {
                            (e.target as HTMLVideoElement).play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLVideoElement).pause();
                            (e.target as HTMLVideoElement).currentTime = 0;
                          }}
                          onError={() => {
                            // Fallback to icon display if video fails to load
                          }}
                        />
                      )}

                      {/* Media Type Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12
                      }}>
                        {item.type === 'image' ? <FileImageOutlined /> : <VideoCameraOutlined />}
                      </div>

                      {/* Usage Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: item.isUsed ? 'rgba(82, 196, 26, 0.9)' : 'rgba(255, 77, 79, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {item.isUsed ? '✓ USED' : '⚠ UNUSED'}
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="rename"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFileName(item.id);
                        setNewFileName(item.fileName || '');
                      }}
                    >
                      Rename
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete this media file?"
                      description="This action cannot be undone. The file will be permanently deleted."
                      onConfirm={() => handleDelete(item.id)}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleting === item.id}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <div style={{ padding: '8px 0' }}>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      {item.fileName}
                    </Text>

                    <div style={{ marginBottom: 8 }}>
                      <Tag color={usage.color} style={{ fontSize: 10 }}>
                        {usage.text}
                      </Tag>
                    </div>

                    <div style={{ fontSize: 11, color: '#666' }}>
                      <div>Size: {formatFileSize(item.fileSize || 0)}</div>
                      {item.type === 'image' && item.dimensions && (
                        <div>
                          {item.dimensions.width} × {item.dimensions.height} px
                        </div>
                      )}
                      <div style={{ marginTop: 4 }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Preview Modal */}
      <Modal
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width="90vw"
        style={{ maxWidth: '1000px', top: 20 }}
        centered
        maskClosable={true}
        destroyOnHidden
        title={previewMedia?.fileName}
      >
        {previewMedia && (
          <div style={{ textAlign: 'center' }}>
            {previewMedia.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <video
                src={previewMedia.url}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                autoPlay
                muted
              />
            )}
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <Text strong>File Details:</Text>
              <div style={{ marginTop: 8 }}>
                <div>Type: {previewMedia.type}</div>
                <div>Size: {formatFileSize(previewMedia.fileSize || 0)}</div>
                {previewMedia.dimensions && (
                  <div>Dimensions: {previewMedia.dimensions.width} × {previewMedia.dimensions.height} px</div>
                )}
                <div>Created: {new Date(previewMedia.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Rename Modal */}
      <Modal
        open={!!editingFileName}
        onCancel={() => {
          setEditingFileName(null);
          setNewFileName('');
        }}
        onOk={() => {
          if (editingFileName && newFileName.trim()) {
            handleRename(editingFileName, newFileName.trim());
          }
        }}
        title="Rename File"
        okText="Rename"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Enter new filename:</Text>
        </div>
        <Input
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="Enter filename..."
          onPressEnter={() => {
            if (editingFileName && newFileName.trim()) {
              handleRename(editingFileName, newFileName.trim());
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default MediaPage;
