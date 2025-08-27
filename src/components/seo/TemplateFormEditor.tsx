'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Select, 
  DatePicker, 
  InputNumber,
  Row,
  Col,
  Tag,
  Tooltip,
  message,
  Alert
} from 'antd';
import { 
  FormOutlined, 
  ThunderboltOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { SchemaTemplate, TemplateVariable, processTemplate, extractTemplateVariables } from './utils/schema-utils';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TemplateFormEditorProps {
  template: SchemaTemplate;
  onGenerate: (jsonData: string, processedTemplate: SchemaTemplate) => void;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
}

const TemplateFormEditor: React.FC<TemplateFormEditorProps> = ({
  template,
  onGenerate,
  onCancel,
  initialValues = {}
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [generatedJson, setGeneratedJson] = useState<string>('');

  useEffect(() => {
    const templateVars = extractTemplateVariables(template.content);
    setVariables(templateVars);
    
    // Set initial form values
    const defaultValues: Record<string, unknown> = {};
    templateVars.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        defaultValues[variable.key] = variable.defaultValue;
      }
    });
    
    const combinedValues = { ...defaultValues, ...initialValues };
    setFormData(combinedValues);
    form.setFieldsValue(combinedValues);
  }, [template, initialValues, form]);

  const handleFieldChange = () => {
    const values = form.getFieldsValue();
    setFormData(values);
    
    // Generate preview
    try {
      const processed = processTemplate(template.content, values);
      setGeneratedJson(processed);
    } catch (error) {
      console.error('Error processing template:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      const processedJson = processTemplate(template.content, values);
      
      // Validate that it's proper JSON
      JSON.parse(processedJson);
      
      const processedTemplate = {
        ...template,
        variables: variables.map(v => ({
          ...v,
          defaultValue: values[v.key]
        }))
      };
      
      onGenerate(processedJson, processedTemplate);
      message.success('Template processed successfully!');
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Validation error: ${error.message}`);
      } else {
        message.error('Please fill in all required fields correctly');
      }
    }
  };

  const renderFormField = (variable: TemplateVariable) => {
    const commonProps = {
      placeholder: variable.placeholder || `Enter ${variable.label.toLowerCase()}`,
      title: variable.description
    };

    switch (variable.type) {
      case 'array':
        return (
          <Select
            mode="tags"
            {...commonProps}
            placeholder={`Enter ${variable.label.toLowerCase()} (press Enter to add)`}
            tokenSeparators={[',']}
            style={{ width: '100%' }}
          />
        );

      case 'date':
        return (
          <DatePicker
            {...commonProps}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        );

      case 'number':
        return (
          <InputNumber
            {...commonProps}
            style={{ width: '100%' }}
            min={0}
          />
        );

      case 'tel':
        return (
          <Input
            {...commonProps}
            addonBefore="+1"
            placeholder="(555) 123-4567"
          />
        );

      case 'url':
        return (
          <Input
            {...commonProps}
            addonBefore="https://"
            placeholder="example.com"
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            placeholder="user@example.com"
          />
        );

      case 'object':
        return (
          <TextArea
            {...commonProps}
            rows={3}
            placeholder='{"key": "value"}'
          />
        );

      case 'text':
      default:
        if (variable.key.toLowerCase().includes('description') || 
            variable.key.toLowerCase().includes('summary')) {
          return (
            <TextArea
              {...commonProps}
              rows={4}
              showCount
              maxLength={300}
            />
          );
        }
        return (
          <Input
            {...commonProps}
            showCount={variable.key.toLowerCase().includes('title')}
            maxLength={variable.key.toLowerCase().includes('title') ? 60 : undefined}
          />
        );
    }
  };

  const getFieldTypeIcon = (type: TemplateVariable['type']) => {
    const icons: Record<string, string> = {
      text: '📝',
      url: '🔗',
      email: '📧',
      tel: '📞',
      date: '📅',
      number: '🔢',
      array: '📋',
      object: '🗃️'
    };
    return icons[type] || '📄';
  };

  const groupVariablesByCategory = (vars: TemplateVariable[]) => {
    const categories: Record<string, TemplateVariable[]> = {};
    
    vars.forEach(variable => {
      let category = 'General';
      
      if (variable.key.toLowerCase().includes('social') || 
          variable.key.toLowerCase().includes('url') ||
          variable.key.toLowerCase().includes('link')) {
        category = 'Links & Social';
      } else if (variable.key.toLowerCase().includes('address') ||
                 variable.key.toLowerCase().includes('contact') ||
                 variable.key.toLowerCase().includes('phone') ||
                 variable.key.toLowerCase().includes('email')) {
        category = 'Contact Information';
      } else if (variable.key.toLowerCase().includes('date') ||
                 variable.key.toLowerCase().includes('time')) {
        category = 'Dates & Times';
      } else if (variable.key.toLowerCase().includes('company') ||
                 variable.key.toLowerCase().includes('organization') ||
                 variable.key.toLowerCase().includes('job') ||
                 variable.key.toLowerCase().includes('work')) {
        category = 'Professional';
      } else if (variable.key.toLowerCase().includes('description') ||
                 variable.key.toLowerCase().includes('summary') ||
                 variable.key.toLowerCase().includes('content')) {
        category = 'Content';
      }
      
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(variable);
    });
    
    return categories;
  };

  const categorizedVariables = groupVariablesByCategory(variables);
  const categoryNames = Object.keys(categorizedVariables);
  const hasRequiredFields = variables.some(v => v.required);

  return (
    <div className="template-form-editor">
      <Card
        title={
          <Space>
            <FormOutlined />
            <div>
              <Title level={4} style={{ margin: 0 }}>{template.name}</Title>
              <Text type="secondary">{template.description}</Text>
            </div>
          </Space>
        }
        extra={
          <Space>
            <Tag color="blue">@{template.type}</Tag>
            <Tag color="green">{template.category}</Tag>
          </Space>
        }
      >
        {variables.length === 0 ? (
          <Alert
            message="No Variables Found"
            description="This template doesn't contain any customizable variables."
            type="info"
            showIcon
            action={
              <Button size="small" onClick={() => onGenerate(template.content, template)}>
                Use Template As-Is
              </Button>
            }
          />
        ) : (
          <>
            <Form
              form={form}
              layout="vertical"
              onFieldsChange={handleFieldChange}
              initialValues={formData}
            >
              <Row gutter={[16, 0]}>
                {categoryNames.map(categoryName => (
                  <Col span={24} key={categoryName}>
                    <Card 
                      size="small" 
                      title={categoryName} 
                      style={{ marginBottom: 16 }}
                      type="inner"
                    >
                      <Row gutter={[16, 0]}>
                        {categorizedVariables[categoryName].map(variable => (
                          <Col 
                            xs={24} 
                            sm={variable.type === 'object' || variable.key.includes('description') ? 24 : 12} 
                            key={variable.key}
                          >
                            <Form.Item
                              name={variable.key}
                              label={
                                <Space>
                                  <span>{getFieldTypeIcon(variable.type)}</span>
                                  <span>{variable.label}</span>
                                  {variable.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                                  <Tooltip title={variable.description}>
                                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                  </Tooltip>
                                </Space>
                              }
                              rules={[
                                variable.required && { 
                                  required: true, 
                                  message: `${variable.label} is required` 
                                },
                                variable.type === 'email' && { 
                                  type: 'email' as const, 
                                  message: 'Please enter a valid email' 
                                },
                                variable.type === 'url' && { 
                                  pattern: /^https?:\/\/.+/, 
                                  message: 'Please enter a valid URL' 
                                }
                              ].filter(Boolean)}
                            >
                              {renderFormField(variable)}
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card title="Generated JSON-LD Preview" style={{ marginTop: 16 }}>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #d9d9d9'
                }}>
                  {generatedJson || 'Fill in the form above to see the generated JSON-LD...'}
                </pre>
              </Card>

              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Space>
                  {onCancel && (
                    <Button onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="primary" 
                    icon={<ThunderboltOutlined />}
                    onClick={handleGenerate}
                    disabled={hasRequiredFields && variables.some(v => v.required && !formData[v.key])}
                  >
                    Generate Schema
                  </Button>
                </Space>
              </div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default TemplateFormEditor;
