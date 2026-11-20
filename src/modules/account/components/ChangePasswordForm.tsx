import { App, Button, Form, Input } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/core/auth/session-store'
import { errorMessage } from '@/core/http/api-error'
import { queryClient } from '@/core/query/query-client'
import { authApi } from '@/modules/auth/api/auth-api'
import { passwordIssue } from '@/shared/lib/password'

type Values = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordForm() {
  const [form] = Form.useForm<Values>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (result) => {
      message.success(`${result.message}. Vui lòng đăng nhập lại.`)
      useSessionStore.getState().clear()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  return (
    <Form<Values>
      form={form}
      layout="vertical"
      style={{ maxWidth: 420 }}
      onFinish={(values) =>
        changePassword.mutate({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      }
    >
      <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
        <Input.Password autoComplete="current-password" />
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
        label="Nhập lại mật khẩu mới"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Nhập lại mật khẩu mới' },
          ({ getFieldValue }) => ({
            validator(_, value: string) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Mật khẩu nhập lại chưa khớp'))
            },
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
        Đổi mật khẩu
      </Button>
    </Form>
  )
}
