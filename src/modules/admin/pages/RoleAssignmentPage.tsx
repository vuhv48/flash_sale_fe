import { App, Button, Card, Col, Form, Input, Row, Select } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { errorMessage } from '@/core/http/api-error'
import { adminRoleApi } from '@/modules/admin/api/admin-role-api'
import { PageHeader } from '@/shared/components/PageHeader'
import { SYSTEM_ROLES } from '@/shared/constants/identity'
import { blankToUndefined } from '@/shared/lib/format'

const roleOptions = SYSTEM_ROLES.map((role) => ({
  value: role.code,
  label: `${role.name} (${role.code})`,
}))

type GrantValues = {
  username: string
  roleCode: string
  reason?: string
}

type RevokeValues = {
  username: string
  roleCode: string
  reason?: string
}

export function RoleAssignmentPage() {
  const { message } = App.useApp()
  const [grantForm] = Form.useForm<GrantValues>()
  const [revokeForm] = Form.useForm<RevokeValues>()

  const grant = useMutation({
    mutationFn: (values: GrantValues) =>
      adminRoleApi.grant(values.username.trim(), {
        roleCode: values.roleCode,
        reason: blankToUndefined(values.reason),
      }),
    onSuccess: (result) => {
      message.success(result.message)
      grantForm.resetFields()
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const revoke = useMutation({
    mutationFn: (values: RevokeValues) =>
      adminRoleApi.revoke(values.username.trim(), values.roleCode, blankToUndefined(values.reason)),
    onSuccess: (result) => {
      message.success(result.message)
      revokeForm.resetFields()
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  return (
    <>
      <PageHeader
        title="Cấp và gỡ vai trò"
        description="Cấp thẳng không qua yêu cầu, kể cả quản trị viên. Gỡ vai trò thì thu hồi refresh token của người đó."
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Cấp vai trò">
            <Form<GrantValues> form={grantForm} layout="vertical" onFinish={(values) => grant.mutate(values)}>
              <UsernameField />
              <Form.Item name="roleCode" label="Vai trò" rules={[{ required: true, message: 'Chọn vai trò' }]}>
                <Select options={roleOptions} />
              </Form.Item>
              <Form.Item name="reason" label="Lý do" rules={[{ max: 500, message: 'Lý do tối đa 500 ký tự' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={grant.isPending}>
                Cấp vai trò
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Gỡ vai trò">
            <Form<RevokeValues> form={revokeForm} layout="vertical" onFinish={(values) => revoke.mutate(values)}>
              <UsernameField />
              <Form.Item name="roleCode" label="Vai trò" rules={[{ required: true, message: 'Chọn vai trò' }]}>
                <Select options={roleOptions} />
              </Form.Item>
              <Form.Item name="reason" label="Lý do" rules={[{ max: 500, message: 'Lý do tối đa 500 ký tự' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button danger htmlType="submit" loading={revoke.isPending}>
                Gỡ vai trò
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  )
}

function UsernameField() {
  return (
    <Form.Item
      name="username"
      label="Tên đăng nhập"
      rules={[
        { required: true, message: 'Nhập tên đăng nhập' },
        { min: 3, max: 64, message: 'Tên đăng nhập từ 3 đến 64 ký tự' },
      ]}
    >
      <Input placeholder="vuhoang" autoComplete="off" />
    </Form.Item>
  )
}
