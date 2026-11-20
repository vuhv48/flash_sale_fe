import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useState } from 'react'
import { errorMessage } from '@/core/http/api-error'
import { organizerEventApi } from '@/modules/events/api/organizer-event-api'
import type { OrganizerEventDetail, OrganizerTicketType } from '@/modules/events/model/types'
import { formatMoney } from '@/shared/lib/format'

type TicketForm = {
  name: string
  price: number
  totalQuantity: number
  sortOrder?: number
}

type TicketTypePanelProps = {
  event: OrganizerEventDetail
  canAdd: boolean
  canChange: boolean
  onChanged: (detail: OrganizerEventDetail) => void
}

export function TicketTypePanel({ event, canAdd, canChange, onChanged }: TicketTypePanelProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<TicketForm>()
  const [editing, setEditing] = useState<OrganizerTicketType | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ sortOrder: event.ticketTypes.length + 1 })
    setOpen(true)
  }

  function openEdit(row: OrganizerTicketType) {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      price: row.price,
      totalQuantity: row.totalQuantity,
      sortOrder: row.sortOrder,
    })
    setOpen(true)
  }

  async function save(values: TicketForm) {
    setSaving(true)
    const body = {
      name: values.name.trim(),
      price: values.price,
      totalQuantity: values.totalQuantity,
      sortOrder: values.sortOrder ?? null,
    }
    try {
      const detail = editing
        ? await organizerEventApi.updateTicket(event.id, editing.id, body)
        : await organizerEventApi.addTicket(event.id, body)
      onChanged(detail)
      setOpen(false)
      message.success(editing ? 'Đã cập nhật loại vé' : 'Đã thêm loại vé')
    } catch (error) {
      message.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: OrganizerTicketType) {
    try {
      const detail = await organizerEventApi.deleteTicket(event.id, row.id)
      onChanged(detail)
      message.success('Đã xóa loại vé')
    } catch (error) {
      message.error(errorMessage(error))
    }
  }

  const columns: TableColumnsType<OrganizerTicketType> = [
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Giá', dataIndex: 'price', render: (value: number) => formatMoney(value) },
    { title: 'Phát hành', dataIndex: 'totalQuantity' },
    { title: 'Đang giữ', dataIndex: 'heldQuantity' },
    { title: 'Đã bán', dataIndex: 'soldQuantity' },
    { title: 'Còn', dataIndex: 'available' },
    {
      title: 'Bán',
      dataIndex: 'salePaused',
      render: (paused: boolean) => (paused ? <Tag color="orange">Tạm dừng</Tag> : <Tag color="green">Đang bán</Tag>),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_, row) =>
        canChange ? (
          <Space>
            <Button size="small" onClick={() => openEdit(row)}>
              Sửa
            </Button>
            <Popconfirm title="Xóa loại vé này?" onConfirm={() => void remove(row)}>
              <Button size="small" danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ]

  return (
    <>
      <div className="fs-panel-bar">
        <span>Tối đa 10 loại. Giá là bội số của 1.000, từ 0 đến 50.000.000.</span>
        {canAdd ? (
          <Button size="small" onClick={openCreate} disabled={event.ticketTypes.length >= 10}>
            Thêm loại vé
          </Button>
        ) : null}
      </div>
      <Table rowKey="id" size="small" columns={columns} dataSource={event.ticketTypes} pagination={false} scroll={{ x: 760 }} />
      <Modal
        title={editing ? 'Sửa loại vé' : 'Thêm loại vé'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => void save(values)}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, min: 2, max: 50, message: 'Tên từ 2 đến 50 ký tự' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[
              { required: true, message: 'Nhập giá' },
              {
                validator: (_, value: number | null) => {
                  if (value == null || (value >= 0 && value <= 50_000_000 && value % 1000 === 0)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Giá từ 0 đến 50.000.000 và chia hết cho 1.000'))
                },
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={50_000_000} step={1000} />
          </Form.Item>
          <Form.Item name="totalQuantity" label="Số lượng" rules={[{ required: true, type: 'number', min: 1, max: 100_000 }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={100_000} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
