'use client'

import { useState } from 'react';
import { Row, Col, Typography, Space, Button, Divider, Card as AntCard } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import FloatingHighlightCard from './FloatingHighlightCard';
import HighlightCardGrid from './HighlightCardGrid';

const { Title, Paragraph, Text } = Typography;

// Sample data for demonstration
const sampleHighlights = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Netflix',
    description: 'Led the development of the recommendation engine that serves over 200 million users daily. Implemented microservices architecture and optimized performance by 40%.',
    startDate: '2023-01-15',
    createdAt: '2023-01-15',
    media: [
      {
        id: 'm1',
        url: '/placeholder-tech.jpg',
        type: 'image' as const,
        highlightId: '1'
      },
      {
        id: 'm2',
        url: '/placeholder-code.jpg',
        type: 'image' as const,
        highlightId: '1'
      }
    ]
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Google',
    description: 'Managed cross-functional teams to deliver innovative products that impact millions of users worldwide.',
    startDate: '2022-06-01',
    createdAt: '2022-06-01',
    media: [
      {
        id: 'm3',
        url: '/placeholder-product.jpg',
        type: 'image' as const,
        highlightId: '2'
      }
    ]
  },
  {
    id: '3',
    title: 'UX Design Lead',
    company: 'Apple',
    description: 'Designed user experiences for next-generation products, focusing on accessibility and user-centered design principles.',
    startDate: '2021-03-20',
    createdAt: '2021-03-20',
    media: [
      {
        id: 'm4',
        url: '/placeholder-design.mp4',
        type: 'video' as const,
        highlightId: '3'
      }
    ]
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Microsoft',
    description: 'Built machine learning models for predictive analytics and business intelligence.',
    startDate: '2020-09-10',
    createdAt: '2020-09-10',
    media: []
  }
];

const FloatingHighlightCardDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'detailed'>('default');
  const [showActions, setShowActions] = useState(true);

  return (
    <div style={{ background: '#141414', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={1} style={{ color: '#e50914', marginBottom: '16px' }}>
            FloatingHighlightCard Demo
          </Title>
          <Paragraph style={{ color: '#ffffff', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Modern floating card component with shadow effects, smooth animations, and responsive design.
            Built with Ant Design and optimized for the Netflix-style theme.
          </Paragraph>
        </div>

        {/* Controls */}
        <AntCard 
          style={{ 
            background: '#303030', 
            border: '1px solid #404040', 
            marginBottom: '32px' 
          }}
        >
          <Title level={3} style={{ color: '#ffffff', marginBottom: '16px' }}>
            Demo Controls
          </Title>
          
          <Space wrap size="middle">
            <div>
              <Text style={{ color: '#ffffff', marginRight: '8px' }}>Variant:</Text>
              <Space>
                {(['default', 'compact', 'detailed'] as const).map(variant => (
                  <Button
                    key={variant}
                    type={selectedVariant === variant ? 'primary' : 'default'}
                    onClick={() => setSelectedVariant(variant)}
                    size="small"
                  >
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Button>
                ))}
              </Space>
            </div>
            
            <div>
              <Button
                type={showActions ? 'primary' : 'default'}
                icon={<SettingOutlined />}
                onClick={() => setShowActions(!showActions)}
                size="small"
              >
                {showActions ? 'Hide Actions' : 'Show Actions'}
              </Button>
            </div>
          </Space>
        </AntCard>

        {/* Single Card Examples */}
        <Title level={2} style={{ color: '#ffffff', marginBottom: '24px' }}>
          Individual Card Examples
        </Title>
        
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {sampleHighlights.slice(0, 3).map((highlight) => (
            <Col xs={24} sm={12} md={8} key={highlight.id}>
              <FloatingHighlightCard
                highlight={highlight}
                variant={selectedVariant}
                showActions={showActions}
                onClick={() => console.log(`Clicked ${highlight.title}`)}
                onEdit={() => console.log(`Edit ${highlight.title}`)}
                onDelete={() => console.log(`Delete ${highlight.title}`)}
              />
            </Col>
          ))}
        </Row>

        <Divider style={{ borderColor: '#404040', margin: '48px 0' }} />

        {/* Grid Layout Example */}
        <Title level={2} style={{ color: '#ffffff', marginBottom: '24px' }}>
          Grid Layout Example
        </Title>
        
        <HighlightCardGrid
          highlights={sampleHighlights}
          title="Professional Highlights"
          variant={selectedVariant}
          showActions={showActions}
          gridProps={{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4 }}
          onCardClick={(highlight) => {
            console.log('Grid card clicked:', highlight.title);
          }}
          onCardEdit={(highlight) => {
            console.log('Grid card edit:', highlight.title);
          }}
          onCardDelete={(highlight) => {
            console.log('Grid card delete:', highlight.title);
          }}
        />

        <Divider style={{ borderColor: '#404040', margin: '48px 0' }} />

        {/* Feature Showcase */}
        <Title level={2} style={{ color: '#ffffff', marginBottom: '24px' }}>
          Key Features
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                🎯 Professional Shadows
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                Multi-layered shadow effects with Netflix red accent glow on hover.
                Creates depth and modern floating appearance.
              </Paragraph>
            </AntCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                ⚡ Smooth Animations
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                Hardware-accelerated transforms with scale and elevation effects.
                300ms duration for optimal user experience.
              </Paragraph>
            </AntCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                📱 Responsive Design
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                Optimized for all screen sizes with intelligent grid layouts.
                Mobile-first approach with touch-friendly interactions.
              </Paragraph>
            </AntCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                🎬 Media Support
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                Enhanced image and video display with fallback states.
                Auto-play videos with elegant error handling.
              </Paragraph>
            </AntCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                🎨 Theme Integration
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                Seamlessly integrates with existing Netflix-style design.
                Consistent color scheme and typography patterns.
              </Paragraph>
            </AntCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <AntCard 
              style={{ 
                background: '#303030', 
                border: '1px solid #404040', 
                height: '100%' 
              }}
            >
              <Title level={4} style={{ color: '#e50914' }}>
                ♿ Accessibility
              </Title>
              <Paragraph style={{ color: '#ffffff' }}>
                WCAG compliant with keyboard navigation, screen reader support,
                and proper focus indicators.
              </Paragraph>
            </AntCard>
          </Col>
        </Row>

        {/* Usage Notes */}
        <div style={{ marginTop: '48px', padding: '24px', background: '#1a1a1a', borderRadius: '8px' }}>
          <Title level={3} style={{ color: '#e50914', marginBottom: '16px' }}>
            💡 Usage Notes
          </Title>
          <div style={{ color: '#ffffff' }}>
            <Paragraph style={{ color: '#ffffff' }}>
              • Hover over cards to see the floating effect and shadow enhancement
            </Paragraph>
            <Paragraph style={{ color: '#ffffff' }}>
              • Try different variants to see how content adapts to different layouts
            </Paragraph>
            <Paragraph style={{ color: '#ffffff' }}>
              • Toggle actions to see how buttons integrate with the card design
            </Paragraph>
            <Paragraph style={{ color: '#ffffff' }}>
              • Resize your browser to test responsive behavior across breakpoints
            </Paragraph>
            <Paragraph style={{ color: '#ffffff' }}>
              • Check browser console for click event logs when interacting with cards
            </Paragraph>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FloatingHighlightCardDemo;