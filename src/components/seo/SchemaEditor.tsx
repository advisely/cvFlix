'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Space, message, Spin, Typography, Badge, Alert } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  FormatPainterOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { validateJsonLD, ValidationResult, processTemplate } from './utils/schema-utils';

const { Title, Text } = Typography;

// Monaco Editor lazy loading
let MonacoEditor: React.ComponentType<any> | null = null;

interface SchemaEditorProps {
  initialValue?: string;
  onChange?: (value: string, validation: ValidationResult) => void;
  onSave?: (value: string) => Promise<void>;
  height?: string;
  readOnly?: boolean;
  showValidation?: boolean;
  showToolbar?: boolean;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  initialValue = '',
  onChange,
  onSave,
  height = '500px',
  readOnly = false,
  showValidation = true,
  showToolbar = true
}) => {
  const [content, setContent] = useState(initialValue);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load Monaco Editor dynamically
  useEffect(() => {
    const loadMonaco = async () => {
      try {
        const monaco = await import('@monaco-editor/react');
        MonacoEditor = monaco.default;
        setMonacoLoaded(true);
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
        message.error('Failed to load code editor');
      } finally {
        setLoading(false);
      }
    };

    if (!MonacoEditor) {
      loadMonaco();
    } else {
      setLoading(false);
    }
  }, []);

  // Validate content on change
  const handleContentChange = useCallback((value: string = '') => {
    setContent(value);
    
    if (showValidation) {
      const validationResult = validateJsonLD(value);
      setValidation(validationResult);
      onChange?.(value, validationResult);
    } else {
      onChange?.(value, { errors: [], warnings: [], isValid: true, score: 100 });
    }

    // Update history
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [onChange, showValidation, history, historyIndex]);

  // Format JSON content
  const formatContent = useCallback(() => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      handleContentChange(formatted);
      message.success('JSON formatted successfully');
    } catch (error) {
      message.error('Invalid JSON format - cannot format');
    }
  }, [content, handleContentChange]);

  // Copy content to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      message.success('Copied to clipboard');
    } catch (error) {
      message.error('Failed to copy to clipboard');
    }
  }, [content]);

  // Download content as file
  const downloadAsFile = useCallback(() => {
    const blob = new Blob([content], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'structured-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('File downloaded successfully');
  }, [content]);

  // Upload file content
  const uploadFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.jsonld';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          handleContentChange(content);
          message.success('File loaded successfully');
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }, [handleContentChange]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      handleContentChange(history[newIndex]);
    }
  }, [historyIndex, history, handleContentChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      handleContentChange(history[newIndex]);
    }
  }, [historyIndex, history, handleContentChange]);

  // Save content
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave(content);
      message.success('Schema saved successfully');
    } catch (error) {
      message.error('Failed to save schema');
    } finally {
      setSaving(false);
    }
  }, [content, onSave]);

  // Editor configuration
  const editorOptions = {
    minimap: { enabled: false },
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full' as const,
    tabSize: 2,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    readOnly,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    theme: 'vs-dark',
    jsonValidation: true,
    contextmenu: true,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line' as const,
    selectOnLineNumbers: true
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure JSON-LD language support
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [{
        uri: 'https://schema.org',
        fileMatch: ['*'],
        schema: {
          type: 'object',
          properties: {
            '@context': {
              type: 'string',
              enum: ['https://schema.org']
            },
            '@type': {
              type: 'string'
            }
          },
          required: ['@context', '@type']
        }
      }]
    });

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      formatContent();
    });
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading code editor...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!monacoLoaded || !MonacoEditor) {
    return (
      <Card>
        <Alert
          message="Editor Not Available"
          description="The code editor could not be loaded. You can still work with JSON in the basic text area."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div className="schema-editor">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>JSON-LD Schema Editor</Title>
                  <Text type="secondary">Edit your structured data with syntax highlighting and validation</Text>
                </div>
                {validation && showValidation && (
                  <Space>
                    <Badge
                      count={validation.errors.length}
                      status={validation.errors.length > 0 ? 'error' : 'success'}
                      title="Errors"
                    >
                      <ExclamationCircleOutlined style={{ color: validation.errors.length > 0 ? '#f5222d' : '#52c41a' }} />
                    </Badge>
                    <Badge
                      count={validation.warnings.length}
                      status="warning"
                      title="Warnings"
                    >
                      <WarningOutlined style={{ color: validation.warnings.length > 0 ? '#faad14' : '#d9d9d9' }} />
                    </Badge>
                    <Text strong style={{ color: validation.score >= 80 ? '#52c41a' : validation.score >= 60 ? '#faad14' : '#f5222d' }}>
                      Score: {validation.score}/100
                    </Text>
                  </Space>
                )}
              </div>
            }
            extra={
              showToolbar && (
                <Space>
                  <Button
                    icon={<UndoOutlined />}
                    onClick={undo}
                    disabled={historyIndex === 0}
                    title="Undo (Ctrl+Z)"
                  />
                  <Button
                    icon={<RedoOutlined />}
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
                    title="Redo (Ctrl+Y)"
                  />
                  <Button
                    icon={<FormatPainterOutlined />}
                    onClick={formatContent}
                    title="Format JSON (Ctrl+Shift+F)"
                  >
                    Format
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={uploadFile}
                    title="Upload JSON file"
                  >
                    Upload
                  </Button>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  />
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadAsFile}
                    title="Download as file"
                  />
                  {onSave && (
                    <Button
                      type="primary"
                      loading={saving}
                      onClick={handleSave}
                      title="Save (Ctrl+S)"
                    >
                      Save
                    </Button>
                  )}
                </Space>
              )
            }
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
              <MonacoEditor
                height={height}
                language="json"
                value={content}
                onChange={handleContentChange}
                onMount={handleEditorDidMount}
                options={editorOptions}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SchemaEditor;
