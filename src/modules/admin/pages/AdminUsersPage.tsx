import { App, Button, Form, Input, Modal, Space, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { errorMessage } from '@/core/http/api-error'
import { adminUserApi } from '@/modules/admin/api/admin-user-api'
import { usePermission } from '@/modules/account/hooks/use-my-access'
import { PageHeader } from '@/shared/components/PageHeader'
import type { AdminUser } from '@/shared/types/identity'

type ActionState = {
  user: AdminUser
  mode: 'lock' | 'unlock'
}

export function AdminUsersPage() {
  const { message } = App.useApp()
  const canSearch = usePermission('READ_USERS')
  const canLock = usePermission('LOCK_ACCOUNT')
  const [draft, setDraft] = useState('')
  const [name, setName] = useState('')
  const [action, setAction] = useState<ActionState | null>(null)
  const [reasonForm] = Form.useForm<{ reason: string }>()

  const users = useQuery({
    queryKey: queryKeys.adminUsers(name),
    queryFn: () => adminUserApi.search(name),
    enabled: canSearch.allowed,
  })

  const mutate = useMutation({
    mutationFn: (values: { username: string; reason: string; mode: 'lock' | 'unlock' }) =>
      values.mode === 'lock'
        ? adminUserApi.lock(values.username, values.reason)
        : adminUserApi.unlock(values.username, values.reason),
    onSuccess: (result) => {
      message.success(result.message)
      setAction(null)
      reasonForm.resetFields()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const columns: TableColumnsType<AdminUser> = [
    { title: 'Email', dataIndex: 'email' },
    { title: 'Họ tên', dataIndex: 'fullName', render: (value: string | null) => value || '—' },
    { title: 'Số điện thoại', dataIndex: 'phone', render: (value: string | null) => value || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'enabled',
      width: 120,
      render: (enabled: boolean) => (enabled ? <Tag color="green">Đang mở</Tag> : <Tag color="red">Đã khóa</Tag>),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, row) =>
        canLock.allowed ? (
          <Button
            size="small"
            danger={row.enabled}
            onClick={() => setAction({ user: row, mode: row.enabled ? 'lock' : 'unlock' })}
          >
            {row.enabled ? 'Khóa' : 'Mở khóa'}
          </Button>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader
        title="Tài khoản"
        description="Tìm tối đa 20 tài khoản chưa xóa. Khóa thì thu hồi refresh token. Tài khoản đăng ký mới có tên đăng nhập trùng email."
      />
      {canSearch.allowed ? (
        <Space style={{ marginBottom: 16 }}>
          <Input
            allowClear
            placeholder="Email, tên đăng nhập hoặc họ tên"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPressEnter={() => setName(draft.trim())}
            style={{ width: 320 }}
          />
          <Button type="primary" onClick={() => setName(draft.trim())}>
            Tìm
          </Button>
        </Space>
      ) : (
        <p>Tài khoản này không có quyền xem danh sách.</p>
      )}
      <Table<AdminUser>
        rowKey="id"
        columns={columns}
        dataSource={users.data}
        loading={users.isFetching}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: 'Không có tài khoản' }}
      />
      <Modal
        title={action?.mode === 'lock' ? `Khóa ${action.user.email}` : `Mở khóa ${action?.user.email ?? ''}`}
        open={Boolean(action)}
        okText={action?.mode === 'lock' ? 'Khóa' : 'Mở khóa'}
        cancelText="Đóng"
        confirmLoading={mutate.isPending}
        onCancel={() => {
          setAction(null)
          reasonForm.resetFields()
        }}
        onOk={() => {
          void reasonForm.validateFields().then((values) => {
            if (action) {
              mutate.mutate({
                username: action.user.email,
                reason: values.reason.trim(),
                mode: action.mode,
              })
            }
          })
        }}
        destroyOnHidden
      >
        <Form form={reasonForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[
              { required: true, message: 'Nhập lý do' },
              { max: 500, message: 'Lý do tối đa 500 ký tự' },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
