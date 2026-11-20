import { Alert, App, Button, Card, Form, Input, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { authApi } from '@/modules/auth/api/auth-api'

type Values = { email: string }

export function ForgotPasswordPage() {
  const { message } = App.useApp()
  const forgot = useMutation({
    mutationFn: (values: Values) => authApi.forgotPassword(values.email.trim().toLowerCase()),
    onSuccess: (result) => message.success(result.message),
  })

  return (
    <Card className="fs-auth-card">
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Quên mật khẩu
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Nếu email tồn tại, hệ thống gửi mã đặt lại mật khẩu. Mã có hiệu lực 30 phút.
      </Typography.Paragraph>
      {forgot.error ? (
        <Alert type="error" showIcon message={errorMessage(forgot.error)} style={{ marginBottom: 16 }} />
      ) : null}
      {forgot.data ? (
        <Alert type="success" showIcon message={forgot.data.message} style={{ marginBottom: 16 }} />
      ) : null}
      <Form<Values> layout="vertical" requiredMark={false} onFinish={(values) => forgot.mutate(values)}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
        >
          <Input autoComplete="email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={forgot.isPending}>
          Gửi hướng dẫn
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        Đã có mã? <Link to="/reset-password">Đặt lại mật khẩu</Link>
      </Typography.Paragraph>
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        <Link to="/login">Về đăng nhập</Link>
      </Typography.Paragraph>
    </Card>
  )
}
