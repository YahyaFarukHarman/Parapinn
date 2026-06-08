import { useEffect, useState } from 'react'
import LockScreen from '@/components/lock-screen'
import { useChatStore } from '@/stores/chat-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useTransactionStore } from '@/stores/transaction-store'
import { useAccountsStore } from '@/stores/accounts-store'
import { useDebtsStore } from '@/stores/debts-store'
import { useInvestmentsStore } from '@/stores/investments-store'
import {
  BarChart3Icon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  MonitorIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  Trash2Icon,
  TrendingUpIcon,
  WalletIcon,
  WifiOffIcon
} from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { APP_NAME, ROUTES } from '@/lib/constants'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'
import OnboardingDialog from '@/components/onboarding-dialog'
import { useTheme } from '@/components/theme-provider'

const navItems = [
  { to: ROUTES.chat, icon: MessageSquareIcon, label: 'Sohbet' },
  { to: ROUTES.dashboard, icon: LayoutDashboardIcon, label: 'Dashboard' },
  { to: ROUTES.reports, icon: BarChart3Icon, label: 'Raporlar' },
  { to: ROUTES.kasa, icon: WalletIcon, label: 'Kasa' },
  { to: ROUTES.portfolio, icon: TrendingUpIcon, label: 'Portfoy' },
  { to: ROUTES.settings, icon: SettingsIcon, label: 'Ayarlar' }
]

const themeOptions = [
  { value: 'light', icon: SunIcon, label: 'Açık' },
  { value: 'dark', icon: MoonIcon, label: 'Koyu' },
  { value: 'system', icon: MonitorIcon, label: 'Sistem' }
]

export default function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const username = useSettingsStore((s) => s.username)
  const loaded = useSettingsStore((s) => s.loaded)
  const isChat = location.pathname === ROUTES.chat
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [renameId, setRenameId] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')

  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const loadSessions = useChatStore((s) => s.loadSessions)
  const createSession = useChatStore((s) => s.createSession)
  const setActiveSession = useChatStore((s) => s.setActiveSession)
  const deleteSession = useChatStore((s) => s.deleteSession)
  const renameSession = useChatStore((s) => s.renameSession)
  const isLocked = useSettingsStore((s) => s.isLocked)
  const loadTransactions = useTransactionStore((s) => s.loadTransactions)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadAccounts = useAccountsStore((s) => s.loadAccounts)
  const loadDebts = useDebtsStore((s) => s.loadDebts)
  const loadInvestments = useInvestmentsStore((s) => s.loadInvestments)

  const handleRename = async () => {
    if (!renameId || !renameDraft.trim()) return
    await renameSession(renameId, renameDraft.trim())
    setRenameId(null)
    setRenameDraft('')
  }

  useEffect(() => {
    loadSessions()
    loadTransactions()
    loadSettings()
    loadAccounts()
    loadDebts()
    loadInvestments()
  }, [])

  if (loaded && isLocked) {
    return <LockScreen />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<a href={ROUTES.home} />}
                nativeButton={false}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(ROUTES.home)
                }}
              >
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-2xl">
                  <SparklesIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading font-semibold">{APP_NAME}</span>
                  <span className="text-xs">Bütçe Asistanı</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={location.pathname === item.to}
                      render={<a href={item.to} />}
                      nativeButton={false}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(item.to)
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isChat && (
            <SidebarGroup>
              <SidebarGroupLabel>Sohbetler</SidebarGroupLabel>
              <SidebarGroupAction
                onClick={() => createSession()}
                tooltip="Yeni sohbet"
              >
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        isActive={session.id === activeSessionId}
                        render={<span />}
                        nativeButton={false}
                        onClick={() => {
                          setActiveSession(session.id)
                          navigate(ROUTES.chat)
                        }}
                        className="truncate"
                      >
                        <MessageSquareIcon className="size-4 shrink-0" />
                        <span className="truncate">{session.title}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontalIcon className="size-4" />
                            </SidebarMenuAction>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameId(session.id)
                              setRenameDraft(session.title)
                            }}
                          >
                            <PencilIcon className="size-4" />
                            <span>Yeniden Adlandır</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2Icon className="size-4" />
                            <span>Sil</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<span />} nativeButton={false}>
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">
                    {username ? username[0].toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{username || 'Misafir'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton />}>
                  <SunIcon />
                  <span>Tema</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {themeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                    >
                      <option.icon />
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {loaded && !username && <OnboardingDialog />}

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-8" />
          <span className="font-heading text-sm font-medium">
            {navItems.find((n) => location.pathname === n.to)?.label ??
              APP_NAME}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isOffline && (
              <Badge variant="destructive">
                <WifiOffIcon className="size-3" />
                Çevrimdışı
              </Badge>
            )}
          </div>
        </header>

        <div className="flex-1 px-6 py-4">
          {isOffline && (
            <Alert variant="destructive" className="mb-4">
              <WifiOffIcon />
              <AlertDescription>
                Çevrimdışı mod — yapay zeka özellikleri kullanılamıyor, işlemler
                manuel eklenebilir
              </AlertDescription>
            </Alert>
          )}
          <Outlet />
        </div>
      </SidebarInset>

      <Dialog
        open={!!renameId}
        onOpenChange={(o) => {
          if (!o) setRenameId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sohbeti Yeniden Adlandır</DialogTitle>
            <DialogDescription>
              Sohbet oturumuna yeni bir isim ver.
            </DialogDescription>
          </DialogHeader>
          {renameId && (
            <InputGroup>
              <InputGroupInput
                placeholder="Sohbet adı"
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                }}
                autoFocus
              />
            </InputGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              İptal
            </Button>
            <Button onClick={handleRename} disabled={!renameDraft.trim()}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
