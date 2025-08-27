'use client';

import React, { useState } from 'react';
import { 
  Card,
  Radio,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Button,
  Tooltip,
  Tag
} from 'antd';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  AppleOutlined,
  AndroidOutlined,
  WindowsOutlined,
  ChromeOutlined
} from '@ant-design/icons';
import { FaviconSet } from './utils/favicon-utils';

const { Text, Title } = Typography;

interface FaviconPreviewProps {
  faviconSet: FaviconSet;
  mode: 'browser' | 'mobile' | 'pwa';
  siteName?: string;
}

interface BrowserTabPreviewProps {
  favicon?: string;
  title: string;
  url?: string;
  browserType: 'chrome' | 'firefox' | 'safari' | 'edge';
}

interface MobileIconPreviewProps {
  favicon?: string;
  appName: string;
  platform: 'ios' | 'android';
}

interface PWAPreviewProps {
  favicon?: string;
  appName: string;
  shortName: string;
}

// Browser Tab Preview Component
const BrowserTabPreview: React.FC<BrowserTabPreviewProps> = ({ 
  favicon, 
  title, 
  url = "https://resumeflex.com", 
  browserType 
}) => {
  const getBrowserColor = () => {
    switch (browserType) {
      case 'chrome': return '#4285f4';
      case 'firefox': return '#ff9500';
      case 'safari': return '#007aff';
      case 'edge': return '#0078d4';
      default: return '#666';
    }
  };

  const getBrowserIcon = () => {
    switch (browserType) {
      case 'chrome': return <ChromeOutlined />;
      case 'firefox': return '🦊';
      case 'safari': return '🧭';
      case 'edge': return '🌐';
      default: return <ChromeOutlined />;
    }
  };

  return (
    <div style={{ 
      border: '2px solid #e8e8e8', 
      borderRadius: '8px', 
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Browser Header */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '8px 12px', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27ca3f' }} />
        </div>
        <Text style={{ fontSize: '11px', color: getBrowserColor() }}>
          {getBrowserIcon()} {browserType.charAt(0).toUpperCase() + browserType.slice(1)}
        </Text>
      </div>

      {/* Tab Bar */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e8e8e8',
        padding: '0'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: '#fff',
          borderBottom: '2px solid ' + getBrowserColor(),
          minWidth: '200px',
          fontSize: '12px',
          gap: '6px'
        }}>
          {favicon && (
            <img 
              src={favicon} 
              alt="Favicon" 
              width="16" 
              height="16" 
              style={{ flexShrink: 0 }}
            />
          )}
          <span style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            maxWidth: '150px'
          }}>
            {title}
          </span>
          <span style={{ color: '#999', fontSize: '10px' }}>×</span>
        </div>
      </div>

      {/* Address Bar */}
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {favicon && (
          <img 
            src={favicon} 
            alt="Favicon" 
            width="16" 
            height="16"
            style={{ flexShrink: 0 }}
          />
        )}
        <div style={{ 
          flex: 1, 
          backgroundColor: '#fff', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          color: '#666'
        }}>
          {url}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px', minHeight: '80px', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: '12px', color: '#999' }}>
          Page content would appear here...
        </Text>
      </div>
    </div>
  );
};

// Mobile Icon Preview Component
const MobileIconPreview: React.FC<MobileIconPreviewProps> = ({ 
  favicon, 
  appName, 
  platform 
}) => {
  const getBackgroundGradient = () => {
    if (platform === 'ios') {
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else {
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }
  };

  const getIconBorderRadius = () => {
    return platform === 'ios' ? '18px' : '12px';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '280px',
        height: '480px',
        background: getBackgroundGradient(),
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        margin: '0 auto'
      }}>
        {/* Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          <span>9:41</span>
          <span>
            {platform === 'ios' ? (
              <>📶 📶 📶 🔋</>
            ) : (
              <>📶 📲 🔋</>
            )}
          </span>
        </div>

        {/* App Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          justifyItems: 'center'
        }}>
          {/* Your App Icon */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: getIconBorderRadius(),
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              marginBottom: '4px',
              overflow: 'hidden'
            }}>
              {favicon ? (
                <img 
                  src={favicon} 
                  alt={appName} 
                  width="48" 
                  height="48"
                  style={{ borderRadius: getIconBorderRadius() }}
                />
              ) : (
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: getIconBorderRadius()
                }} />
              )}
            </div>
            <Text style={{ 
              color: '#fff', 
              fontSize: '10px', 
              textAlign: 'center',
              display: 'block',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {appName.length > 8 ? appName.substring(0, 8) + '...' : appName}
            </Text>
          </div>

          {/* Dummy Apps */}
          {[
            { name: 'Settings', color: '#8E8E93' },
            { name: 'Camera', color: '#8E8E93' },
            { name: 'Photos', color: '#FF9500' },
            { name: 'Maps', color: '#007AFF' },
            { name: 'Clock', color: '#FF3B30' },
            { name: 'Weather', color: '#5AC8FA' }
          ].map((app, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: getIconBorderRadius(),
                backgroundColor: app.color,
                marginBottom: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }} />
              <Text style={{ 
                color: '#fff', 
                fontSize: '10px',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                {app.name}
              </Text>
            </div>
          ))}
        </div>

        {/* Dock (iOS only) */}
        {platform === 'ios' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '16px',
            padding: '8px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            {['📞', '✉️', '🌐', '🎵'].map((emoji, index) => (
              <div key={index} style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Tag icon={platform === 'ios' ? <AppleOutlined /> : <AndroidOutlined />}>
          {platform.toUpperCase()} Homescreen
        </Tag>
      </div>
    </div>
  );
};

// PWA Preview Component
const PWAPreviewComponent: React.FC<PWAPreviewProps> = ({ 
  favicon, 
  appName, 
  shortName 
}) => {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Desktop PWA Window */}
      <div style={{
        width: '320px',
        height: '200px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* PWA Title Bar */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '8px 12px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {favicon && (
            <img 
              src={favicon} 
              alt={appName} 
              width="16" 
              height="16"
            />
          )}
          <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {shortName || appName}
          </Text>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27ca3f' }} />
          </div>
        </div>

        {/* PWA Content */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fff',
          height: 'calc(100% - 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {favicon && (
            <img 
              src={favicon} 
              alt={appName} 
              width="48" 
              height="48"
              style={{ marginBottom: '12px' }}
            />
          )}
          <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
            {appName}
          </Title>
          <Text style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            Progressive Web App
          </Text>
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Tag icon={<DesktopOutlined />}>
          PWA Desktop App
        </Tag>
      </div>
    </div>
  );
};

