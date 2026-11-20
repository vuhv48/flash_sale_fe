import {
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAnyPermission, usePermission } from '@/modules/account/hooks/use-my-access'
import { useSessionStore } from '@/core/auth/session-store'
import { queryClient } from '@/core/query/query-client'
import { authApi } from '@/modules/auth/api/auth-api'

const { Header, Sider, Content } = Layout

function selectedKey(items: MenuProps['items'], pathname: string) {
  const keys: string[] = []
  for (const item of items ?? []) {
    if (!item) {
      continue
    }
    if ('children' in item && item.children) {
      for (const child of item.children) {
        if (child && 'key' in child && typeof child.key === 'string') {
          keys.push(child.key)
        }
      }
    } else if ('key' in item && typeof item.key === 'string') {
      keys.push(item.key)
    }
  }
  return keys.sort((left, right) => right.length - left.length).find((key) => pathname.startsWith(key)) ?? '/dashboard'
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = useSessionStore((state) => state.username)
  const organizer = useAnyPermission(['CREATE_DRAFT_EVENT', 'UPDATE_OWN_EVENT', 'SUBMIT_EVENT'])
  const reviewEvents = useAnyPermission(['REVIEW_EVENT', 'CANCEL_EVENT'])
  const reviewRoles = usePermission('REVIEW_ROLE_REQUEST')
  const assign = usePermission('MANAGE_ROLES')
  const accounts = useAnyPermission(['READ_USERS', 'LOCK_ACCOUNT'])

  const items = useMemo<MenuProps['items']>(() => {
    const next: MenuProps['items'] = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
      { key: '/account', icon: <UserOutlined />, label: 'Tài khoản của tôi' },
    ]
    if (organizer.allowed) {
      next.push({
        type: 'group',
        label: 'Ban tổ chức',
        children: [{ key: '/organizer/events', icon: <CalendarOutlined />, label: 'Sự kiện của tôi' }],
      })
    }
    const operations: NonNullable<MenuProps['items']> = []
    if (reviewEvents.allowed) {
      operations.push({ key: '/admin/events', icon: <CheckCircleOutlined />, label: 'Duyệt sự kiện' })
    }
    if (reviewRoles.allowed) {
      operations.push({ key: '/admin/role-requests', icon: <AuditOutlined />, label: 'Duyệt vai trò' })
    }
    if (assign.allowed) {
      operations.push({ key: '/admin/roles', icon: <TeamOutlined />, label: 'Cấp và gỡ vai trò' })
    }
    if (accounts.allowed) {
      operations.push({ key: '/admin/users', icon: <UserSwitchOutlined />, label: 'Tài khoản' })
    }
    if (operations.length > 0) {
      next.push({ type: 'group', label: 'Vận hành', children: operations })
    }
    return next
  }, [accounts.allowed, assign.allowed, organizer.allowed, reviewEvents.allowed, reviewRoles.allowed])

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Phiên cục bộ vẫn được xóa khi máy chủ không phản hồi.
    }
    useSessionStore.getState().clear()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={0} width={248}>
        <div className="fs-sider-brand">FLASH SALE</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey(items, location.pathname)]}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="fs-header">
          <Space>
            <Button icon={<ShopOutlined />} onClick={() => navigate('/events')}>
              Trang bán vé
            </Button>
            <Typography.Text>{username || 'Tài khoản'}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={() => void logout()}>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content className="fs-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
