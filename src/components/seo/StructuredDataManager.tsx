'use client';

import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Tabs, Space, Typography, message } from 'antd';
import { 
  CodeOutlined, 
  FileTextOutlined, 
  EyeOutlined, 
  BugOutlined
} from '@ant-design/icons';
import SchemaEditor from './SchemaEditor';
import SchemaTemplates from './SchemaTemplates';
import SchemaValidator from './SchemaValidator';
import RichResultsPreview from './RichResultsPreview';
import TemplateFormEditor from './TemplateFormEditor';
import { SchemaTemplate, ValidationResult } from './utils/schema-utils';

const { Title, Text } = Typography;

interface StructuredDataManagerProps {
  initialJson?: string;
  onSave?: (jsonData: string, validation: ValidationResult) => Promise<void>;
  showSaveButton?: boolean;
}

const StructuredDataManager: React.FC<StructuredDataManagerProps> = ({
  initialJson = '',
  onSave,
  showSaveButton = true
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [currentJson, setCurrentJson] = useState(initialJson);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SchemaTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const handleJsonChange = useCallback((json: string, validationResult: ValidationResult) => {
    setCurrentJson(json);
    setValidation(validationResult);
  }, []);

  const handleTemplateSelect = useCallback((template: SchemaTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateForm(true);
  }, []);

  const handleTemplateGenerate = useCallback((jsonData: string, template: SchemaTemplate) => {
    setCurrentJson(jsonData);
    setShowTemplateForm(false);
    setActiveTab('editor');
    message.success(`Applied ${template.name} template`);
  }, []);

  const handleDirectTemplateApply = useCallback((jsonData: string, template: SchemaTemplate) => {
    setCurrentJson(jsonData);
    setActiveTab('editor');
    message.success(`Applied ${template.name} template directly`);
  }, []);

  const handleSave = useCallback(async (json: string) => {
    if (!onSave || !validation) return;
    
    try {
      await onSave(json, validation);
      message.success('Structured data saved successfully');
    } catch (error) {
      message.error('Failed to save structured data');
      throw error;
    }
  }, [onSave, validation]);

  const tabItems = [
    {
      key: 'editor',
      label: (
        <Space>
          <CodeOutlined />
          JSON-LD Editor
        </Space>
      ),
      children: (
        <SchemaEditor
          initialValue={currentJson}
          onChange={handleJsonChange}
          onSave={showSaveButton ? handleSave : undefined}
          height="600px"
          showValidation={true}
          showToolbar={true}
        />
      )
    },
    {
      key: 'templates',
      label: (
        <Space>
          <FileTextOutlined />
          Templates
        </Space>
      ),
      children: showTemplateForm && selectedTemplate ? (
        <TemplateFormEditor
          template={selectedTemplate}
          onGenerate={handleTemplateGenerate}
          onCancel={() => setShowTemplateForm(false)}
        />
      ) : (
        <SchemaTemplates
          onSelectTemplate={handleTemplateSelect}
          onApplyTemplate={handleDirectTemplateApply}
        />
      )
    },
    {
      key: 'validation',
      label: (
        <Space>
          <BugOutlined />
          Validation
          {validation && (
            <span style={{
              background: validation.isValid ? '#52c41a' : '#f5222d',
              color: 'white',
              borderRadius: '50%',
              padding: '1px 6px',
              fontSize: '12px',
              marginLeft: '4px'
            }}>
              {validation.errors.length + validation.warnings.length}
            </span>
          )}
        </Space>
      ),
      children: (
        <SchemaValidator
          validation={validation}
          showDetails={true}
          compact={false}
        />
      )
    },
    {
      key: 'preview',
      label: (
        <Space>
          <EyeOutlined />
          Rich Results
        </Space>
      ),
      children: (
        <RichResultsPreview
          jsonData={currentJson}
          showMultipleViews={true}
        />
      )
    }
  ];

  return (
    <div className="structured-data-manager">
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Schema.org Structured Data Editor</Title>
                <Text type="secondary">
                  Create, validate, and preview JSON-LD structured data with real-time rich results simulation
                </Text>
              </div>
              
              {validation && (
                <Space>
                  <div style={{ textAlign: 'right' }}>
                    <div>
                      <Text strong style={{ 
                        color: validation.score >= 80 ? '#52c41a' : validation.score >= 60 ? '#faad14' : '#f5222d' 
                      }}>
                        Quality Score: {validation.score}/100
                      </Text>
                    </div>
                    <div>
                      <Space size="small">
                        {validation.errors.length > 0 && (
                          <Text type="danger">
                            {validation.errors.length} error{validation.errors.length > 1 ? 's' : ''}
                          </Text>
                        )}
                        {validation.warnings.length > 0 && (
                          <Text style={{ color: '#faad14' }}>
                            {validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}
                          </Text>
                        )}
                        {validation.isValid && validation.errors.length === 0 && validation.warnings.length === 0 && (
                          <Text type="success">Perfect!</Text>
                        )}
                      </Space>
                    </div>
                  </div>
                </Space>
              )}
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
              tabBarStyle={{ marginBottom: 0 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StructuredDataManager;
