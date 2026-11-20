import { Alert, App, Button, Card, Checkbox, Form, Input, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/core/auth/session-store'
import { errorMessage } from '@/core/http/api-error'
import { authApi } from '@/modules/auth/api/auth-api'
import { passwordIssue } from '@/shared/lib/password'

type RegisterValues = {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  acceptedTerms: boolean
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const register = useMutation({ mutationFn: authApi.register })

  async function onFinish(values: RegisterValues) {
    try {
      const email = values.email.trim().toLowerCase()
      const result = await register.mutateAsync({
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        acceptedTerms: true,
      })
      useSessionStore.getState().applyTokens(result)
      message.success(result.message || 'Đăng ký thành công')
      navigate('/dashboard', { replace: true })
    } catch {
      // Form hiển thị lỗi từ mutation.
    }
  }

  return (
    <Card className="fs-auth-card">
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Đăng ký
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Tài khoản mới dùng email làm tên đăng nhập và nhận vai trò khách hàng.
      </Typography.Paragraph>
      {register.error ? (
        <Alert type="error" showIcon message={errorMessage(register.error)} style={{ marginBottom: 16 }} />
      ) : null}
      <Form<RegisterValues> layout="vertical" requiredMark={false} onFinish={(values) => void onFinish(values)}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
            { max: 254, message: 'Email tối đa 254 ký tự' },
          ]}
        >
          <Input autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          dependencies={['email']}
          rules={[
            { required: true, message: 'Nhập mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (!value) {
                  return Promise.resolve()
                }
                const issue = passwordIssue(value, getFieldValue('email'))
                return issue ? Promise.reject(new Error(issue)) : Promise.resolve()
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Nhập lại mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Nhập lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Mật khẩu nhập lại không khớp'))
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="fullName"
          label="Họ tên"
          rules={[
            { required: true, message: 'Nhập họ tên' },
            { min: 2, max: 100, message: 'Họ tên từ 2 đến 100 ký tự' },
          ]}
        >
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Nhập số điện thoại' },
            { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' },
          ]}
        >
          <Input autoComplete="tel" />
        </Form.Item>
        <Form.Item
          name="acceptedTerms"
          valuePropName="checked"
          rules={[
            {
              validator(_, value: boolean) {
                return value ? Promise.resolve() : Promise.reject(new Error('Bạn cần đồng ý điều khoản'))
              },
            },
          ]}
        >
          <Checkbox>Tôi đồng ý điều khoản</Checkbox>
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={register.isPending}>
          Tạo tài khoản
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </Typography.Paragraph>
    </Card>
  )
}
