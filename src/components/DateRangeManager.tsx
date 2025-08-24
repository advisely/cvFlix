'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { Card, DatePicker, Button, Checkbox, Alert, Typography, Row, Col, Space } from 'antd';
import { DragOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export interface ExperienceDateRange {
  id: string;
  startDate: string;
  endDate: string | null;
  isCurrent?: boolean;
  error?: string;
}

interface DateRangeManagerProps {
  value: ExperienceDateRange[];
  onChange: (ranges: ExperienceDateRange[]) => void;
  disabled?: boolean;
  validation?: {
    allowOverlaps?: boolean;
    maxRanges?: number;
    requireMinimumDuration?: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  ranges: ExperienceDateRange[];
}

const DateRangeManager: React.FC<DateRangeManagerProps> = ({
  value = [],
  onChange,
  disabled = false,
  validation = {
    allowOverlaps: true,
    maxRanges: 10,
    requireMinimumDuration: true
  }
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize with at least one range if empty
  const ranges = useMemo(() => {
    if (value.length === 0) {
      return [{
        id: `range-${Date.now()}`,
        startDate: '',
        endDate: null,
        isCurrent: false
      }];
    }
    return value;
  }, [value]);

  // Validation logic
  const validateDateRanges = useCallback((rangesToValidate: ExperienceDateRange[]): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];
    
    // Minimum range validation
    if (rangesToValidate.length === 0) {
      return { 
        isValid: false, 
        errors: { general: 'At least one employment period is required' },
        warnings: [],
        ranges: rangesToValidate
      };
    }
    
    // Individual range validation
    rangesToValidate.forEach((range, index) => {
      if (!range.startDate) {
        errors[`${index}-start`] = 'Start date is required';
      }
      
      if (range.endDate && range.startDate) {
        const start = dayjs(range.startDate);
        const end = dayjs(range.endDate);
        
        if (end.isBefore(start) || end.isSame(start)) {
          errors[`${index}-end`] = 'End date must be after start date';
        }
        
        // Check for minimum duration if required
        if (validation.requireMinimumDuration) {
          const diffInDays = end.diff(start, 'days');
          if (diffInDays < 1) {
            warnings.push(`Period ${index + 1}: Very short duration (less than 1 day)`);
          }
        }
      }
      
      // Future date validation
      if (range.startDate && dayjs(range.startDate).isAfter(dayjs().add(1, 'year'))) {
        warnings.push(`Period ${index + 1}: Start date is more than 1 year in the future`);
      }
    });
    
    // Overlap validation (warnings only if overlaps are allowed)
    if (validation.allowOverlaps) {
      const overlaps = detectOverlaps(rangesToValidate);
      warnings.push(...overlaps);
    } else {
      const overlaps = detectOverlaps(rangesToValidate);
      overlaps.forEach(overlap => {
        const match = overlap.match(/Period (\d+) and (\d+)/);
        if (match) {
          const [, index1, index2] = match;
          errors[`${parseInt(index1) - 1}-overlap`] = 'Date ranges cannot overlap';
          errors[`${parseInt(index2) - 1}-overlap`] = 'Date ranges cannot overlap';
        }
      });
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      ranges: rangesToValidate.map((range, index) => ({
        ...range,
        error: errors[`${index}-start`] || errors[`${index}-end`] || errors[`${index}-overlap`]
      }))
    };
  }, [validation]);

  const detectOverlaps = (rangesToCheck: ExperienceDateRange[]): string[] => {
    const warnings: string[] = [];
    
    for (let i = 0; i < rangesToCheck.length; i++) {
      for (let j = i + 1; j < rangesToCheck.length; j++) {
        const range1 = rangesToCheck[i];
        const range2 = rangesToCheck[j];
        
        if (!range1.startDate || !range2.startDate) continue;
        
        const start1 = dayjs(range1.startDate);
        const end1 = range1.endDate ? dayjs(range1.endDate) : dayjs(); // Current date if ongoing
        const start2 = dayjs(range2.startDate);
        const end2 = range2.endDate ? dayjs(range2.endDate) : dayjs(); // Current date if ongoing
        
        // Check for overlap
        if (start1.isBefore(end2) && start2.isBefore(end1)) {
          warnings.push(`Period ${i + 1} and ${j + 1} have overlapping dates`);
        }
      }
    }
    
    return warnings;
  };

  const handleRangeUpdate = (index: number, updatedRange: Partial<ExperienceDateRange>) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], ...updatedRange };
    
    // Auto-clear endDate if marking as current
    if (updatedRange.isCurrent) {
      newRanges[index].endDate = null;
    }
    
    const validated = validateDateRanges(newRanges);
    onChange(validated.ranges);
  };

  const handleAddRange = () => {
    if (ranges.length >= (validation.maxRanges || 10)) {
      return;
    }
    
    const newRange: ExperienceDateRange = {
      id: `range-${Date.now()}`,
      startDate: '',
      endDate: null,
      isCurrent: false
    };
    
    const newRanges = [...ranges, newRange];
    const validated = validateDateRanges(newRanges);
    onChange(validated.ranges);
  };

  const handleRemoveRange = (index: number) => {
    if (ranges.length <= 1) {
      return; // Don't allow removal of last range
    }
    
    const newRanges = ranges.filter((_, i) => i !== index);
    const validated = validateDateRanges(newRanges);
    onChange(validated.ranges);
  };

  const formatDateRanges = (rangesToFormat: ExperienceDateRange[]): string => {
    return rangesToFormat
      .filter(range => range.startDate)
      .map(range => {
        const start = dayjs(range.startDate).format('YYYY');
        const end = range.endDate ? dayjs(range.endDate).format('YYYY') : 'Present';
        return start === end.slice(0, 4) ? start : `${start}-${end}`;
      })
      .join(', ');
  };

  // Validate current ranges
  const validationResult = useMemo(() => validateDateRanges(ranges), [ranges, validateDateRanges]);

  return (
    <div style={{ width: '100%' }}>
      {/* Summary display */}
      {ranges.some(r => r.startDate) && (
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <Text strong>Employment Summary: </Text>
          <Text>{formatDateRanges(ranges)}</Text>
          {ranges.some(r => r.isCurrent || !r.endDate) && (
            <span style={{ marginLeft: 8, color: '#52c41a', fontSize: '12px' }}>● Current Position</span>
          )}
        </div>
      )}

      {/* Date range cards */}
      <div style={{ marginBottom: 16 }}>
        {ranges.map((range, index) => (
          <DateRangeCard
            key={range.id}
            range={range}
            index={index}
            onUpdate={(updatedRange) => handleRangeUpdate(index, updatedRange)}
            onRemove={() => handleRemoveRange(index)}
            canRemove={ranges.length > 1}
            disabled={disabled}
            isDragging={draggedIndex === index}
            onDragStart={() => setDraggedIndex(index)}
            onDragEnd={() => setDraggedIndex(null)}
          />
        ))}
      </div>

      {/* Add button */}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddRange}
        disabled={disabled || ranges.length >= (validation.maxRanges || 10)}
        block
        style={{ marginBottom: 16 }}
      >
        Add Additional Start Date/End Date
      </Button>

      {/* Validation warnings */}
      {validationResult.warnings.length > 0 && (
        <Alert
          message="Date Range Warnings"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* General errors */}
      {validationResult.errors.general && (
        <Alert
          message={validationResult.errors.general}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

interface DateRangeCardProps {
  range: ExperienceDateRange;
  index: number;
  onUpdate: (range: Partial<ExperienceDateRange>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
  isDragging?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const DateRangeCard: React.FC<DateRangeCardProps> = ({
  range,
  index,
  onUpdate,
  onRemove,
  canRemove,
  disabled = false,
  isDragging = false,
  onDragStart,
  onDragEnd
}) => {
  return (
    <Card 
      size="small" 
      style={{ 
        marginBottom: 16,
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    >
      <Row gutter={[16, 8]} align="middle">
        {/* Drag handle and period indicator */}
        <Col flex="none">
          <Space align="center">
            <DragOutlined 
              style={{ 
                color: '#999', 
                cursor: disabled ? 'not-allowed' : 'move',
                fontSize: '14px'
              }} 
              onMouseDown={disabled ? undefined : onDragStart}
              onMouseUp={onDragEnd}
            />
            <Text strong style={{ minWidth: '70px' }}>Period {index + 1}</Text>
          </Space>
        </Col>
        
        {/* Date pickers */}
        <Col xs={24} sm={8} md={6}>
          <DatePicker
            placeholder="Start Date"
            value={range.startDate ? dayjs(range.startDate) : null}
            onChange={(date) => onUpdate({ 
              startDate: date ? date.toISOString() : '' 
            })}
            disabled={disabled}
            style={{ width: '100%' }}
            status={range.error?.includes('Start date') ? 'error' : undefined}
          />
        </Col>
        
        <Col xs={24} sm={8} md={6}>
          <DatePicker
            placeholder="End Date (Optional)"
            value={range.endDate ? dayjs(range.endDate) : null}
            onChange={(date) => onUpdate({ 
              endDate: date ? date.toISOString() : null,
              isCurrent: false
            })}
            disabled={disabled || range.isCurrent}
            style={{ width: '100%' }}
            status={range.error?.includes('End date') ? 'error' : undefined}
          />
        </Col>
        
        {/* Current position checkbox */}
        <Col xs={24} sm={6} md={4}>
          <Checkbox
            checked={range.isCurrent || !range.endDate}
            onChange={(e) => onUpdate({ 
              isCurrent: e.target.checked,
              endDate: e.target.checked ? null : range.endDate
            })}
            disabled={disabled}
          >
            Current
          </Checkbox>
        </Col>
        
        {/* Remove button */}
        <Col flex="none">
          {canRemove && (
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={onRemove}
              size="small"
              disabled={disabled}
              title="Remove this date range"
            />
          )}
        </Col>
      </Row>
      
      {/* Error display */}
      {range.error && (
        <Alert
          message={range.error}
          type="error"
          style={{ marginTop: 8 }}
          showIcon
        />
      )}
      
      {/* Duration display */}
      {range.startDate && (
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          <Text type="secondary">
            Duration: {range.startDate ? dayjs(range.startDate).format('MMM YYYY') : 'Not set'} - {
              range.endDate ? dayjs(range.endDate).format('MMM YYYY') : 'Present'
            }
            {range.startDate && range.endDate && (
              <span> ({dayjs(range.endDate).diff(dayjs(range.startDate), 'month')} months)</span>
            )}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default DateRangeManager;