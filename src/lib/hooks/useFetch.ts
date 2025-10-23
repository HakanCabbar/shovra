'use client'

// ** Third-Party Libraries
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'

type FetchParams<T> = {
  queryKey: QueryKey
  url: string
  options?: UseQueryOptions<T>
}

export function useFetch<T>({ queryKey, url, options }: FetchParams<T>) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch data from ${url}`)
      return res.json()
    },
    ...options
  })
}
