import { Typography } from 'antd'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  extra?: ReactNode
}

export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="fs-page-header">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>
      {extra}
    </div>
  )
}
