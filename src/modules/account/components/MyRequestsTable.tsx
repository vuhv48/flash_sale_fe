import { App, Button, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { errorMessage } from '@/core/http/api-error'
import { accountApi } from '@/modules/account/api/account-api'
import { formatDateTime } from '@/shared/lib/format'
import type { RoleRequestView } from '@/shared/types/identity'
import { RequestStatusTag } from '@/shared/components/RequestStatusTag'

export function MyRequestsTable({ enabled = true }: { enabled?: boolean }) {
  const { message } = App.useApp()
  const history = useQuery({
    queryKey: queryKeys.roleRequests.mine,
    queryFn: accountApi.myRoleRequests,
    enabled,
  })
  const cancel = useMutation({
    mutationFn: accountApi.cancelRoleRequest,
    onSuccess: (result) => {
      message.success(result.message)
      void queryClient.invalidateQueries({ queryKey: queryKeys.roleRequests.mine })
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const columns: TableColumnsType<RoleRequestView> = [
    { title: 'Vai trò', dataIndex: 'roleName' },
    {
      title: 'Loại',
      dataIndex: 'action',
      render: (action: RoleRequestView['action']) => (action === 'ADD' ? <Tag color="blue">Xin thêm</Tag> : <Tag color="orange">Xin gỡ</Tag>),
    },
    { title: 'Trạng thái', dataIndex: 'status', render: (status: RoleRequestView['status']) => <RequestStatusTag status={status} /> },
    { title: 'Ghi chú', dataIndex: 'note', render: (value: string | null) => value || '—' },
    { title: 'Lý do từ chối', dataIndex: 'rejectReason', render: (value: string | null) => value || '—' },
    { title: 'Gửi lúc', dataIndex: 'createdAt', render: (value: string) => formatDateTime(value) },
    {
      title: '',
      key: 'actions',
      render: (_, row) =>
        row.status === 'PENDING' ? (
          <Button size="small" loading={cancel.isPending && cancel.variables === row.id} onClick={() => cancel.mutate(row.id)}>
            Hủy
          </Button>
        ) : null,
    },
  ]

  return (
    <Table<RoleRequestView>
      rowKey="id"
      columns={columns}
      dataSource={history.data}
      loading={history.isFetching}
      pagination={{ pageSize: 8, hideOnSinglePage: true }}
      locale={{ emptyText: 'Chưa gửi yêu cầu nào' }}
    />
  )
}
