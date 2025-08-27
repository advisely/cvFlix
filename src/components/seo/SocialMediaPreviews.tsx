'use client';

import React, { useState } from 'react';
import {
  Card,
  Space,
  Typography,
  Avatar,
  Button,
  Divider,
  Radio,
  Badge
} from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  MessageOutlined,
  UserOutlined,
  HeartOutlined,
  RetweetOutlined,
  ShareAltOutlined,
  LikeOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// Interfaces
interface OpenGraphTags {
  'og:title': string;
  'og:type': string;
  'og:image': string;
  'og:url': string;
  'og:description': string;
  'og:site_name': string;
  'og:locale': string;
  'og:image:alt'?: string;
  'article:author'?: string;
  'article:published_time'?: string;
}

interface TwitterCardConfig {
  'twitter:card': string;
  'twitter:site': string;
  'twitter:creator': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:image:alt': string;
}

interface SocialMediaPreviewsProps {
  ogTags: OpenGraphTags;
  twitterTags: TwitterCardConfig;
  mode?: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'slack' | 'discord' | 'all';
  showEngagement?: boolean;
}


const SocialMediaPreviews: React.FC<SocialMediaPreviewsProps> = ({
  ogTags,
  twitterTags,
  mode = 'all',
  showEngagement = true
}) => {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(mode === 'all' ? 'facebook' : mode);

  // Sample engagement data
  const sampleEngagement = {
    facebook: { likes: 142, shares: 23, comments: 8 },
    twitter: { likes: 89, shares: 34, comments: 12 },
    linkedin: { likes: 67, shares: 19, comments: 5 }
  };

  // Extract domain from URL for display
  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '').toUpperCase();
    } catch {
      return 'EXAMPLE.COM';
    }
  };

  // Facebook Preview Component
  const FacebookPreview: React.FC = () => {
    const domain = extractDomain(ogTags['og:url']);
    const engagement = sampleEngagement.facebook;

    return (
      <Card 
        className="social-preview facebook-preview"
        style={{ 
          maxWidth: previewDevice === 'mobile' ? 350 : 500, 
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e4e6ea'
        }}
      >
        {/* Post Header */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1877F2' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#050505' }}>
              ResumeFlex Portfolio
            </div>
            <div style={{ fontSize: '12px', color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClockCircleOutlined style={{ fontSize: '10px' }} />
              2 hours ago · <span style={{ fontSize: '10px' }}>🌐</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div style={{ marginBottom: 12, fontSize: '14px', color: '#050505', lineHeight: 1.5 }}>
          Check out my latest portfolio update! 🚀
        </div>

        {/* OpenGraph Card */}
        <div style={{ 
          border: '1px solid #e4e6ea', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          {ogTags['og:image'] && (
            <div style={{ position: 'relative' }}>
              <img 
                src={ogTags['og:image']} 
                alt={ogTags['og:image:alt'] || 'Preview image'}
                style={{ 
                  width: '100%', 
                  height: previewDevice === 'mobile' ? 180 : 250, 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {ogTags['og:type'] === 'video' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  padding: '12px',
                  color: 'white'
                }}>
                  <PlayCircleOutlined style={{ fontSize: '24px' }} />
                </div>
              )}
            </div>
          )}
          
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: '12px', color: '#65676b', textTransform: 'uppercase', marginBottom: 4 }}>
              {domain}
            </div>
            
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#1c1e21', 
              marginBottom: 4,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {ogTags['og:title']}
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#65676b', 
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {ogTags['og:description']}
            </div>
          </div>
        </div>

        {/* Engagement */}
        {showEngagement && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0',
              fontSize: '12px',
              color: '#65676b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#1877F2' }}>👍</span>
                <span style={{ color: '#f33e58' }}>❤️</span>
                <span>{engagement.likes}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span>{engagement.comments} comments</span>
                <span>{engagement.shares} shares</span>
              </div>
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="text" icon={<LikeOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>
                Like
              </Button>
              <Button type="text" icon={<MessageOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>
                Comment
              </Button>
              <Button type="text" icon={<ShareAltOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>
                Share
              </Button>
            </div>
          </>
        )}
      </Card>
    );
  };

  // Twitter Preview Component
  const TwitterPreview: React.FC = () => {
    const cardType = twitterTags['twitter:card'];
    const engagement = sampleEngagement.twitter;

    return (
      <Card 
        className="social-preview twitter-preview"
        style={{ 
          maxWidth: previewDevice === 'mobile' ? 350 : 500,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e1e8ed'
        }}
      >
        {/* Tweet Header */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1DA1F2' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f1419' }}>
                ResumeFlex
              </span>
              <span style={{ fontSize: '14px', color: '#536471' }}>
                @resumeflex
              </span>
              <span style={{ color: '#536471', fontSize: '12px' }}>·</span>
              <span style={{ fontSize: '12px', color: '#536471' }}>2h</span>
            </div>
            
            {/* Tweet Content */}
            <div style={{ fontSize: '14px', color: '#0f1419', lineHeight: 1.5, marginBottom: 12 }}>
              Excited to share my latest portfolio updates! Check out my new projects and experience. 
              What do you think? 🚀 #Portfolio #WebDev
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div style={{ 
          border: '1px solid #e1e8ed', 
          borderRadius: '16px', 
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          marginBottom: 12
        }}>
          {cardType === 'summary_large_image' ? (
            <>
              {twitterTags['twitter:image'] && (
                <div style={{ position: 'relative' }}>
                  <img 
                    src={twitterTags['twitter:image']} 
                    alt={twitterTags['twitter:image:alt']}
                    style={{ 
                      width: '100%', 
                      height: previewDevice === 'mobile' ? 180 : 200, 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              )}
              <div style={{ padding: 12 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#0f1419', 
                  marginBottom: 2,
                  lineHeight: 1.3
                }}>
                  {twitterTags['twitter:title']}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#536471', 
                  lineHeight: 1.4,
                  marginBottom: 2
                }}>
                  {twitterTags['twitter:description']}
                </div>
                <div style={{ fontSize: '12px', color: '#536471' }}>
                  🔗 {extractDomain(ogTags['og:url']).toLowerCase()}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', padding: 12 }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#0f1419', 
                  marginBottom: 2,
                  lineHeight: 1.3
                }}>
                  {twitterTags['twitter:title']}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#536471', 
                  lineHeight: 1.4,
                  marginBottom: 2
                }}>
                  {twitterTags['twitter:description']}
                </div>
                <div style={{ fontSize: '12px', color: '#536471' }}>
                  🔗 {extractDomain(ogTags['og:url']).toLowerCase()}
                </div>
              </div>
              {twitterTags['twitter:image'] && (
                <img 
                  src={twitterTags['twitter:image']} 
                  alt={twitterTags['twitter:image:alt']}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Engagement */}
        {showEngagement && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: '#536471',
            fontSize: '13px'
          }}>
            <Button 
              type="text" 
              icon={<MessageOutlined />} 
              style={{ color: '#536471', fontSize: '13px' }}
            >
              {engagement.comments}
            </Button>
            <Button 
              type="text" 
              icon={<RetweetOutlined />} 
              style={{ color: '#536471', fontSize: '13px' }}
            >
              {engagement.shares}
            </Button>
            <Button 
              type="text" 
              icon={<HeartOutlined />} 
              style={{ color: '#536471', fontSize: '13px' }}
            >
              {engagement.likes}
            </Button>
            <Button 
              type="text" 
              icon={<ShareAltOutlined />} 
              style={{ color: '#536471', fontSize: '13px' }}
            />
          </div>
        )}
      </Card>
    );
  };

  // LinkedIn Preview Component
  const LinkedInPreview: React.FC = () => {
    const engagement = sampleEngagement.linkedin;

    return (
      <Card 
        className="social-preview linkedin-preview"
        style={{ 
          maxWidth: previewDevice === 'mobile' ? 350 : 500,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Post Header */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#0A66C2' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#000000e6' }}>
              Your Name
            </div>
            <div style={{ fontSize: '12px', color: '#00000099' }}>
              Software Developer | Portfolio Showcase
            </div>
            <div style={{ fontSize: '12px', color: '#00000099', display: 'flex', alignItems: 'center', gap: 4 }}>
              2h · <span>🌐</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div style={{ marginBottom: 16, fontSize: '14px', color: '#000000e6', lineHeight: 1.5 }}>
          I&rsquo;m excited to share my updated portfolio showcasing recent projects and professional growth. 
          Always learning and building! 💼
        </div>

        {/* LinkedIn Card */}
        <div style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          {ogTags['og:image'] && (
            <div style={{ position: 'relative' }}>
              <img 
                src={ogTags['og:image']} 
                alt={ogTags['og:image:alt'] || 'Preview image'}
                style={{ 
                  width: '100%', 
                  height: previewDevice === 'mobile' ? 180 : 220, 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          )}
          
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: '12px', color: '#00000099', marginBottom: 4 }}>
              {extractDomain(ogTags['og:url']).toLowerCase()}
            </div>
            
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#000000e6', 
              marginBottom: 8,
              lineHeight: 1.3
            }}>
              {ogTags['og:title']}
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#00000099', 
              lineHeight: 1.4
            }}>
              {ogTags['og:description']}
            </div>
          </div>
        </div>

        {/* Engagement */}
        {showEngagement && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0 8px',
              fontSize: '12px',
              color: '#00000099'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#0A66C2' }}>👍</span>
                <span style={{ color: '#dd5143' }}>❤️</span>
                <span>{engagement.likes}</span>
              </div>
              <div>
                {engagement.comments} comments
              </div>
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button type="text" icon={<LikeOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#00000099' }}>
                Like
              </Button>
              <Button type="text" icon={<MessageOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#00000099' }}>
                Comment
              </Button>
              <Button type="text" icon={<ShareAltOutlined />} style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#00000099' }}>
                Share
              </Button>
            </div>
          </>
        )}
      </Card>
    );
  };

  // WhatsApp Preview Component
  const WhatsAppPreview: React.FC = () => (
    <Card 
      className="social-preview whatsapp-preview"
      style={{ 
        maxWidth: previewDevice === 'mobile' ? 300 : 400,
        backgroundColor: '#e5ddd5',
        border: 'none'
      }}
    >
      <div style={{ 
        backgroundColor: '#dcf8c6', 
        padding: '8px 12px', 
        borderRadius: '8px',
        position: 'relative',
        marginBottom: 8
      }}>
        <div style={{ fontSize: '14px', color: '#303030', marginBottom: 8 }}>
          Check out my portfolio! {ogTags['og:url']}
        </div>
        
        {/* Link Preview */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {ogTags['og:image'] && (
            <img 
              src={ogTags['og:image']} 
              alt={ogTags['og:image:alt'] || 'Preview image'}
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
          )}
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#303030', marginBottom: 4 }}>
              {ogTags['og:title']}
            </div>
            <div style={{ fontSize: '13px', color: '#8696a0', lineHeight: 1.3 }}>
              {ogTags['og:description']}
            </div>
            <div style={{ fontSize: '12px', color: '#8696a0', marginTop: 4 }}>
              🔗 {extractDomain(ogTags['og:url']).toLowerCase()}
            </div>
          </div>
        </div>
        
        <div style={{ 
          fontSize: '11px', 
          color: '#8696a0', 
          textAlign: 'right', 
          marginTop: 4 
        }}>
          2:34 PM ✓✓
        </div>
      </div>
    </Card>
  );

  // Slack Preview Component
  const SlackPreview: React.FC = () => (
    <Card 
      className="social-preview slack-preview"
      style={{ 
        maxWidth: previewDevice === 'mobile' ? 350 : 450,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0'
      }}
    >
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#4A154B' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1c1d' }}>You</span>
          <span style={{ fontSize: '12px', color: '#616061' }}>Today at 2:34 PM</span>
        </div>
        
        <div style={{ fontSize: '14px', color: '#1d1c1d', marginBottom: 12 }}>
          Hey team! Check out my updated portfolio 🎉
        </div>
        
        {/* Slack Unfurl */}
        <div style={{ 
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #1264a3',
          borderRadius: '6px',
          backgroundColor: '#f8f8f8',
          overflow: 'hidden'
        }}>
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1264a3', marginBottom: 4 }}>
              {ogTags['og:title']}
            </div>
            <div style={{ fontSize: '13px', color: '#616061', lineHeight: 1.4, marginBottom: 8 }}>
              {ogTags['og:description']}
            </div>
            {ogTags['og:image'] && (
              <img 
                src={ogTags['og:image']} 
                alt={ogTags['og:image:alt'] || 'Preview image'}
                style={{ 
                  width: '100%', 
                  maxWidth: 300,
                  height: 150, 
                  objectFit: 'cover', 
                  borderRadius: '4px',
                  display: 'block'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  // Discord Preview Component
  const DiscordPreview: React.FC = () => (
    <Card 
      className="social-preview discord-preview"
      style={{ 
        maxWidth: previewDevice === 'mobile' ? 350 : 450,
        backgroundColor: '#36393f',
        border: 'none',
        color: '#dcddde'
      }}
    >
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#5865F2' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#dcddde' }}>YourName</span>
              <span style={{ fontSize: '12px', color: '#72767d' }}>Today at 2:34 PM</span>
            </div>
            
            <div style={{ fontSize: '14px', color: '#dcddde', marginBottom: 12 }}>
              Just updated my portfolio with some awesome new projects! 🚀
              {ogTags['og:url']}
            </div>
          </div>
        </div>
        
        {/* Discord Embed */}
        <div style={{ 
          borderLeft: '4px solid #5865F2',
          backgroundColor: '#2f3136',
          borderRadius: '4px',
          padding: 16,
          marginLeft: 40
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#00b0f4', marginBottom: 8 }}>
            {ogTags['og:title']}
          </div>
          <div style={{ fontSize: '14px', color: '#dcddde', lineHeight: 1.4, marginBottom: 12 }}>
            {ogTags['og:description']}
          </div>
          {ogTags['og:image'] && (
            <img 
              src={ogTags['og:image']} 
              alt={ogTags['og:image:alt'] || 'Preview image'}
              style={{ 
                width: '100%', 
                maxWidth: 400,
                borderRadius: '4px',
                display: 'block'
              }}
            />
          )}
        </div>
      </div>
    </Card>
  );

  // Platform selector
  const platforms = [
    { key: 'facebook', label: 'Facebook', icon: <FacebookOutlined />, color: '#1877F2' },
    { key: 'twitter', label: 'Twitter', icon: <TwitterOutlined />, color: '#1DA1F2' },
    { key: 'linkedin', label: 'LinkedIn', icon: <LinkedinOutlined />, color: '#0A66C2' },
    { key: 'whatsapp', label: 'WhatsApp', icon: <MessageOutlined />, color: '#25D366' },
    { key: 'slack', label: 'Slack', icon: <MessageOutlined />, color: '#4A154B' },
    { key: 'discord', label: 'Discord', icon: <MessageOutlined />, color: '#5865F2' }
  ];

  const renderPreview = () => {
    switch (selectedPlatform) {
      case 'facebook': return <FacebookPreview />;
      case 'twitter': return <TwitterPreview />;
      case 'linkedin': return <LinkedInPreview />;
      case 'whatsapp': return <WhatsAppPreview />;
      case 'slack': return <SlackPreview />;
      case 'discord': return <DiscordPreview />;
      default: return <FacebookPreview />;
    }
  };

  if (mode !== 'all') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <Radio.Group value={previewDevice} onChange={e => setPreviewDevice(e.target.value)}>
            <Radio.Button value="desktop">🖥️ Desktop</Radio.Button>
            <Radio.Button value="mobile">📱 Mobile</Radio.Button>
          </Radio.Group>
        </div>
        {renderPreview()}
      </div>
    );
  }

  return (
    <div>
      {/* Platform and Device Selection */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {platforms.map(platform => (
              <Button
                key={platform.key}
                type={selectedPlatform === platform.key ? 'primary' : 'default'}
                icon={platform.icon}
                onClick={() => setSelectedPlatform(platform.key)}
                style={{ 
                  backgroundColor: selectedPlatform === platform.key ? platform.color : undefined,
                  borderColor: selectedPlatform === platform.key ? platform.color : undefined
                }}
              >
                {platform.label}
              </Button>
            ))}
          </Space>
        </div>
        
        <Radio.Group value={previewDevice} onChange={e => setPreviewDevice(e.target.value)}>
          <Radio.Button value="desktop">🖥️ Desktop View</Radio.Button>
          <Radio.Button value="mobile">📱 Mobile View</Radio.Button>
        </Radio.Group>
      </div>

      {/* Preview Display */}
      <div style={{ textAlign: 'center' }}>
        <Badge.Ribbon 
          text={platforms.find(p => p.key === selectedPlatform)?.label} 
          color={platforms.find(p => p.key === selectedPlatform)?.color}
        >
          {renderPreview()}
        </Badge.Ribbon>
      </div>

      {/* Preview Info */}
      <Card size="small" style={{ marginTop: 16 }}>
        <Text type="secondary">
          <EyeOutlined /> This preview shows how your content will appear when shared on {selectedPlatform}. 
          Actual appearance may vary slightly based on platform updates and user settings.
        </Text>
      </Card>
    </div>
  );
};

export default SocialMediaPreviews;