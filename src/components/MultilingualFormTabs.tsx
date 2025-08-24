'use client'

import React, { useState } from 'react';
import { Tabs, FormInstance } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface MultilingualFormTabsProps {
  form: FormInstance;
  children: (language: 'en' | 'fr') => React.ReactNode;
  englishFields: string[];
  frenchFields: string[];
}

const MultilingualFormTabs: React.FC<MultilingualFormTabsProps> = ({
  form,
  children,
  englishFields,
  frenchFields
}) => {
  const [activeTab, setActiveTab] = useState('en');

  // Check if all required fields for a language are filled
  const checkLanguageCompletion = (fields: string[]) => {
    const values = form.getFieldsValue();
    return fields.every(field => {
      const value = values[field];
      return value && value.toString().trim() !== '';
    });
  };

  const isEnglishComplete = checkLanguageCompletion(englishFields);
  const isFrenchComplete = checkLanguageCompletion(frenchFields);

  const tabItems = [
    {
      key: 'en',
      label: (
        <div className="flex items-center gap-2">
          <span>English</span>
          {isEnglishComplete ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <ExclamationCircleOutlined className="text-orange-500" />
          )}
        </div>
      ),
      children: (
        <div className="pt-4">
          {children('en')}
        </div>
      )
    },
    {
      key: 'fr',
      label: (
        <div className="flex items-center gap-2">
          <span>Français</span>
          {isFrenchComplete ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <ExclamationCircleOutlined className="text-orange-500" />
          )}
        </div>
      ),
      children: (
        <div className="pt-4">
          {children('fr')}
        </div>
      )
    }
  ];

  return (
    <div className="multilingual-form-tabs">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        tabBarStyle={{
          marginBottom: '24px',
          borderBottom: '1px solid #d9d9d9'
        }}
      />

      {/* Validation Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded border">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-1">
            {isEnglishComplete ? (
              <CheckCircleOutlined className="text-green-500" />
            ) : (
              <ExclamationCircleOutlined className="text-orange-500" />
            )}
            <span>English content: {isEnglishComplete ? 'Complete' : 'Incomplete'}</span>
          </div>
          <div className="flex items-center gap-2">
            {isFrenchComplete ? (
              <CheckCircleOutlined className="text-green-500" />
            ) : (
              <ExclamationCircleOutlined className="text-orange-500" />
            )}
            <span>French content: {isFrenchComplete ? 'Complete' : 'Incomplete'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultilingualFormTabs;
