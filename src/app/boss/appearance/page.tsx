'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, message, Switch, Upload, Image, Row, Col, Modal, Radio, Select } from 'antd';
import { UploadOutlined, PictureOutlined, CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface NavbarConfig {
  id: string;
  logoText: string;
  logoImageUrl: string | null;
  useImageLogo: boolean;
  workExperienceLabel: string;
  careerSeriesLabel: string;
  educationLabel: string;
  certificationsLabel: string;
  skillsLabel: string;
  backgroundColor: string;
  backgroundType: string;
  backgroundImageUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  logoFontFamily: string;
}

interface FooterConfig {
  id: string;
  logoText: string;
  logoImageUrl: string | null;
  useImageLogo: boolean;
  copyrightText: string;
  linkedinUrl: string | null;
  showLinkedin: boolean;
  backgroundColor: string;
  textColor: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

const AppearancePage = () => {
  const [form] = Form.useForm();
  const [logoForm] = Form.useForm();
  const [backgroundForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [footerForm] = Form.useForm();
  const [footerLoading, setFooterLoading] = useState(false);
  const [navbarConfig, setNavbarConfig] = useState<NavbarConfig | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isBackgroundGalleryVisible, setIsBackgroundGalleryVisible] = useState(false);
  const [isFooterGalleryVisible, setIsFooterGalleryVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [navbarResponse, footerResponse, mediaResponse] = await Promise.all([
          fetch('/api/navbar-config'),
          fetch('/api/footer-config'),
          fetch('/api/media')
        ]);

        const config = await navbarResponse.json();
        const footerConfigData = await footerResponse.json();
        const mediaData = await mediaResponse.json();

        setNavbarConfig(config);
        setFooterConfig(footerConfigData);

        // Filter only images for logo selection
        const imageMedia = mediaData.filter((item: { type: string }) => item.type === 'image').map((item: { id: string; url: string; type: string }) => ({
          id: item.id,
          url: item.url,
          type: item.type as 'image' | 'video'
        }));
        setAllMedia(imageMedia);

        form.setFieldsValue({
          workExperienceLabel: config.workExperienceLabel,
          careerSeriesLabel: config.careerSeriesLabel,
          educationLabel: config.educationLabel,
          certificationsLabel: config.certificationsLabel,
          skillsLabel: config.skillsLabel,
        });

        logoForm.setFieldsValue({
          logoText: config.logoText,
          useImageLogo: config.useImageLogo,
          logoImageUrl: config.logoImageUrl,
          logoFontFamily: config.logoFontFamily || "Inter"
        });

        backgroundForm.setFieldsValue({
          backgroundColor: config.backgroundColor,
          backgroundType: config.backgroundType,
          backgroundImageUrl: config.backgroundImageUrl,
          gradientFrom: config.gradientFrom,
          gradientTo: config.gradientTo,
          fontFamily: config.fontFamily
        });

        footerForm.setFieldsValue({
          logoText: footerConfigData.logoText || "resumeflex",
          useImageLogo: footerConfigData.useImageLogo || false,
          logoImageUrl: footerConfigData.logoImageUrl || null,
          copyrightText: footerConfigData.copyrightText || "© 2025 resumeflex. All rights reserved.",
          linkedinUrl: footerConfigData.linkedinUrl || "",
          showLinkedin: footerConfigData.showLinkedin !== undefined ? footerConfigData.showLinkedin : true,
          backgroundColor: footerConfigData.backgroundColor || "#0a0a0a",
          textColor: footerConfigData.textColor || "#ffffff"
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('Failed to load configuration');
      }
    };

    fetchData();
  }, [form, logoForm, backgroundForm]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const response = await fetch('/api/navbar-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setNavbarConfig(updatedConfig);
        message.success('Navbar configuration updated successfully!');
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Failed to save navbar config:', error);
      message.error('Failed to save navbar configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSave = async () => {
    try {
      setLogoLoading(true);
      const values = await logoForm.validateFields();

      const response = await fetch('/api/navbar-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setNavbarConfig(updatedConfig);
        message.success('Logo configuration updated successfully!');
      } else {
        throw new Error('Failed to update logo configuration');
      }
    } catch (error) {
      console.error('Failed to save logo config:', error);
      message.error('Failed to save logo configuration');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files for the logo!');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('highlightId', 'logo');

      const response = await fetch('/api/upload/highlights', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      logoForm.setFieldsValue({ logoImageUrl: result.url });
      message.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload logo');
    }

    return false;
  };

  const handleGallerySelect = (selectedMedia: MediaItem) => {
    logoForm.setFieldsValue({ logoImageUrl: selectedMedia.url });
    setIsGalleryVisible(false);
    message.success('Logo selected from gallery!');
  };

  const handleBackgroundSave = async () => {
    try {
      setBackgroundLoading(true);
      const values = await backgroundForm.validateFields();

      const response = await fetch('/api/navbar-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setNavbarConfig(updatedConfig);
        message.success('Background & font configuration updated successfully!');
      } else {
        throw new Error('Failed to update background configuration');
      }
    } catch (error) {
      console.error('Failed to save background config:', error);
      message.error('Failed to save background configuration');
    } finally {
      setBackgroundLoading(false);
    }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files for the background!');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('highlightId', 'background');

      const response = await fetch('/api/upload/highlights', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      backgroundForm.setFieldsValue({ backgroundImageUrl: result.url });
      message.success('Background image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload background image');
    }

    return false;
  };

  const handleBackgroundGallerySelect = (selectedMedia: MediaItem) => {
    backgroundForm.setFieldsValue({ backgroundImageUrl: selectedMedia.url });
    setIsBackgroundGalleryVisible(false);
    message.success('Background image selected from gallery!');
  };

  const handleFooterSave = async () => {
    try {
      setFooterLoading(true);
      const values = await footerForm.validateFields();

      const response = await fetch('/api/footer-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setFooterConfig(updatedConfig);
        message.success('Footer configuration updated successfully!');
      } else {
        throw new Error('Failed to update footer configuration');
      }
    } catch (error) {
      console.error('Failed to save footer config:', error);
      message.error('Failed to save footer configuration');
    } finally {
      setFooterLoading(false);
    }
  };

  const handleFooterImageUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files for the footer logo!');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('highlightId', 'footer-logo');

      const response = await fetch('/api/upload/highlights', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      footerForm.setFieldsValue({ logoImageUrl: result.url });
      message.success('Footer logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload footer logo');
    }

    return false;
  };

  const handleFooterGallerySelect = (selectedMedia: MediaItem) => {
    footerForm.setFieldsValue({ logoImageUrl: selectedMedia.url });
    setIsFooterGalleryVisible(false);
    message.success('Footer logo selected from gallery!');
  };

  return (
    <div>
      <Title level={2}>Appearance</Title>
      <p>Customize the look and feel of your resumeflex page.</p>

      {/* Logo Configuration Card */}
      <Card
        title="Logo Configuration"
        style={{ marginTop: 24 }}
        extra={
          <Button
            type="primary"
            onClick={handleLogoSave}
            loading={logoLoading}
          >
            Save Logo
          </Button>
        }
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          Customize your site logo - use text or upload an image.
        </p>

        <Form
          form={logoForm}
          layout="vertical"
          onFinish={handleLogoSave}
        >
          <Form.Item
            name="logoText"
            label="Logo Text"
            rules={[{ required: true, message: 'Please enter logo text' }]}
          >
            <Input placeholder="e.g., resumeflex, MyPortfolio, John Doe" />
          </Form.Item>
          <Form.Item
            name="logoFontFamily"
            label="Logo Font Family"
            rules={[{ required: true, message: 'Please select a logo font family' }]}
          >
            <Select 
              placeholder="Select logo font family" 
              showSearch
              filterOption={(input, option) =>
                (option?.children as any)?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              dropdownStyle={{ 
                fontSize: '16px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingTop: '8px',
                paddingBottom: '8px'
              }}
              style={{ fontSize: '14px' }}
            >
              <Option value="Inter">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}>Inter (Default)</span>
              </Option>
              <Option value="Arial">
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: '500' }}>Arial</span>
              </Option>
              <Option value="Helvetica">
                <span style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '16px', fontWeight: '500' }}>Helvetica</span>
              </Option>
              <Option value="Georgia">
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '500' }}>Georgia</span>
              </Option>
              <Option value="Times New Roman">
                <span style={{ fontFamily: '"Times New Roman", serif', fontSize: '16px', fontWeight: '500' }}>Times New Roman</span>
              </Option>
              <Option value="Roboto">
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '500' }}>Roboto</span>
              </Option>
              <Option value="Open Sans">
                <span style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '16px', fontWeight: '500' }}>Open Sans</span>
              </Option>
              <Option value="Lato">
                <span style={{ fontFamily: 'Lato, sans-serif', fontSize: '16px', fontWeight: '500' }}>Lato</span>
              </Option>
              <Option value="Montserrat">
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: '500' }}>Montserrat</span>
              </Option>
              <Option value="Poppins">
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '500' }}>Poppins</span>
              </Option>
              <Option value="var(--font-caveat-brush)">
                <span style={{ fontFamily: 'var(--font-caveat-brush), cursive', fontSize: '18px', fontWeight: '500' }}>Caveat Brush (Google Font)</span>
              </Option>
              <Option value="var(--font-pacifico)">
                <span style={{ fontFamily: 'var(--font-pacifico), cursive', fontSize: '18px', fontWeight: '500' }}>Pacifico (Google Font)</span>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="useImageLogo"
            label="Use Image Logo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.useImageLogo !== currentValues.useImageLogo
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('useImageLogo') ? (
                <Form.Item name="logoImageUrl" label="Logo Image">
                  <div>
                    <Upload
                      beforeUpload={handleImageUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                    <Button
                      icon={<PictureOutlined />}
                      onClick={() => setIsGalleryVisible(true)}
                      style={{ marginLeft: 8 }}
                    >
                      Gallery
                    </Button>

                    {/* Preview current logo */}
                    {logoForm.getFieldValue('logoImageUrl') && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Current Logo:</p>
                        <img
                          src={logoForm.getFieldValue('logoImageUrl')}
                          alt="Logo preview"
                          style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          size="small"
                          onClick={() => logoForm.setFieldsValue({ logoImageUrl: null })}
                          style={{ marginLeft: 8 }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="Navigation Configuration"
        style={{ marginTop: 24 }}
        extra={
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
          >
            Save Changes
          </Button>
        }
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          Customize the section names that appear in your top navigation bar.
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="workExperienceLabel"
            label="Work Experience Section Name"
            rules={[{ required: true, message: 'Please enter a name for the Work Experience section' }]}
          >
            <Input placeholder="e.g., Work Experience, Professional Experience, Career" />
          </Form.Item>

          <Form.Item
            name="careerSeriesLabel"
            label="Career Series Section Name"
            rules={[{ required: true, message: 'Please enter a name for the Career Series section' }]}
          >
            <Input placeholder="e.g., Career Series, Career Journey, Professional Series" />
          </Form.Item>

          <Form.Item
            name="educationLabel"
            label="Education Section Name"
            rules={[{ required: true, message: 'Please enter a name for the Education section' }]}
          >
            <Input placeholder="e.g., Education, Academic Background, Learning" />
          </Form.Item>

          <Form.Item
            name="certificationsLabel"
            label="Certifications Section Name"
            rules={[{ required: true, message: 'Please enter a name for the Certifications section' }]}
          >
            <Input placeholder="e.g., Certifications, Credentials, Achievements" />
          </Form.Item>

          <Form.Item
            name="skillsLabel"
            label="Skills Section Name"
            rules={[{ required: true, message: 'Please enter a name for the Skills section' }]}
          >
            <Input placeholder="e.g., Skills, Expertise, Technologies" />
          </Form.Item>
        </Form>
      </Card>

      {/* Background & Website Font Configuration Card */}
      <Card
        title="Background & Website Font Configuration"
        style={{ marginTop: 24 }}
        extra={
          <Button
            type="primary"
            onClick={handleBackgroundSave}
            loading={backgroundLoading}
          >
            Save Style
          </Button>
        }
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          Customize your homepage background and general website font style (logo font is configured separately).
        </p>

        <Form
          form={backgroundForm}
          layout="vertical"
          onFinish={handleBackgroundSave}
        >
          <Form.Item
            name="fontFamily"
            label="Website Font Family"
            rules={[{ required: true, message: 'Please select a font family' }]}
          >
            <Select 
              placeholder="Select font family"
              showSearch
              filterOption={(input, option) =>
                (option?.children as any)?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              dropdownStyle={{ 
                fontSize: '16px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingTop: '8px',
                paddingBottom: '8px'
              }}
              style={{ fontSize: '14px' }}
            >
              <Option value="Inter">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}>Inter (Default)</span>
              </Option>
              <Option value="Arial">
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', fontWeight: '500' }}>Arial</span>
              </Option>
              <Option value="Helvetica">
                <span style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '16px', fontWeight: '500' }}>Helvetica</span>
              </Option>
              <Option value="Georgia">
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '500' }}>Georgia</span>
              </Option>
              <Option value="Times New Roman">
                <span style={{ fontFamily: '"Times New Roman", serif', fontSize: '16px', fontWeight: '500' }}>Times New Roman</span>
              </Option>
              <Option value="Roboto">
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '500' }}>Roboto</span>
              </Option>
              <Option value="Open Sans">
                <span style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '16px', fontWeight: '500' }}>Open Sans</span>
              </Option>
              <Option value="Lato">
                <span style={{ fontFamily: 'Lato, sans-serif', fontSize: '16px', fontWeight: '500' }}>Lato</span>
              </Option>
              <Option value="Montserrat">
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: '500' }}>Montserrat</span>
              </Option>
              <Option value="Poppins">
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '500' }}>Poppins</span>
              </Option>
              <Option value="var(--font-caveat-brush)">
                <span style={{ fontFamily: 'var(--font-caveat-brush), cursive', fontSize: '18px', fontWeight: '500' }}>Caveat Brush (Google Font)</span>
              </Option>
              <Option value="var(--font-pacifico)">
                <span style={{ fontFamily: 'var(--font-pacifico), cursive', fontSize: '18px', fontWeight: '500' }}>Pacifico (Google Font)</span>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="backgroundType"
            label="Background Type"
            rules={[{ required: true, message: 'Please select a background type' }]}
          >
            <Radio.Group>
              <Radio value="color">Solid Color</Radio>
              <Radio value="gradient">Gradient</Radio>
              <Radio value="image">Image</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.backgroundType !== currentValues.backgroundType
            }
          >
            {({ getFieldValue }) => {
              const backgroundType = getFieldValue('backgroundType');

              if (backgroundType === 'color') {
                return (
                  <Form.Item
                    name="backgroundColor"
                    label="Background Color"
                    rules={[{ required: true, message: 'Please enter a background color' }]}
                  >
                    <Input type="color" style={{ width: 100, height: 40 }} />
                  </Form.Item>
                );
              }

              if (backgroundType === 'gradient') {
                return (
                  <>
                    <Form.Item
                      name="gradientFrom"
                      label="Gradient From Color"
                      rules={[{ required: true, message: 'Please enter the starting gradient color' }]}
                    >
                      <Input type="color" style={{ width: 100, height: 40 }} />
                    </Form.Item>
                    <Form.Item
                      name="gradientTo"
                      label="Gradient To Color"
                      rules={[{ required: true, message: 'Please enter the ending gradient color' }]}
                    >
                      <Input type="color" style={{ width: 100, height: 40 }} />
                    </Form.Item>
                  </>
                );
              }

              if (backgroundType === 'image') {
                return (
                  <Form.Item name="backgroundImageUrl" label="Background Image">
                    <div>
                      <Upload
                        beforeUpload={handleBackgroundImageUpload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />}>Upload Background</Button>
                      </Upload>
                      <Button
                        icon={<PictureOutlined />}
                        onClick={() => setIsBackgroundGalleryVisible(true)}
                        style={{ marginLeft: 8 }}
                      >
                        Gallery
                      </Button>

                      {/* Preview current background */}
                      {backgroundForm.getFieldValue('backgroundImageUrl') && (
                        <div style={{ marginTop: 16 }}>
                          <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Current Background:</p>
                          <img
                            src={backgroundForm.getFieldValue('backgroundImageUrl')}
                            alt="Background preview"
                            style={{ maxHeight: 100, maxWidth: 300, objectFit: 'cover' }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            size="small"
                            onClick={() => backgroundForm.setFieldsValue({ backgroundImageUrl: null })}
                            style={{ marginLeft: 8 }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </Form.Item>
                );
              }

              return null;
            }}
          </Form.Item>
        </Form>
      </Card>

      {/* Footer Configuration Card */}
      <Card
        title="Footer Configuration"
        style={{ marginTop: 24 }}
        extra={
          <Button
            type="primary"
            onClick={handleFooterSave}
            loading={footerLoading}
          >
            Save Footer
          </Button>
        }
      >
        <p style={{ marginBottom: 16, color: '#666' }}>
          Customize your footer with logo, copyright text, and social links.
        </p>

        <Form
          form={footerForm}
          layout="vertical"
          onFinish={handleFooterSave}
        >
          <Form.Item
            name="logoText"
            label="Footer Logo Text"
            rules={[{ required: true, message: 'Please enter footer logo text' }]}
          >
            <Input placeholder="e.g., resumeflex, MyPortfolio, John Doe" />
          </Form.Item>

          <Form.Item
            name="useImageLogo"
            label="Use Image Logo in Footer"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.useImageLogo !== currentValues.useImageLogo
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('useImageLogo') ? (
                <Form.Item name="logoImageUrl" label="Footer Logo Image">
                  <div>
                    <Upload
                      beforeUpload={handleFooterImageUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Upload Footer Logo</Button>
                    </Upload>
                    <Button
                      icon={<PictureOutlined />}
                      onClick={() => setIsFooterGalleryVisible(true)}
                      style={{ marginLeft: 8 }}
                    >
                      Gallery
                    </Button>

                    {/* Preview current footer logo */}
                    {footerForm.getFieldValue('logoImageUrl') && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Current Footer Logo:</p>
                        <img
                          src={footerForm.getFieldValue('logoImageUrl')}
                          alt="Footer logo preview"
                          style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain' }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          size="small"
                          onClick={() => footerForm.setFieldsValue({ logoImageUrl: null })}
                          style={{ marginLeft: 8 }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="copyrightText"
            label="Copyright Text"
            rules={[{ required: true, message: 'Please enter copyright text' }]}
          >
            <Input placeholder="e.g., © 2025 resumeflex. All rights reserved." />
          </Form.Item>

          <Form.Item
            name="showLinkedin"
            label="Show LinkedIn Icon"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.showLinkedin !== currentValues.showLinkedin
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('showLinkedin') ? (
                <Form.Item
                  name="linkedinUrl"
                  label="LinkedIn Profile URL"
                  rules={[
                    { required: true, message: 'Please enter your LinkedIn URL' },
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                >
                  <Input placeholder="https://linkedin.com/in/your-profile" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="backgroundColor"
            label="Footer Background Color"
            rules={[{ required: true, message: 'Please select a background color' }]}
            initialValue="#0a0a0a"
          >
            <Input type="color" style={{ width: 100, height: 40 }} />
          </Form.Item>

          <Form.Item
            name="textColor"
            label="Footer Text Color"
            rules={[{ required: true, message: 'Please select a text color' }]}
            initialValue="#ffffff"
          >
            <Input type="color" style={{ width: 100, height: 40 }} />
          </Form.Item>
        </Form>
      </Card>

      {/* Gallery Modal */}
      <Modal
        title="Select Logo from Gallery"
        open={isGalleryVisible}
        onCancel={() => setIsGalleryVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {allMedia.map((item) => (
            <Col span={8} key={item.id}>
              <div
                onClick={() => handleGallerySelect(item)}
                style={{ cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px' }}
              >
                <Image
                  src={item.url}
                  alt="Gallery item"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  Logo Option
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Background Gallery Modal */}
      <Modal
        title="Select Background from Gallery"
        open={isBackgroundGalleryVisible}
        onCancel={() => setIsBackgroundGalleryVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {allMedia.map((item) => (
            <Col span={8} key={item.id}>
              <div
                onClick={() => handleBackgroundGallerySelect(item)}
                style={{ cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px' }}
              >
                <Image
                  src={item.url}
                  alt="Gallery item"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  Background Option
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Footer Gallery Modal */}
      <Modal
        title="Select Footer Logo from Gallery"
        open={isFooterGalleryVisible}
        onCancel={() => setIsFooterGalleryVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          {allMedia.map((item) => (
            <Col span={8} key={item.id}>
              <div
                onClick={() => handleFooterGallerySelect(item)}
                style={{ cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px' }}
              >
                <Image
                  src={item.url}
                  alt="Gallery item"
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  Footer Logo Option
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
};

export default AppearancePage;
