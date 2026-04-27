import { headers } from 'next/headers'

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

export async function fetchFromInternalApi<T>(
  path: string,
  options?: NextFetchOptions
): Promise<T | null> {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? 'http'

  if (!host) {
    return null
  }

  const safePath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${protocol}://${host}${safePath}`, options)

  if (!response.ok) {
    return null
  }

  return (await response.json()) as T
}
