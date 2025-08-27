'use client'

import React, { useState } from 'react';
import { Tabs, FormInstance } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

// New interface with children function
interface MultilingualFormTabsPropsWithChildren {
  form: FormInstance;
  children: (language: 'en' | 'fr') => React.ReactNode;
  englishFields: string[];
  frenchFields: string[];
  englishContent?: never;
  frenchContent?: never;
}

// Legacy interface with content props
interface MultilingualFormTabsPropsWithContent {
  form?: FormInstance;
  englishContent: React.ReactNode;
  frenchContent: React.ReactNode;
  children?: never;
  englishFields?: never;
  frenchFields?: never;
}

type MultilingualFormTabsProps = 
  | MultilingualFormTabsPropsWithChildren 
  | MultilingualFormTabsPropsWithContent;

const MultilingualFormTabs: React.FC<MultilingualFormTabsProps> = (props) => {
  const [activeTab, setActiveTab] = useState('en');

  // Type guard to determine which interface is being used
  const isContentProps = (p: MultilingualFormTabsProps): p is MultilingualFormTabsPropsWithContent => {
    return 'englishContent' in p;
  };

  const isChildrenProps = (p: MultilingualFormTabsProps): p is MultilingualFormTabsPropsWithChildren => {
    return 'children' in p && p.children !== undefined;
  };

  // Handle both interface types
  let tabContent: { english: React.ReactNode; french: React.ReactNode };
  let showValidation = false;
  let isEnglishComplete = true;
  let isFrenchComplete = true;

  if (isContentProps(props)) {
    // Legacy content-based interface
    tabContent = {
      english: props.englishContent,
      french: props.frenchContent
    };
  } else if (isChildrenProps(props)) {
    // New children function-based interface
    const { form, children, englishFields, frenchFields } = props;
    
    // Check if all required fields for a language are filled
    const checkLanguageCompletion = (fields: string[]) => {
      if (!form) {
        console.warn('MultilingualFormTabs: form instance is not provided');
        return false;
      }
      
      try {
        const values = form.getFieldsValue();
        return fields.every(field => {
          const value = values[field];
          return value && value.toString().trim() !== '';
        });
      } catch (error) {
        console.error('Error accessing form values:', error);
        return false;
      }
    };

    isEnglishComplete = checkLanguageCompletion(englishFields);
    isFrenchComplete = checkLanguageCompletion(frenchFields);
    showValidation = true;

    tabContent = {
      english: children('en'),
      french: children('fr')
    };
  } else {
    // Fallback
    tabContent = { english: <div>No content</div>, french: <div>No content</div> };
  }

  const tabItems = [
    {
      key: 'en',
      label: (
        <div className="flex items-center gap-2">
          <span>English</span>
          {showValidation && (isEnglishComplete ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <ExclamationCircleOutlined className="text-orange-500" />
          ))}
        </div>
      ),
      children: (
        <div className="pt-4">
          {tabContent.english}
        </div>
      )
    },
    {
      key: 'fr',
      label: (
        <div className="flex items-center gap-2">
          <span>Français</span>
          {showValidation && (isFrenchComplete ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <ExclamationCircleOutlined className="text-orange-500" />
          ))}
        </div>
      ),
      children: (
        <div className="pt-4">
          {tabContent.french}
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
        destroyOnHidden={false}
        tabBarStyle={{
          marginBottom: '24px',
          borderBottom: '1px solid #d9d9d9'
        }}
      />

      {/* Validation Summary - only show for children interface */}
      {showValidation && (
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
      )}
    </div>
  );
};

export default MultilingualFormTabs;
