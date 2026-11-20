import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="403"
      title="Không đủ quyền"
      subTitle="Tài khoản này không vào được khu vực quản trị."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Về tổng quan
        </Button>
      }
    />
  )
}
