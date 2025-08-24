'use client'

import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import DateRangeManager, { ExperienceDateRange } from './DateRangeManager';

const { Title, Paragraph } = Typography;

const DateRangeManagerDemo: React.FC = () => {
  const [dateRanges, setDateRanges] = useState<ExperienceDateRange[]>([
    {
      id: 'range-1',
      startDate: '2020-01-01',
      endDate: '2021-12-31',
      isCurrent: false
    },
    {
      id: 'range-2', 
      startDate: '2022-03-01',
      endDate: null,
      isCurrent: true
    }
  ]);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Enhanced Date Range Manager Demo</Title>
      
      <Paragraph>
        This demonstrates the dynamic multi-period experience management system.
        Features include:
      </Paragraph>
      
      <ul>
        <li>Progressive disclosure - start simple, expand on demand</li>
        <li>Real-time validation with visual feedback</li>
        <li>Current position indicator</li>
        <li>Chronological ordering with drag support</li>
        <li>Overlap detection and warnings</li>
      </ul>

      <Card style={{ marginTop: '24px' }}>
        <DateRangeManager
          value={dateRanges}
          onChange={setDateRanges}
          validation={{
            allowOverlaps: true,
            maxRanges: 10,
            requireMinimumDuration: true
          }}
        />
      </Card>

      <Card style={{ marginTop: '24px' }} title="Current State (Debug)">
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
          {JSON.stringify(dateRanges, null, 2)}
        </pre>
      </Card>
    </div>
  );
};

export default DateRangeManagerDemo;