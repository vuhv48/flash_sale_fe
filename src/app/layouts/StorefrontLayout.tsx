import { Button, Space, Typography } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/core/auth/session-store'

export function StorefrontLayout() {
  const navigate = useNavigate()
  const accessToken = useSessionStore((state) => state.accessToken)
  const username = useSessionStore((state) => state.username)

  return (
    <div className="fs-store">
      <header className="fs-store-bar">
        <button type="button" className="fs-store-brand" onClick={() => navigate('/events')}>
          FLASH SALE
        </button>
        <Space>
          {accessToken ? (
            <>
              <Typography.Text style={{ color: '#e7e5e4' }}>{username || 'Tài khoản'}</Typography.Text>
              <Button onClick={() => navigate('/dashboard')}>Khu làm việc</Button>
            </>
          ) : (
            <>
              <Button type="text" style={{ color: '#fafaf9' }} onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
              <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
            </>
          )}
        </Space>
      </header>
      <main className="fs-store-main">
        <Outlet />
      </main>
    </div>
  )
}
