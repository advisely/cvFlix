
'use client'

import { Button, Form, Input } from 'antd';
import { signIn } from 'next-auth/react';
import { LoginFormData } from './types';

const LoginPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values: LoginFormData) => {
    signIn('credentials', { email: values.email, password: values.password, callbackUrl: '/boss' });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #1f2937 100%)',
        padding: '24px'
      }}
    >
      <Form
        form={form}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        style={{
          width: '100%',
          maxWidth: 360,
          backgroundColor: '#ffffff',
          padding: '32px 28px',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(148, 163, 184, 0.25)'
        }}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
