import { Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMyPermissions } from '@/modules/account/hooks/use-my-access'
import type { MyPermission } from '@/shared/types/identity'

const LEVEL: Record<string, string> = {
  ALL: 'Toàn bộ',
  OWN: 'Của mình',
  AUTO: 'Tự động',
}

export function PermissionTable() {
  const permissions = useMyPermissions()
  const columns: TableColumnsType<MyPermission> = [
    { title: 'Mã', dataIndex: 'code', width: 110 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Nhóm', dataIndex: 'group', width: 140 },
    { title: 'Hành động', dataIndex: 'action', width: 180 },
    {
      title: 'Mức',
      dataIndex: 'accessLevel',
      width: 120,
      render: (level: string) => <Tag>{LEVEL[level] ?? level}</Tag>,
    },
  ]

  return (
    <Table<MyPermission>
      rowKey="code"
      columns={columns}
      dataSource={permissions.data}
      loading={permissions.isFetching}
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      locale={{ emptyText: 'Chưa có quyền hiệu lực' }}
    />
  )
}
