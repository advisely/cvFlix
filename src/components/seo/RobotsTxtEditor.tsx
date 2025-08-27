'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Input, 
  message, 
  Row, 
  Col, 
  Switch,
  Divider,
  Tooltip,
  Badge,
  Spin
} from 'antd';
import { 
  SaveOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FormatPainterOutlined,
  UndoOutlined,
  RedoOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { validateRobotsContent, formatRobotsContent, type RobotsValidationError } from './utils/robots-utils';
import { useDebounced } from './hooks/useDebounced';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface RobotsTxtEditorProps {
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  onValidate?: (errors: RobotsValidationError[]) => void;
  loading?: boolean;
  height?: number;
}

interface EditorHistory {
  content: string;
  timestamp: number;
}

const RobotsTxtEditor: React.FC<RobotsTxtEditorProps> = ({
  initialContent = '',
  onSave,
  onValidate,
  loading = false,
  height = 400
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateRobotsContent> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [history, setHistory] = useState<EditorHistory[]>([{ content: initialContent, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [characterCount, setCharacterCount] = useState(initialContent.length);
  const [lineCount, setLineCount] = useState(initialContent.split('\n').length);
  
  const textAreaRef = useRef<{ resizableTextArea?: { textArea: HTMLTextAreaElement } }>(null);
  
  // Debounced validation
  const debouncedContent = useDebounced(content, 300);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
      setHistory([{ content: initialContent, timestamp: Date.now() }]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
    }
  }, [initialContent]);

  // Perform validation on debounced content
  useEffect(() => {
    if (debouncedContent) {
      const result = validateRobotsContent(debouncedContent);
      setValidationResult(result);
      
      if (onValidate) {
        onValidate(result.detailedErrors);
      }
    }
  }, [debouncedContent, onValidate]);

  // Update statistics
  useEffect(() => {
    setCharacterCount(content.length);
    setLineCount(content.split('\n').length);
  }, [content]);

  // Handle content changes
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setHasUnsavedChanges(value !== initialContent);
    
    // Add to history (limit to 50 entries)
    const newHistoryEntry: EditorHistory = { content: value, timestamp: Date.now() };
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newHistoryEntry];
      return newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [initialContent, historyIndex]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousContent = history[newIndex].content;
      setContent(previousContent);
      setHasUnsavedChanges(previousContent !== initialContent);
    }
  }, [historyIndex, history, initialContent]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex].content;
      setContent(nextContent);
      setHasUnsavedChanges(nextContent !== initialContent);
    }
  }, [historyIndex, history, initialContent]);

  // Format content
  const handleFormat = useCallback(() => {
    const formatted = formatRobotsContent(content);
    if (formatted !== content) {
      handleContentChange(formatted);
      message.success('Content formatted successfully');
    }
  }, [content, handleContentChange]);

  // Save content
  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      message.error('Cannot save empty robots.txt file');
      return;
    }

    if (validationResult && validationResult.errors.length > 0) {
      message.error('Please fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      await onSave(content);
      setHasUnsavedChanges(false);
      message.success('Robots.txt saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save robots.txt. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [content, validationResult, onSave]);

  // Reset to initial content
  const handleReset = useCallback(() => {
    setContent(initialContent);
    setHasUnsavedChanges(false);
    setHistory([{ content: initialContent, timestamp: Date.now() }]);
    setHistoryIndex(0);
    message.info('Content reset to original');
  }, [initialContent]);

  // Download content as file
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    message.success('Robots.txt downloaded');
  }, [content]);

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textArea.selectionStart = textArea.selectionEnd = start + text.length;
        textArea.focus();
      }, 0);
    }
  }, [content, handleContentChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'f':
            e.preventDefault();
            handleFormat();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, handleFormat]);

  // Get validation status
  const getValidationStatus = () => {
    if (!validationResult) return { type: 'info', message: 'Validating...', icon: <Spin size="small" /> };
    
    const errorCount = validationResult.errors.length;
    const warningCount = validationResult.warnings.length;
    
    if (errorCount > 0) {
      return { 
        type: 'error', 
        message: `${errorCount} error${errorCount > 1 ? 's' : ''}${warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}`,
        icon: <ExclamationCircleOutlined />
      };
    }
    
    if (warningCount > 0) {
      return { 
        type: 'warning', 
        message: `${warningCount} warning${warningCount > 1 ? 's' : ''}`,
        icon: <WarningOutlined />
      };
    }
    
    return { type: 'success', message: 'Valid robots.txt', icon: <CheckCircleOutlined /> };
  };

  const validationStatus = getValidationStatus();
  const progressStatus = validationResult?.isValid ? "success" : (validationResult?.errors.length ? "exception" : "active");

  return (
    <Card
      title={
        <Space>
          <Text strong>Robots.txt Editor</Text>
          <Badge 
            status={validationResult?.isValid ? 'success' : (validationResult?.errors.length ? 'error' : 'processing')}
            text={validationStatus.message}
          />
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Toggle validation panel">
            <Button 
              type={showValidation ? 'primary' : 'default'}
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => setShowValidation(!showValidation)}
            />
          </Tooltip>
          <Tooltip title="Preview formatted">
            <Button 
              type={showPreview ? 'primary' : 'default'}
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => setShowPreview(!showPreview)}
            />
          </Tooltip>
          <Tooltip title="Download as file">
            <Button 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Editor Controls */}
        <Col span={24}>
          <Space split={<Divider type="vertical" />}>
            <Space>
              <Tooltip title="Save (Ctrl+S)">
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                >
                  Save
                </Button>
              </Tooltip>
              <Tooltip title="Reset to original">
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                >
                  Reset
                </Button>
              </Tooltip>
            </Space>
            
            <Space>
              <Tooltip title="Undo (Ctrl+Z)">
                <Button 
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                />
              </Tooltip>
              <Tooltip title="Redo (Ctrl+Shift+Z)">
                <Button 
                  size="small"
                  icon={<RedoOutlined />}
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                />
              </Tooltip>
              <Tooltip title="Format content (Ctrl+F)">
                <Button 
                  size="small"
                  icon={<FormatPainterOutlined />}
                  onClick={handleFormat}
                >
                  Format
                </Button>
              </Tooltip>
            </Space>

            <Space>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {lineCount} lines, {characterCount} characters
              </Text>
              {hasUnsavedChanges && (
                <Badge status="warning" text="Unsaved changes" />
              )}
            </Space>
          </Space>
        </Col>

        {/* Quick Insert Buttons */}
        <Col span={24}>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Quick Insert:
          </Text>
          <Space wrap>
            <Button size="small" onClick={() => insertAtCursor('User-agent: *\n')}>User-agent</Button>
            <Button size="small" onClick={() => insertAtCursor('Allow: /\n')}>Allow</Button>
            <Button size="small" onClick={() => insertAtCursor('Disallow: /\n')}>Disallow</Button>
            <Button size="small" onClick={() => insertAtCursor('Crawl-delay: 5\n')}>Crawl-delay</Button>
            <Button size="small" onClick={() => insertAtCursor(`Sitemap: ${window.location.origin}/sitemap.xml\n`)}>Sitemap</Button>
            <Button size="small" onClick={() => insertAtCursor('\n# Comment\n')}>Comment</Button>
          </Space>
        </Col>

        {/* Editor */}
        <Col span={showPreview ? 12 : 24}>
          <div style={{ position: 'relative' }}>
            <TextArea
              ref={textAreaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              style={{ 
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.4'
              }}
              rows={Math.max(12, Math.floor(height / 22))}
              placeholder="Enter robots.txt content..."
              autoSize={false}
            />
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <Spin />
              </div>
            )}
          </div>
        </Col>

        {/* Preview Panel */}
        {showPreview && (
          <Col span={12}>
            <Card size="small" title="Preview" style={{ height: '100%' }}>
              <pre style={{ 
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '12px',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: height - 80,
                overflow: 'auto',
                background: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px'
              }}>
                {content || 'No content to preview'}
              </pre>
            </Card>
          </Col>
        )}

        {/* Validation Panel */}
        {showValidation && validationResult && (
          <Col span={24}>
            <Alert
              type={validationStatus.type as any}
              message={
                <Space>
                  {validationStatus.icon}
                  <Text strong>Validation Results</Text>
                </Space>
              }
              description={
                <div>
                  {validationResult.detailedErrors.length === 0 ? (
                    <Text type="secondary">No issues found. Your robots.txt is valid!</Text>
                  ) : (
                    <div>
                      {validationResult.detailedErrors.map((error, index) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          <Space>
                            <Badge 
                              status={error.severity === 'error' ? 'error' : 'warning'} 
                              text={
                                <span>
                                  {error.line > 0 && <Text code>Line {error.line}:</Text>}
                                  <Text type={error.severity === 'error' ? 'danger' : undefined}>
                                    {error.message}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: '11px', marginLeft: '4px' }}>
                                    ({error.type})
                                  </Text>
                                </span>
                              }
                            />
                          </Space>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              }
              showIcon={false}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default RobotsTxtEditor;
