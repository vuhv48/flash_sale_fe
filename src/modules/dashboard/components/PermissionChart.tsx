import { Empty } from 'antd'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MyPermission } from '@/shared/types/identity'

export function PermissionChart({ permissions }: { permissions: MyPermission[] }) {
  const data = Object.entries(
    permissions.reduce<Record<string, number>>((groups, permission) => {
      groups[permission.group] = (groups[permission.group] ?? 0) + 1
      return groups
    }, {}),
  ).map(([group, count]) => ({ group, count }))

  if (data.length === 0) {
    return <Empty description="Chưa có quyền hiệu lực" />
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="group" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} width={32} />
          <Tooltip formatter={(value) => [value ?? 0, 'Số quyền']} />
          <Bar dataKey="count" fill="#b42318" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
