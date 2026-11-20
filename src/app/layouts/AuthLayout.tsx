import { Typography } from 'antd'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="fs-auth">
      <section className="fs-auth-brand">
        <div>
          <div className="fs-brand-mark">FLASH SALE</div>
          <Typography.Title level={2} style={{ color: '#fafaf9', marginTop: 12 }}>
            Phiên bán, vai trò, quyền.
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#d6d3d1', marginBottom: 0, maxWidth: 320 }}>
            Đăng nhập để giữ phiên làm việc. Vai trò thêm mới chỉ có hiệu lực sau khi quản trị duyệt.
          </Typography.Paragraph>
        </div>
      </section>
      <section className="fs-auth-panel">
        <Outlet />
      </section>
    </div>
  )
}
