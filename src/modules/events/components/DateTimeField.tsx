import { DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'
import { useState } from 'react'

export function DateTimeField(props: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <DatePicker
      showTime={{ format: 'HH:mm' }}
      format="DD/MM/YYYY HH:mm"
      needConfirm={false}
      style={{ width: '100%' }}
      {...props}
      open={open}
      onOpenChange={(next) => setOpen(next)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          setOpen(false)
        }
      }}
      panelRender={(panel) => (
        <div
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.stopPropagation()
              setOpen(false)
            }
          }}
        >
          {panel}
        </div>
      )}
    />
  )
}
