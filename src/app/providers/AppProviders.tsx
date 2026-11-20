import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { QueryClientProvider } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/core/query/query-client'
import { appTheme } from '@/app/theme'
import { router } from '@/app/router/router'

dayjs.locale('vi')

export function AppProviders() {
  return (
    <ConfigProvider locale={viVN} theme={appTheme}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}
