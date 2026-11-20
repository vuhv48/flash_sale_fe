import { Alert, App, Button, Card, Form, Input, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/core/auth/session-store'
import { errorMessage } from '@/core/http/api-error'
import { authApi } from '@/modules/auth/api/auth-api'

type LoginValues = {
  email: string
  password: string
}

type FromState = { from?: string }

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const login = useMutation({ mutationFn: authApi.login })

  async function onFinish(values: LoginValues) {
    try {
      const tokens = await login.mutateAsync({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })
      useSessionStore.getState().applyTokens(tokens)
      message.success('Đăng nhập thành công')
      const from = (location.state as FromState | null)?.from
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
    } catch {
      // Form hiển thị lỗi từ mutation.
    }
  }

  return (
    <Card className="fs-auth-card">
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Đăng nhập
      </Typography.Title>
      {login.error ? (
        <Alert type="error" showIcon message={errorMessage(login.error)} style={{ marginBottom: 16 }} />
      ) : null}
      <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={(values) => void onFinish(values)}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
        >
          <Input autoComplete="email" autoFocus />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={login.isPending}>
          Đăng nhập
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </Typography.Paragraph>
    </Card>
  )
}
