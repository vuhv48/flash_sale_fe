import { App, Alert, Button, Popconfirm, Select, Space, Table, Tag, Upload } from 'antd'
import type { TableColumnsType, UploadFile } from 'antd'
import { useState } from 'react'
import { errorMessage } from '@/core/http/api-error'
import { organizerEventApi } from '@/modules/events/api/organizer-event-api'
import type { EventImageView, OrganizerEventDetail } from '@/modules/events/model/types'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5_242_880

type EventImagePanelProps = {
  event: OrganizerEventDetail
  canChange: boolean
  onChanged: (detail: OrganizerEventDetail) => void
}

export function EventImagePanel({ event, canChange, onChanged }: EventImagePanelProps) {
  const { message } = App.useApp()
  const [type, setType] = useState<'EVENT_COVER' | 'EVENT_IMAGE'>('EVENT_COVER')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const galleryCount = event.images.filter((item) => item.type === 'EVENT_IMAGE').length

  async function attach() {
    if (!file) {
      message.warning('Chọn một ảnh')
      return
    }
    setSaving(true)
    try {
      const detail = await organizerEventApi.attachImage(event.id, {
        type,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        sortOrder: type === 'EVENT_COVER' ? 0 : galleryCount + 1,
      })
      onChanged(detail)
      setFile(null)
      message.success(type === 'EVENT_COVER' ? 'Đã ghi nhận ảnh bìa' : 'Đã ghi nhận ảnh phụ')
    } catch (error) {
      message.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: EventImageView) {
    try {
      const detail = await organizerEventApi.deleteImage(event.id, row.id)
      onChanged(detail)
      message.success('Đã gỡ ảnh')
    } catch (error) {
      message.error(errorMessage(error))
    }
  }

  const columns: TableColumnsType<EventImageView> = [
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (value: string) => (value === 'EVENT_COVER' ? <Tag color="red">Bìa</Tag> : <Tag>Ảnh phụ</Tag>),
    },
    { title: 'Tệp', dataIndex: 'fileName' },
    { title: 'Định dạng', dataIndex: 'mimeType' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', width: 90 },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, row) =>
        canChange ? (
          <Popconfirm title="Gỡ ảnh này?" onConfirm={() => void remove(row)}>
            <Button size="small" danger>
              Gỡ
            </Button>
          </Popconfirm>
        ) : null,
    },
  ]

  const fileList: UploadFile[] = file ? [{ uid: file.name, name: file.name, status: 'done' }] : []

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="Hệ thống ghi nhận tên, định dạng và kích thước để gửi duyệt. Tệp chưa được tải lên kho lưu trữ. Ảnh bìa mới thay ảnh bìa cũ."
      />
      {canChange ? (
        <Space wrap>
          <Select
            value={type}
            style={{ width: 160 }}
            options={[
              { value: 'EVENT_COVER', label: 'Ảnh bìa' },
              { value: 'EVENT_IMAGE', label: 'Ảnh phụ' },
            ]}
            onChange={setType}
          />
          <Upload
            accept="image/jpeg,image/png,image/webp"
            maxCount={1}
            fileList={fileList}
            beforeUpload={(next) => {
              if (!ALLOWED.has(next.type) || next.size < 1 || next.size > MAX_BYTES) {
                message.error('Chỉ nhận JPEG, PNG hoặc WebP, tối đa 5 MB')
                return Upload.LIST_IGNORE
              }
              setFile(next)
              return false
            }}
            onRemove={() => {
              setFile(null)
            }}
          >
            <Button>Chọn ảnh</Button>
          </Upload>
          <Button type="primary" loading={saving} disabled={!file || (type === 'EVENT_IMAGE' && galleryCount >= 10)} onClick={() => void attach()}>
            Gắn ảnh
          </Button>
        </Space>
      ) : null}
      <Table rowKey="id" size="small" columns={columns} dataSource={event.images} pagination={false} />
    </Space>
  )
}