// Main Favicon Preview Component
const FaviconPreview: React.FC<FaviconPreviewProps> = ({ 
  faviconSet, 
  mode, 
  siteName = "resumeflex" 
}) => {
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'firefox' | 'safari' | 'edge'>('chrome');
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');

  // Get appropriate favicon for context
  const getBrowserFavicon = () => faviconSet['favicon-32x32'] || faviconSet['favicon-16x16'];
  const getMobileFavicon = (platform: 'ios' | 'android') => {
    if (platform === 'ios') {
      return faviconSet['apple-touch-icon-180x180'] || 
             faviconSet['apple-touch-icon-152x152'] || 
             faviconSet['apple-touch-icon-120x120'];
    } else {
      return faviconSet['android-chrome-192x192'] || 
             faviconSet['android-chrome-512x512'] ||
             faviconSet['android-chrome-144x144'];
    }
  };
  const getPWAFavicon = () => faviconSet['android-chrome-512x512'] || faviconSet['android-chrome-192x192'];

  const renderBrowserPreviews = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Text strong>Browser Preview</Text>
        <div style={{ marginTop: '8px' }}>
          <Radio.Group 
            value={selectedBrowser} 
            onChange={e => setSelectedBrowser(e.target.value)}
            size="small"
          >
            <Radio.Button value="chrome">
              <ChromeOutlined /> Chrome
            </Radio.Button>
            <Radio.Button value="firefox">
              🦊 Firefox
            </Radio.Button>
            <Radio.Button value="safari">
              🧭 Safari
            </Radio.Button>
            <Radio.Button value="edge">
              🌐 Edge
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <BrowserTabPreview 
        favicon={getBrowserFavicon()}
        title={`${siteName} - Professional Portfolio`}
        browserType={selectedBrowser}
      />
    </div>
  );

  const renderMobilePreviews = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Text strong>Mobile Homescreen Preview</Text>
        <div style={{ marginTop: '8px' }}>
          <Radio.Group 
            value={selectedPlatform} 
            onChange={e => setSelectedPlatform(e.target.value)}
            size="small"
          >
            <Radio.Button value="ios">
              <AppleOutlined /> iOS
            </Radio.Button>
            <Radio.Button value="android">
              <AndroidOutlined /> Android
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <MobileIconPreview 
        favicon={getMobileFavicon(selectedPlatform)}
        appName={siteName}
        platform={selectedPlatform}
      />
    </div>
  );

  const renderPWAPreviews = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Text strong>Progressive Web App Preview</Text>
      </div>

      <PWAPreviewComponent 
        favicon={getPWAFavicon()}
        appName={siteName}
        shortName={siteName.length > 10 ? siteName.substring(0, 10) : siteName}
      />
    </div>
  );

  return (
    <div>
      {mode === 'browser' && renderBrowserPreviews()}
      {mode === 'mobile' && renderMobilePreviews()}
      {mode === 'pwa' && renderPWAPreviews()}
      
      {/* Preview Stats */}
      <Card size="small" style={{ marginTop: '16px' }}>
        <Title level={5} style={{ margin: '0 0 12px 0' }}>Preview Information</Title>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Browser Favicon
              </Text>
              <div style={{ margin: '8px 0' }}>
                {getBrowserFavicon() ? (
                  <img src={getBrowserFavicon()} alt="Browser favicon" width="24" height="24" />
                ) : (
                  <Text type="secondary">No favicon</Text>
                )}
              </div>
              <Text style={{ fontSize: '10px' }}>
                {getBrowserFavicon() ? '32×32 PNG' : 'Missing'}
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Mobile Icon
              </Text>
              <div style={{ margin: '8px 0' }}>
                {getMobileFavicon('ios') ? (
                  <img src={getMobileFavicon('ios')} alt="Mobile icon" width="24" height="24" style={{ borderRadius: '6px' }} />
                ) : (
                  <Text type="secondary">No icon</Text>
                )}
              </div>
              <Text style={{ fontSize: '10px' }}>
                {getMobileFavicon('ios') ? '180×180 PNG' : 'Missing'}
              </Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                PWA Icon
              </Text>
              <div style={{ margin: '8px 0' }}>
                {getPWAFavicon() ? (
                  <img src={getPWAFavicon()} alt="PWA icon" width="24" height="24" style={{ borderRadius: '4px' }} />
                ) : (
                  <Text type="secondary">No icon</Text>
                )}
              </div>
              <Text style={{ fontSize: '10px' }}>
                {getPWAFavicon() ? '512×512 PNG' : 'Missing'}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FaviconPreview;
