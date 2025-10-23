'use client'

// ** React & Hooks
import { ReactNode, useState, createContext, useContext } from 'react'

// ** Third-Party Libraries
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ** Types
export type UserData = {
  id: string | null
  name: string | null
  email: string | null
  role: string | null
}

export type AppContextType = {
  user: UserData | null
  setUser: (user: UserData | null) => void
}

// ** Context
const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {}
})

// ** Custom Hook
export const useApp = () => useContext(AppContext)

// ** Provider Component Props
interface ProvidersProps {
  children: ReactNode
  initialUser: UserData | null
}

// ** Providers Component
export default function Providers({ children, initialUser }: ProvidersProps) {
  // ** State Hooks
  const [queryClient] = useState(() => new QueryClient())
  const [user, setUser] = useState<UserData | null>(initialUser)

  // ** Render
  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>
    </QueryClientProvider>
  )
}
