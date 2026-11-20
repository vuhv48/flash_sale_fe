import { Alert, Card, Col, Row, Statistic, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/core/query/query-keys'
import { useSessionStore } from '@/core/auth/session-store'
import { isRealtimeConfigured } from '@/core/realtime/stomp-client'
import { useMyPermissions, useMyRoles, usePermission } from '@/modules/account/hooks/use-my-access'
import { healthApi } from '@/modules/dashboard/api/health-api'
import { PermissionChart } from '@/modules/dashboard/components/PermissionChart'
import { PageHeader } from '@/shared/components/PageHeader'
import { errorMessage } from '@/core/http/api-error'

export function DashboardPage() {
  const username = useSessionStore((state) => state.username)
  const canViewRoles = usePermission('VIEW_OWN_ROLES')
  const roles = useMyRoles(canViewRoles.allowed)
  const permissions = useMyPermissions()
  const health = useQuery({
    queryKey: queryKeys.health,
    queryFn: healthApi.current,
  })

  return (
    <>
      <PageHeader title="Tổng quan" description={`Phiên của ${username || 'tài khoản đang đăng nhập'}.`} />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vai trò"
              value={canViewRoles.allowed ? (roles.data?.length ?? 0) : '—'}
              loading={canViewRoles.allowed && roles.isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Quyền hiệu lực" value={permissions.data?.length ?? 0} loading={permissions.isLoading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Máy chủ" value={health.data?.status ?? (health.isError ? 'Lỗi' : '…')} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Realtime" value={isRealtimeConfigured() ? 'Sẵn sàng' : 'Chưa bật'} />
          </Card>
        </Col>
      </Row>
      <Card title="Quyền theo nhóm" style={{ marginTop: 16 }}>
        {permissions.error ? (
          <Alert type="error" showIcon message={errorMessage(permissions.error)} />
        ) : (
          <PermissionChart permissions={permissions.data ?? []} />
        )}
      </Card>
      <Card title="Vai trò đang có" style={{ marginTop: 16 }}>
        {canViewRoles.ready && !canViewRoles.allowed
          ? 'Không có quyền xem vai trò.'
          : roles.data?.length
            ? roles.data.map((role) => (
                <Tag key={role.code} color="red" style={{ marginBottom: 8 }}>
                  {role.name}
                </Tag>
              ))
            : '—'}
      </Card>
    </>
  )
}
