import { Alert, Card, Space, Tabs, Tag, Typography } from 'antd'
import { ChangePasswordForm } from '@/modules/account/components/ChangePasswordForm'
import { MyRequestsTable } from '@/modules/account/components/MyRequestsTable'
import { PermissionTable } from '@/modules/account/components/PermissionTable'
import { ProfileForm } from '@/modules/account/components/ProfileForm'
import { RoleRequestForm } from '@/modules/account/components/RoleRequestForm'
import { useMyRoles, usePermission } from '@/modules/account/hooks/use-my-access'
import { PageHeader } from '@/shared/components/PageHeader'

export function AccountPage() {
  const profile = usePermission('MANAGE_PROFILE')
  const canRequest = usePermission('REQUEST_ROLE')
  const canViewRoles = usePermission('VIEW_OWN_ROLES')
  const roles = useMyRoles(canViewRoles.allowed)

  return (
    <>
      <PageHeader
        title="Tài khoản của tôi"
        description="Hồ sơ, vai trò, quyền hiệu lực và mật khẩu."
      />
      {canViewRoles.allowed ? (
        <Card style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">Vai trò hiện có</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {roles.data?.length
                ? roles.data.map((role) => (
                    <Tag key={role.code} color="red">
                      {role.name}
                    </Tag>
                  ))
                : '—'}
            </Space>
          </div>
        </Card>
      ) : null}
      <Tabs
        items={[
          {
            key: 'profile',
            label: 'Hồ sơ',
            children:
              profile.ready && !profile.allowed ? (
                <Alert type="warning" showIcon message="Tài khoản không có quyền xem hồ sơ." />
              ) : (
                <ProfileForm />
              ),
          },
          {
            key: 'request',
            label: 'Xin vai trò',
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {canRequest.allowed ? (
                  <RoleRequestForm />
                ) : (
                  <Alert type="info" showIcon message="Tài khoản không có quyền gửi yêu cầu vai trò." />
                )}
                <Typography.Title level={5}>Lịch sử yêu cầu</Typography.Title>
                {canViewRoles.ready && !canViewRoles.allowed ? (
                  <Alert type="info" showIcon message="Tài khoản không có quyền xem lịch sử yêu cầu." />
                ) : (
                  <MyRequestsTable enabled={canViewRoles.allowed} />
                )}
              </Space>
            ),
          },
          {
            key: 'permissions',
            label: 'Quyền',
            children: <PermissionTable />,
          },
          {
            key: 'password',
            label: 'Đổi mật khẩu',
            children:
              profile.ready && !profile.allowed ? (
                <Alert type="warning" showIcon message="Tài khoản không có quyền đổi mật khẩu." />
              ) : (
                <ChangePasswordForm />
              ),
          },
        ]}
      />
    </>
  )
}
