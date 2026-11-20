import { Alert, App, Button, Form, Input } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { errorMessage } from '@/core/http/api-error'
import { accountApi } from '@/modules/account/api/account-api'

type Values = {
  fullName: string
  phone: string
}

export function ProfileForm() {
  const [form] = Form.useForm<Values>()
  const { message } = App.useApp()
  const profile = useQuery({
    queryKey: queryKeys.me.profile,
    queryFn: accountApi.profile,
  })
  const update = useMutation({
    mutationFn: accountApi.updateProfile,
    onSuccess: (result) => {
      message.success('Đã lưu hồ sơ')
      queryClient.setQueryData(queryKeys.me.profile, result)
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  if (profile.error) {
    return <Alert type="error" showIcon message={errorMessage(profile.error)} />
  }

  return (
    <Form<Values>
      form={form}
      layout="vertical"
      style={{ maxWidth: 480 }}
      key={profile.data?.email ?? 'profile'}
      initialValues={{
        fullName: profile.data?.fullName ?? '',
        phone: profile.data?.phone ?? '',
      }}
      onFinish={(values) =>
        update.mutate({
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
        })
      }
    >
      <Form.Item label="Email">
        <Input value={profile.data?.email ?? ''} disabled />
      </Form.Item>
      <Form.Item
        name="fullName"
        label="Họ tên"
        rules={[
          { required: true, message: 'Nhập họ tên' },
          { min: 2, max: 100, message: 'Họ tên từ 2 đến 100 ký tự' },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Nhập số điện thoại' },
          { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' },
        ]}
      >
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={update.isPending || profile.isLoading}>
        Lưu hồ sơ
      </Button>
    </Form>
  )
}
