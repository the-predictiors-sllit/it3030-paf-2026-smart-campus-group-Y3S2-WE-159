import { headers } from 'next/headers'
import { ResourcesClient } from './ResourcesClient'

interface Resource {
  id: string
  name: string
  type: 'ROOM' | 'LAB' | 'EQUIPMENT' | string
  capacity: number | null
  location: string
  status: 'ACTIVE' | 'OUT_OF_SERVICE' | string
  imageUrl?: string
  _links: {
    self: { href: string }
  }
}

interface ResourceResponse {
  _links: Record<string, unknown>
  data: {
    items: Resource[]
    total: number
    page: number
    totalPages: number
  } | null
  error: {
    code: string
    message: string
  } | null
  status: 'success' | 'error' | string
}

const DEFAULT_PAGE_SIZE = 10

function getStringValue(value: string | string[] | undefined, defaultValue: string) {
  if (Array.isArray(value)) {
    return value[0] ?? defaultValue
  }
  return value ?? defaultValue
}

async function fetchResources(searchParams: URLSearchParams) {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? 'http'

  if (!host) {
    return {
      items: [] as Resource[],
      totalPages: 1,
    }
  }

  const response = await fetch(`${protocol}://${host}/api/resources?${searchParams.toString()}`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    return {
      items: [] as Resource[],
      totalPages: 1,
    }
  }

  const result = (await response.json()) as ResourceResponse

  return {
    items: result.status === 'success' && result.data ? result.data.items : [],
    totalPages: result.status === 'success' && result.data ? result.data.totalPages : 1,
  }
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const initialPage = Number(getStringValue(searchParams?.page, '1'))
  const initialLimit = Number(getStringValue(searchParams?.limit, String(DEFAULT_PAGE_SIZE)))
  const initialSearch = getStringValue(searchParams?.search, '')
  const initialType = getStringValue(searchParams?.type, 'ALL')
  const initialStatus = getStringValue(searchParams?.status, 'ALL')
  const initialMinCapacity = getStringValue(searchParams?.minCapacity, '')

  const query = new URLSearchParams({
    page: String(initialPage),
    limit: String(initialLimit),
  })

  if (initialSearch) query.set('search', initialSearch)
  if (initialType !== 'ALL') query.set('type', initialType)
  if (initialStatus !== 'ALL') query.set('status', initialStatus)
  if (initialMinCapacity) query.set('minCapacity', initialMinCapacity)

  const { items, totalPages } = await fetchResources(query)

  return (
    <ResourcesClient
      initialResources={items}
      initialTotalPages={totalPages}
      initialPage={initialPage}
      initialLimit={initialLimit}
      initialSearch={initialSearch}
      initialType={initialType}
      initialStatus={initialStatus}
      initialMinCapacity={initialMinCapacity}
    />
  )
}
