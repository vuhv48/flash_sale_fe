import { App, Button, Form, Input, Select } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { errorMessage } from '@/core/http/api-error'
import { accountApi } from '@/modules/account/api/account-api'
import { ROLE_REQUEST_ACTIONS } from '@/shared/constants/identity'
import { blankToUndefined } from '@/shared/lib/format'
import type { RoleRequestAction } from '@/shared/types/identity'

type Values = {
  roleCode: string
  action: RoleRequestAction
  note?: string
  orgName?: string
  taxCode?: string
  representative?: string
}

const taxCodePattern = /^[0-9]{10}$|^[0-9]{13}$/

export function RoleRequestForm() {
  const [form] = Form.useForm<Values>()
  const { message } = App.useApp()
  const roleCode = Form.useWatch('roleCode', form)
  const action = Form.useWatch('action', form)
  const catalog = useQuery({
    queryKey: queryKeys.roles.requestable,
    queryFn: accountApi.requestableRoles,
  })
  const selected = catalog.data?.find((item) => item.code === roleCode)
  const needsOrg = action === 'ADD' && Boolean(selected?.requiresOrgProfile)

  const submit = useMutation({
    mutationFn: accountApi.submitRoleRequest,
    onSuccess: (result) => {
      message.success(result.message)
      form.resetFields()
      void queryClient.invalidateQueries({ queryKey: queryKeys.roleRequests.mine })
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  return (
    <Form<Values>
      form={form}
      layout="vertical"
      style={{ maxWidth: 520 }}
      initialValues={{ action: 'ADD' }}
      onFinish={(values) =>
        submit.mutate({
          roleCode: values.roleCode,
          action: values.action,
          note: blankToUndefined(values.note),
          organizer:
            needsOrg && values.orgName && values.taxCode && values.representative
              ? {
                  orgName: values.orgName.trim(),
                  taxCode: values.taxCode.trim(),
                  representative: values.representative.trim(),
                }
              : undefined,
        })
      }
    >
      <Form.Item name="roleCode" label="Vai trò" rules={[{ required: true, message: 'Chọn vai trò' }]}>
        <Select
          loading={catalog.isLoading}
          placeholder="Chọn vai trò được phép xin"
          options={catalog.data?.map((item) => ({
            value: item.code,
            label: `${item.name} (${item.code})`,
          }))}
        />
      </Form.Item>
      <Form.Item name="action" label="Loại yêu cầu" rules={[{ required: true, message: 'Chọn loại yêu cầu' }]}>
        <Select options={ROLE_REQUEST_ACTIONS.map((item) => ({ value: item.value, label: item.label }))} />
      </Form.Item>
      <Form.Item name="note" label="Ghi chú" rules={[{ max: 500, message: 'Ghi chú tối đa 500 ký tự' }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      {needsOrg ? (
        <>
          <Form.Item
            name="orgName"
            label="Tên đơn vị"
            rules={[
              { required: true, message: 'Nhập tên đơn vị' },
              { max: 200, message: 'Tên đơn vị tối đa 200 ký tự' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taxCode"
            label="Mã số thuế"
            rules={[
              { required: true, message: 'Nhập mã số thuế' },
              { pattern: taxCodePattern, message: 'Mã số thuế phải gồm 10 hoặc 13 chữ số' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="representative"
            label="Người đại diện"
            rules={[
              { required: true, message: 'Nhập người đại diện' },
              { max: 100, message: 'Người đại diện tối đa 100 ký tự' },
            ]}
          >
            <Input />
          </Form.Item>
        </>
      ) : null}
      <Button type="primary" htmlType="submit" loading={submit.isPending}>
        Gửi yêu cầu
      </Button>
    </Form>
  )
}
