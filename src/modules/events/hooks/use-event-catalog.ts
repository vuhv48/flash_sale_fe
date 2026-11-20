import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/core/query/query-keys'
import { catalogApi } from '@/modules/events/api/catalog-api'

const HOUR = 60 * 60 * 1000

export function useEventCatalog() {
  const provinces = useQuery({
    queryKey: queryKeys.catalog.provinces,
    queryFn: catalogApi.provinces,
    staleTime: HOUR,
  })
  const categories = useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: catalogApi.categories,
    staleTime: HOUR,
  })
  return { provinces, categories }
}
