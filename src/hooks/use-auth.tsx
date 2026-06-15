import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  perfil: any
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [perfil, setPerfil] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    const initAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
          const currentUser = pb.authStore.record
          if (currentUser?.role === 'psicologo') {
            try {
              const p = await pb
                .collection('perfis_psicologos')
                .getFirstListItem(`user_id="${currentUser.id}"`)
              setPerfil(p)
            } catch (e) {
              setPerfil(null)
            }
          }
        } catch (e) {
          pb.authStore.clear()
        }
      } else {
        if (pb.authStore.record) pb.authStore.clear()
      }
      setLoading(false)
    }

    initAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!loading && user?.role === 'psicologo' && !perfil) {
      pb.collection('perfis_psicologos')
        .getFirstListItem(`user_id="${user.id}"`)
        .then(setPerfil)
        .catch(() => setPerfil(null))
    }
  }, [user, loading])

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    localStorage.removeItem('admin_auth_simulation')
    localStorage.removeItem('sim_id')
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, perfil, isAuthenticated, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
