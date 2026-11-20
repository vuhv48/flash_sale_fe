import { Alert, App, Button, Card, Col, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Tabs } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { usePermission } from '@/modules/account/hooks/use-my-access'
import { organizerEventApi } from '@/modules/events/api/organizer-event-api'
import { DateTimeField } from '@/modules/events/components/DateTimeField'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import { useEventCatalog } from '@/modules/events/hooks/use-event-catalog'
import { isEditableStatus } from '@/modules/events/model/labels'
import type { OrganizerEventDetail, SaveEventRequest } from '@/modules/events/model/types'
import { EventImagePanel } from '@/modules/events/pages/organizer/EventImagePanel'
import { TicketTypePanel } from '@/modules/events/pages/organizer/TicketTypePanel'
import { PageHeader } from '@/shared/components/PageHeader'

type EventFormValues = {
  name: string
  description?: string
  category?: string
  venueName?: string
  venueAddress?: string
  provinceId?: string
  startsAt?: Dayjs
  endsAt?: Dayjs
  waitingRoomOpensAt?: Dayjs
  saleStartsAt?: Dayjs
  saleEndsAt?: Dayjs
  maxTicketsPerUser?: number
}

function toRequest(values: EventFormValues): SaveEventRequest {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    category: values.category || null,
    venueName: values.venueName?.trim() || null,
    venueAddress: values.venueAddress?.trim() || null,
    provinceId: values.provinceId || null,
    startsAt: values.startsAt?.toISOString() ?? null,
    endsAt: values.endsAt?.toISOString() ?? null,
    waitingRoomOpensAt: values.waitingRoomOpensAt?.toISOString() ?? null,
    saleStartsAt: values.saleStartsAt?.toISOString() ?? null,
    saleEndsAt: values.saleEndsAt?.toISOString() ?? null,
    maxTicketsPerUser: values.maxTicketsPerUser ?? null,
  }
}

function fromEvent(event: OrganizerEventDetail): EventFormValues {
  return {
    name: event.name,
    description: event.description ?? undefined,
    category: event.category ?? undefined,
    venueName: event.venueName ?? undefined,
    venueAddress: event.venueAddress ?? undefined,
    provinceId: event.provinceId ?? undefined,
    startsAt: event.startsAt ? dayjs(event.startsAt) : undefined,
    endsAt: event.endsAt ? dayjs(event.endsAt) : undefined,
    waitingRoomOpensAt: event.waitingRoomOpensAt ? dayjs(event.waitingRoomOpensAt) : undefined,
    saleStartsAt: event.saleStartsAt ? dayjs(event.saleStartsAt) : undefined,
    saleEndsAt: event.saleEndsAt ? dayjs(event.saleEndsAt) : undefined,
    maxTicketsPerUser: event.maxTicketsPerUser,
  }
}

