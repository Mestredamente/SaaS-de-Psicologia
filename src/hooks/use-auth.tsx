import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  perfil: any
  permissoesMenu: any[]
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

// Global cache to avoid redundant API calls across fast navigation loops
let cachedPermissoesMenu: any[] | null = null

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [perfil, setPerfil] = useState<any>(null)
  const [permissoesMenu, setPermissoesMenu] = useState<any[]>(cachedPermissoesMenu || [])
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

          if (currentUser?.role && !cachedPermissoesMenu) {
            try {
              const menus = await pb.collection('permissoes_menu').getFullList({
                filter: `role = '${currentUser.role}' && visivel = true`,
                sort: 'created',
              })
              cachedPermissoesMenu = menus
              setPermissoesMenu(menus)
            } catch (e) {
              console.error(e)
            }
          } else if (cachedPermissoesMenu) {
            setPermissoesMenu(cachedPermissoesMenu)
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
    let mounted = true
    if (!loading && user?.role === 'psicologo' && !perfil) {
      pb.collection('perfis_psicologos')
        .getFirstListItem(`user_id="${user.id}"`)
        .then((p) => {
          if (mounted) setPerfil(p)
        })
        .catch(() => {
          if (mounted) setPerfil(null)
        })
    }
    return () => {
      mounted = false
    }
  }, [user?.id, user?.role, loading, perfil])

  useEffect(() => {
    let mounted = true
    if (!loading && user?.role && permissoesMenu.length === 0 && !cachedPermissoesMenu) {
      pb.collection('permissoes_menu')
        .getFullList({
          filter: `role = '${user.role}' && visivel = true`,
          sort: 'created',
        })
        .then((res) => {
          if (mounted) {
            cachedPermissoesMenu = res
            setPermissoesMenu(res)
          }
        })
        .catch(console.error)
    }
    return () => {
      mounted = false
    }
  }, [user?.role, loading, permissoesMenu.length])

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
    cachedPermissoesMenu = null
    setPermissoesMenu([])
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{ user, perfil, permissoesMenu, isAuthenticated, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
