import { Alert, App, Button, Card, Form, Input, Typography } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { authApi } from '@/modules/auth/api/auth-api'
import { passwordIssue } from '@/shared/lib/password'

type Values = {
  token: string
  newPassword: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const reset = useMutation({ mutationFn: authApi.resetPassword })

  async function onFinish(values: Values) {
    try {
      const result = await reset.mutateAsync({
        token: values.token.trim(),
        newPassword: values.newPassword,
      })
      message.success(result.message)
      navigate('/login', { replace: true })
    } catch {
      // Form hiển thị lỗi từ mutation.
    }
  }

  return (
    <Card className="fs-auth-card">
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Đặt lại mật khẩu
      </Typography.Title>
      {reset.error ? (
        <Alert type="error" showIcon message={errorMessage(reset.error)} style={{ marginBottom: 16 }} />
      ) : null}
      <Form<Values>
        layout="vertical"
        requiredMark={false}
        initialValues={{ token: params.get('token') ?? '' }}
        onFinish={(values) => void onFinish(values)}
      >
        <Form.Item name="token" label="Mã đặt lại" rules={[{ required: true, message: 'Nhập mã trong email' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Nhập mật khẩu mới' },
            {
              validator(_, value: string) {
                if (!value) {
                  return Promise.resolve()
                }
                const issue = passwordIssue(value)
                return issue ? Promise.reject(new Error(issue)) : Promise.resolve()
              },
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Nhập lại mật khẩu"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Nhập lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Mật khẩu nhập lại không khớp'))
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={reset.isPending}>
          Đặt lại mật khẩu
        </Button>
      </Form>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Link to="/login">Về đăng nhập</Link>
      </Typography.Paragraph>
    </Card>
  )
}
