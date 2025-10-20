'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type UserData = {
  name: string | null
  id: string | null
  email: string | null
  role: string | null
}

type AppContextType = {
  user: UserData | null
  setUser: (user: UserData | null) => void
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {}
})

export const useApp = () => useContext(AppContext)

interface ProvidersProps {
  children: ReactNode
  initialUser: UserData | null
}

export default function Providers({ children, initialUser }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [user, setUser] = useState<UserData | null>(initialUser)

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>
    </QueryClientProvider>
  )
}
