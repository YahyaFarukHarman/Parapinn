import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageSquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/chat-store'
import { useTransactionStore } from '@/stores/transaction-store'
import { useGoalsStore } from '@/stores/goals-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAccountsStore } from '@/stores/accounts-store'
import { useDebtsStore } from '@/stores/debts-store'
import { useInvestmentsStore } from '@/stores/investments-store'
import { parseTransaction } from '@/lib/ai'
import { detectGoalIntent } from '@/lib/goals'
import { detectDebtIntent } from '@/lib/debts'
import { detectInvestmentIntent } from '@/lib/investments'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import MessageBubble from '@/components/chat/message-bubble'
import ChatInput from '@/components/chat/chat-input'
import ConfirmationDialog from '@/components/chat/confirmation-dialog'

export default function ChatPage() {
  const scrollRef = useRef(null)
  const messages = useChatStore((s) => s.messages)
  const isProcessing = useChatStore((s) => s.isProcessing)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const createSession = useChatStore((s) => s.createSession)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage)
  const username = useSettingsStore((s) => s.username)
  const apiKey = useSettingsStore((s) => s.apiKey)
  const aiModel = useSettingsStore((s) => s.aiModel)
  const aiBaseUrl = useSettingsStore((s) => s.aiBaseUrl)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const addDebt = useDebtsStore((s) => s.addDebt)
  const addInvestment = useInvestmentsStore((s) => s.addInvestment)

  const [pendingData, setPendingData] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const pendingRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        })
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  const handleProcessMessage = useCallback(async (text) => {
    const invIntent = detectInvestmentIntent(text)
    if (invIntent) {
      const record = await addInvestment(invIntent)
      await addAssistantMessage(
        `💎 **${invIntent.name}** yatirimi kaydedildi!\n\n` +
        `• Miktar: **${invIntent.quantity}** adet\n` +
        `• Birim fiyat: **${invIntent.purchasePrice.toLocaleString('tr-TR')} TL**\n` +
        `• Toplam: **${(invIntent.quantity * invIntent.purchasePrice).toLocaleString('tr-TR')} TL**\n` +
        (invIntent.notes ? `\n📝 ${invIntent.notes}` : '')
      )
      toast.success('Yatirim kaydedildi')
      return
    }

    const debtIntent = detectDebtIntent(text)
    if (debtIntent) {
      const record = await addDebt(debtIntent)
      const emoji = debtIntent.type === 'alacak' ? '💵' : '💳'
      await addAssistantMessage(
        `${emoji} **${debtIntent.person}** icin ${debtIntent.type === 'alacak' ? 'alacak' : 'borc'} kaydedildi!\n\n` +
        `• Kisi: **${debtIntent.person}**\n` +
        `• Tutar: **${debtIntent.amount.toLocaleString('tr-TR')} TL**\n` +
        (debtIntent.description ? `• Aciklama: ${debtIntent.description}\n` : '') +
        `\nDashboard'dan ode durumunu takip edebilirsin.`
      )
      toast.success(`${debtIntent.type === 'alacak' ? 'Alacak' : 'Borc'} kaydedildi`)
      return
    }

    const goalIntent = detectGoalIntent(text)
    if (goalIntent) {
      await addGoal(goalIntent)
      await addAssistantMessage(
        `🎯 **${goalIntent.title}** hedefi oluşturuldu!\n\n` +
        `• Hedef: **${goalIntent.targetAmount.toLocaleString('tr-TR')} TL**` +
        (goalIntent.deadline ? `\n• Son tarih: **${new Date(goalIntent.deadline).toLocaleDateString('tr-TR')}**` : '') +
        `\n\nDashboard'da hedefinin ilerlemesini takip edebilirsin.`
      )
      toast.success('Birikim hedefi oluşturuldu')
      return
    }

    const result = await parseTransaction(text, { apiKey, model: aiModel, baseUrl: aiBaseUrl })

    if (result.type === 'chat') {
      await addAssistantMessage(result.content)
      return
    }

    if (result.type === 'error') {
      await addAssistantMessage('❌ ' + result.content)
      return
    }

    if (result.accountType) {
      const accounts = useAccountsStore.getState().accounts
      const match = accounts.find((a) => a.type === result.accountType)
      if (match) result.accountId = match.id
    }
    delete result.accountType

    pendingRef.current = result
    setPendingData(result)
    setShowConfirm(true)
  }, [apiKey, aiModel, aiBaseUrl, addAssistantMessage, addGoal])

  const handleConfirm = useCallback(async (data) => {
    const record = {
      type: data.type,
      amount: data.amount,
      category: data.category,
      title: data.title,
      description: data.description || '',
      date: new Date().toISOString().slice(0, 10),
      accountId: data.accountId || null
    }

    if (data.recurring) {
      record.recurring = true
      record.recurringInterval = data.recurringInterval || 'monthly'
      record.recurringDay = data.recurringDay || 1
      record.active = true
    }

    await addTransaction(record)
    setShowConfirm(false)
    setPendingData(null)
    pendingRef.current = null

    const emoji = data.type === 'gelir' ? '💰' : '💸'
    const recurringNote = data.recurring
      ? `\n\n🔄 *Tekrarlayan işlem olarak ayarlandı.*`
      : ''
    await addAssistantMessage(
      `${emoji} **${data.type === 'gelir' ? 'Gelir' : 'Gider'}** kaydedildi!${recurringNote}\n\n` +
      `• Tutar: **${data.amount.toLocaleString('tr-TR')} TL**\n` +
      `• Kategori: **${data.category}**\n` +
      `• Başlık: **${data.title}**`
    )

    toast.success(`${data.type === 'gelir' ? 'Gelir' : 'Harcama'} kaydedildi`)
  }, [addTransaction, addAssistantMessage])

  const handleCancel = useCallback(() => {
    setShowConfirm(false)
    setPendingData(null)
    pendingRef.current = null
    addAssistantMessage('İşlem iptal edildi. Tekrar dene istersen.')
  }, [addAssistantMessage])

  const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content:
      'Merhaba! 🎉 Harcamalarını takip etmek için aşağıya yazmaya başlayabilirsin.\n\nÖrneğin:\n• "Bim\'den 850 TL alışveriş yaptım"\n• "Marketten 250 TL harcadım"\n• "Maaşım 30.000 TL yattı"',
    timestamp: new Date().toISOString()
  }

  const displayMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages

  if (!activeSessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareIcon className="size-8" />
            </EmptyMedia>
            <EmptyTitle>Henüz sohbet yok</EmptyTitle>
            <EmptyDescription>
              Yeni bir sohbet başlatarak harcamalarını kaydetmeye başla.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => createSession()}>
              <MessageSquareIcon data-icon="inline-start" />
              Yeni Sohbet Başlat
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 pr-4">
        <div className="flex flex-col gap-4 pb-4">
          {displayMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              userName={username}
            />
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3 text-sm">
                <Spinner className="size-4" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 bg-background pb-4 pt-2">
        <ChatInput onSend={handleProcessMessage} />
      </div>

      <ConfirmationDialog
        data={pendingData}
        open={showConfirm}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  )
}