export function EventEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<EventFormValues>()
  const { provinces, categories } = useEventCatalog()
  const canCreate = usePermission('CREATE_DRAFT_EVENT')
  const canUpdate = usePermission('UPDATE_OWN_EVENT')
  const canSubmit = usePermission('SUBMIT_EVENT')
  const canPause = usePermission('PAUSE_SALE')

  const detail = useQuery({
    queryKey: queryKeys.organizerEvents.detail(id ?? ''),
    queryFn: () => organizerEventApi.detail(id ?? ''),
    enabled: Boolean(id),
  })

  const formStamp = detail.data
    ? [
        detail.data.id,
        detail.data.status,
        detail.data.name,
        detail.data.description,
        detail.data.category,
        detail.data.provinceId,
        detail.data.venueName,
        detail.data.venueAddress,
        detail.data.startsAt,
        detail.data.endsAt,
        detail.data.waitingRoomOpensAt,
        detail.data.saleStartsAt,
        detail.data.saleEndsAt,
        detail.data.maxTicketsPerUser,
      ].join('|')
    : ''

  useEffect(() => {
    const current = queryClient.getQueryData<OrganizerEventDetail>(queryKeys.organizerEvents.detail(id ?? ''))
    if (current) {
      form.setFieldsValue(fromEvent(current))
    }
  }, [form, formStamp, id])

  function remember(next: OrganizerEventDetail) {
    queryClient.setQueryData(queryKeys.organizerEvents.detail(next.id), next)
    void queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'organizer' && query.queryKey[1] === 'events' && query.queryKey.length === 4,
    })
  }

  const save = useMutation({
    mutationFn: (values: EventFormValues) =>
      isNew ? organizerEventApi.create(toRequest(values)) : organizerEventApi.update(id ?? '', toRequest(values)),
    onSuccess: (next) => {
      remember(next)
      message.success(isNew ? 'Đã tạo bản nháp' : 'Đã lưu sự kiện')
      if (isNew) {
        navigate(`/organizer/events/${next.id}`, { replace: true })
      }
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const submit = useMutation({
    mutationFn: async () => {
      const eventId = id ?? ''
      const current = detail.data
      const canEdit = Boolean(current && isEditableStatus(current.status) && canUpdate.allowed)
      if (canEdit) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        await new Promise((resolve) => window.setTimeout(resolve, 0))
        const values = await form.validateFields()
        const saved = await organizerEventApi.update(eventId, toRequest(values))
        remember(saved)
      }
      return organizerEventApi.submit(eventId)
    },
    onSuccess: (next) => {
      remember(next)
      message.success('Đã gửi duyệt')
    },
    onError: (error) => {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.warning('Kiểm tra lại thông tin trên màn hình trước khi gửi duyệt')
        return
      }
      message.error(errorMessage(error))
    },
  })

  const pause = useMutation({
    mutationFn: () => organizerEventApi.pause(id ?? ''),
    onSuccess: (next) => {
      remember(next)
      message.success('Đã tạm dừng đợt bán')
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const resume = useMutation({
    mutationFn: () => organizerEventApi.resume(id ?? ''),
    onSuccess: (next) => {
      remember(next)
      message.success('Đã tiếp tục đợt bán')
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const event = detail.data
  const editable = isNew ? canCreate.allowed : Boolean(event && isEditableStatus(event.status) && canUpdate.allowed)

  if (!isNew && detail.isError) {
    return <Alert type="error" showIcon message={errorMessage(detail.error)} />
  }
  if (!isNew && !event) {
    return null
  }
  if (isNew && canCreate.ready && !canCreate.allowed) {
    return <Alert type="warning" showIcon message="Bạn không có quyền tạo sự kiện." />
  }

  return (
    <>
      <PageHeader
        title={isNew ? 'Sự kiện mới' : event?.name || 'Sự kiện'}
        description={isNew ? 'Tạo nháp. Tên là đủ để lưu, các mục còn lại cần đủ trước khi gửi duyệt.' : event?.code}
        extra={
          <Space wrap>
            {event ? <EventStatusTag status={event.status} label={event.statusLabel} /> : null}
            {editable ? (
              <Button type="primary" loading={save.isPending} onClick={() => form.submit()}>
                {isNew ? 'Tạo nháp' : 'Lưu'}
              </Button>
            ) : null}
            {event && canSubmit.allowed && isEditableStatus(event.status) ? (
              <Popconfirm
                title="Gửi sự kiện đi duyệt?"
                description="Cần mô tả, thể loại, địa điểm, lịch, ít nhất một loại vé và một ảnh bìa. Giờ mở bán phải sau lúc gửi ít nhất 24 giờ."
                onConfirm={() => submit.mutate()}
              >
                <Button loading={submit.isPending}>Gửi duyệt</Button>
              </Popconfirm>
            ) : null}
            {event?.status === 'ON_SALE' && canPause.allowed ? (
              <Popconfirm
                title="Tạm dừng đợt bán?"
                description={`Đã dùng ${event.pauseCount}/3 lần. Mỗi lần tối đa 30 phút rồi tự bán tiếp.`}
                onConfirm={() => pause.mutate()}
              >
                <Button loading={pause.isPending}>Tạm dừng</Button>
              </Popconfirm>
            ) : null}
            {event?.status === 'PAUSED' && canPause.allowed ? (
              <Button loading={resume.isPending} onClick={() => resume.mutate()}>
                Bán tiếp
              </Button>
            ) : null}
            <Button onClick={() => navigate('/organizer/events')}>Danh sách</Button>
          </Space>
        }
      />
      {event?.rejectReason ? <Alert type="error" showIcon style={{ marginBottom: 16 }} message={`Bị từ chối: ${event.rejectReason}`} /> : null}
      {event?.cancelReason ? <Alert type="warning" showIcon style={{ marginBottom: 16 }} message={`Đã hủy: ${event.cancelReason}`} /> : null}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={event ? 14 : 24}>
          <Card title="Thông tin và lịch">
            <Form form={form} layout="vertical" disabled={!editable} onFinish={(values) => save.mutate(values)}>
              <Form.Item
                name="name"
                label="Tên sự kiện"
                rules={[{ required: true, min: 5, max: 200, whitespace: true, message: 'Tên từ 5 đến 200 ký tự' }]}
              >
                <Input onPressEnter={() => form.submit()} />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={5} maxLength={10000} showCount />
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="Thể loại">
                    <Select
                      allowClear
                      loading={categories.isLoading}
                      options={categories.data?.map((item) => ({ value: item.code, label: item.label }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="provinceId" label="Tỉnh, thành">
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      loading={provinces.isLoading}
                      options={provinces.data?.map((item) => ({ value: item.id, label: item.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="venueName" label="Địa điểm">
                    <Input maxLength={200} onPressEnter={() => form.submit()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="venueAddress" label="Địa chỉ">
                    <Input maxLength={300} onPressEnter={() => form.submit()} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="startsAt" label="Bắt đầu">
                    <DateTimeField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="endsAt" label="Kết thúc">
                    <DateTimeField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="waitingRoomOpensAt" label="Mở phòng chờ">
                    <DateTimeField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="saleStartsAt" label="Mở bán">
                    <DateTimeField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="saleEndsAt" label="Đóng bán">
                    <DateTimeField />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="maxTicketsPerUser" label="Vé tối đa mỗi tài khoản">
                    <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Mặc định 4" onPressEnter={() => form.submit()} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        {event ? (
          <Col xs={24} xl={10}>
            <Card>
              <Tabs
                items={[
                  {
                    key: 'tickets',
                    label: `Loại vé (${event.ticketTypes.length})`,
                    children: (
                      <TicketTypePanel
                        event={event}
                        canAdd={editable && canCreate.allowed}
                        canChange={editable && canUpdate.allowed}
                        onChanged={remember}
                      />
                    ),
                  },
                  {
                    key: 'images',
                    label: `Ảnh (${event.images.length})`,
                    children: <EventImagePanel event={event} canChange={editable && canUpdate.allowed} onChanged={remember} />,
                  },
                ]}
              />
            </Card>
          </Col>
        ) : null}
      </Row>
    </>
  )
}
