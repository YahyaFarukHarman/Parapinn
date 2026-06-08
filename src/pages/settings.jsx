import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useTransactionStore } from '@/stores/transaction-store'
import { useGoalsStore } from '@/stores/goals-store'
import { exportCSV, printReport } from '@/lib/reports'
import {
  BotIcon,
  DownloadIcon,
  FileTextIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  TableIcon,
  UploadIcon,
  XIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { DEFAULT_CATEGORIES } from '@/lib/constants'
import db from '@/lib/db'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const modelItems = [
  {
    label: 'Google Gemini 2.5 Flash Lite',
    value: 'google/gemini-2.5-flash-lite'
  },
  {
    label: 'Google Gemini 3.1 Flash Lite',
    value: 'google/gemini-3.1-flash-lite'
  },
  {
    label: 'DeepSeek V4 Pro',
    value: 'deepseek/deepseek-v4-pro'
  },
  {
    label: 'xAI Grok 4.3',
    value: 'x-ai/grok-4.3'
  }
]

export default function SettingsPage() {
  const {
    username,
    setUsername,
    monthlyBudget,
    setMonthlyBudget,
    apiKey,
    setApiKey,
    aiBaseUrl,
    setAiBaseUrl,
    aiModel,
    setAiModel,
    budgets,
    categoryBudgets,
    categories: customCategories,
    updateSettings,
    setCategoryBudget,
    removeCategoryBudget,
    appPasswordSet,
    setAppPassword,
    changeAppPassword,
    removeAppPassword,
    loaded
  } = useSettingsStore()
  const transactions = useTransactionStore((s) => s.transactions)
  const loadTransactions = useTransactionStore((s) => s.loadTransactions)
  const goals = useGoalsStore((s) => s.goals)
  const loadGoals = useGoalsStore((s) => s.loadGoals)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const addToGoal = useGoalsStore((s) => s.addToGoal)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)
  const [nameDraft, setNameDraft] = useState('')
  const [budgetDraft, setBudgetDraft] = useState('')
  const [keyDraft, setKeyDraft] = useState('')
  const [baseUrlDraft, setBaseUrlDraft] = useState('')
  const [modelDraft, setModelDraft] = useState('')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatType, setNewCatType] = useState('gider')
  const [pwDraft, setPwDraft] = useState('')
  const [pwDraft2, setPwDraft2] = useState('')
  const [oldPwDraft, setOldPwDraft] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (loaded) {
      setNameDraft(username)
      setBudgetDraft(String(monthlyBudget))
      setKeyDraft(apiKey)
      setBaseUrlDraft(aiBaseUrl)
      setModelDraft(aiModel)
    }
  }, [loaded])

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return
    await setUsername(nameDraft.trim())
    toast.success('İsim kaydedildi.')
  }

  const handleSaveBudget = async () => {
    const amount = Number(budgetDraft)
    if (isNaN(amount) || amount < 0) return
    await setMonthlyBudget(amount)
    toast.success('Bütçe limiti kaydedildi.')
  }

  const handleExport = async () => {
    const transactions = await db.transactions.toArray()
    const sessions = await db.sessions.toArray()
    const settings = await db.settings.toArray()
    const data = {
      transactions,
      sessions,
      settings,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parapin-yedek-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Veriler dışa aktarıldı.')
  }

  const allCategories = {
    expense: [
      ...DEFAULT_CATEGORIES.expense,
      ...(customCategories?.expense || []).map((c) => ({
        ...c,
        isCustom: true
      }))
    ],
    income: [
      ...DEFAULT_CATEGORIES.income,
      ...(customCategories?.income || []).map((c) => ({ ...c, isCustom: true }))
    ]
  }

  const handleAddCategory = async () => {
    const label = newCatLabel.trim()
    if (!label) return
    const id = `custom-${crypto.randomUUID().slice(0, 8)}`
    const typeKey = newCatType === 'gelir' ? 'income' : 'expense'
    const updated = {
      ...customCategories,
      [typeKey]: [...(customCategories?.[typeKey] || []), { id, label }]
    }
    await updateSettings({ categories: updated })
    setNewCatLabel('')
    toast.success('Kategori eklendi')
  }

  const handleRemoveCategory = async (type, id) => {
    const updated = {
      ...customCategories,
      [type]: (customCategories?.[type] || []).filter((c) => c.id !== id)
    }
    await updateSettings({ categories: updated })
    toast.success('Kategori kaldırıldı')
  }

  const handleSaveAi = async () => {
    await setApiKey(keyDraft.trim())
    await setAiBaseUrl(baseUrlDraft.trim())
    await setAiModel(modelDraft)
    toast.success('AI ayarları kaydedildi.')
  }

  useEffect(() => {
    loadTransactions()
    loadGoals()
  }, [loadTransactions, loadGoals])

  const [goalTitle, setGoalTitle] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalAddAmount, setGoalAddAmount] = useState({})

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  const handleCsvExport = () => {
    exportCSV(transactions, currentMonthKey)
    toast.success('CSV raporu indiriliyor.')
  }

  const handlePrintReport = () => {
    printReport(transactions, currentMonthKey, budgets?.[currentMonthKey] || 0)
  }

  const handleAddGoal = async () => {
    if (!goalTitle.trim() || !goalTarget) return
    await addGoal({
      title: goalTitle.trim(),
      targetAmount: Number(goalTarget),
      deadline: goalDeadline || null
    })
    setGoalTitle('')
    setGoalTarget('')
    setGoalDeadline('')
    toast.success('Hedef oluşturuldu')
  }

  const handleAddToGoal = async (id) => {
    const amount = Number(goalAddAmount[id])
    if (!amount || amount <= 0) return
    await addToGoal(id, amount)
    setGoalAddAmount((prev) => ({ ...prev, [id]: '' }))
    toast.success('Hedefe eklendi')
  }

  const handleDeleteGoal = async (id, title) => {
    if (!window.confirm(`"${title}" hedefi silinsin mi?`)) return
    await deleteGoal(id)
    toast.success('Hedef silindi')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.transactions) await db.transactions.clear()
        if (data.sessions) await db.sessions.clear()
        if (data.settings) await db.settings.clear()
        if (data.transactions?.length)
          await db.transactions.bulkAdd(data.transactions)
        if (data.sessions?.length) await db.sessions.bulkAdd(data.sessions)
        if (data.settings?.length) await db.settings.bulkAdd(data.settings)
        toast.success(`İçe aktarma tamamlandı.`)
        window.location.reload()
      } catch {
        toast.error('Dosya okunamadı. Geçerli bir yedek dosyası seç.')
      }
    }
    input.click()
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="budget">Bütçe</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="goals">Hedefler</TabsTrigger>
          <TabsTrigger value="data">Veri</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <FieldSet>
            <FieldLegend variant="label">Profil</FieldLegend>
            <FieldDescription>
              Uygulama içinde görünecek ismin.
            </FieldDescription>
            <FieldGroup className="mt-4 gap-3">
              <Field>
                <FieldLabel htmlFor="name">İsmin</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    placeholder="Adını gir"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                  />
                </InputGroup>
              </Field>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveName}
                  disabled={!nameDraft.trim() || nameDraft === username}
                >
                  Kaydet
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Aylık Bütçe Limiti</CardTitle>
              <CardDescription>
                Bir ayda harcamak istediğin maksimum tutarı belirle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="budget">
                    Aylık bütçe limiti (TL)
                  </FieldLabel>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(e.target.value)}
                  />
                </Field>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveBudget}
                    disabled={
                      !budgetDraft || Number(budgetDraft) === monthlyBudget
                    }
                  >
                    Kaydet
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategori Bütçeleri</CardTitle>
              <CardDescription>
                Her kategori için ayrı bütçe limiti belirle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend variant="label">Gider Kategorileri</FieldLegend>
                <FieldGroup>
                  {allCategories.expense.map((cat) => (
                    <Field key={cat.id} orientation="horizontal">
                      <FieldLabel className="min-w-24 pt-2">{cat.label}</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Limitsiz"
                        value={categoryBudgets[cat.label] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === '') {
                            removeCategoryBudget(cat.label)
                          } else {
                            setCategoryBudget(cat.label, Number(v))
                          }
                        }}
                      />
                    </Field>
                  ))}
                </FieldGroup>
              </FieldSet>
              <Separator className="my-4" />
              <FieldSet>
                <FieldLegend variant="label">Gelir Kategorileri</FieldLegend>
                <FieldGroup>
                  {allCategories.income.map((cat) => (
                    <Field key={cat.id} orientation="horizontal">
                      <FieldLabel className="min-w-24 pt-2">{cat.label}</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Limitsiz"
                        value={categoryBudgets[cat.label] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === '') {
                            removeCategoryBudget(cat.label)
                          } else {
                            setCategoryBudget(cat.label, Number(v))
                          }
                        }}
                      />
                    </Field>
                  ))}
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Yapay Zeka Ayarları</CardTitle>
              <CardDescription>
                AI, harcama metnini otomatik ayrıştırmak için kullanılır. API
                anahtarı girilmezse temel kelime eşleştirme yöntemi çalışır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="api-key">API Anahtarı</FieldLabel>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={
                      aiBaseUrl.includes('openrouter')
                        ? 'sk-or-v1-...'
                        : 'sk-...'
                    }
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="base-url">API Base URL</FieldLabel>
                  <Input
                    id="base-url"
                    type="url"
                    placeholder="https://openrouter.ai/api/v1"
                    value={baseUrlDraft}
                    onChange={(e) => setBaseUrlDraft(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ai-model">Model</FieldLabel>
                  <Select
                    items={modelItems}
                    value={modelDraft}
                    onValueChange={(v) => setModelDraft(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {modelItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveAi}
                    disabled={
                      keyDraft === apiKey &&
                      baseUrlDraft === aiBaseUrl &&
                      modelDraft === aiModel
                    }
                  >
                    Kaydet
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockIcon className="size-4" />
                Uygulama Kilidi
              </CardTitle>
              <CardDescription>
                API anahtarini korumak icin bir sifre belirle. Sifre, API anahtarini IndexedDB'de sifreler.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!appPasswordSet ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="set-pw">Sifre</FieldLabel>
                    <Input
                      id="set-pw"
                      type="password"
                      placeholder="En az 4 karakter"
                      value={pwDraft}
                      onChange={(e) => { setPwDraft(e.target.value); setPwError('') }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="set-pw2">Sifre (Tekrar)</FieldLabel>
                    <Input
                      id="set-pw2"
                      type="password"
                      placeholder="Ayni sifreyi gir"
                      value={pwDraft2}
                      onChange={(e) => { setPwDraft2(e.target.value); setPwError('') }}
                    />
                  </Field>
                  {pwError && <p className="text-destructive text-sm">{pwError}</p>}
                  <div className="flex justify-end">
                    <Button
                      onClick={async () => {
                        if (pwDraft.length < 4) { setPwError('En az 4 karakter'); return }
                        if (pwDraft !== pwDraft2) { setPwError('Sifreler eslesmiyor'); return }
                        await setAppPassword(pwDraft)
                        setPwDraft(''); setPwDraft2('')
                        toast.success('Sifre belirlendi. Bir dahaki acilista sorulacak.')
                      }}
                      disabled={!pwDraft || pwDraft !== pwDraft2}
                    >
                      Sifre Belirle
                    </Button>
                  </div>
                </FieldGroup>
              ) : (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="old-pw">Mevcut Sifre</FieldLabel>
                    <Input
                      id="old-pw"
                      type="password"
                      placeholder="Mevcut sifreni gir"
                      value={oldPwDraft}
                      onChange={(e) => { setOldPwDraft(e.target.value); setPwError('') }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-pw">Yeni Sifre</FieldLabel>
                    <Input
                      id="new-pw"
                      type="password"
                      placeholder="En az 4 karakter"
                      value={pwDraft}
                      onChange={(e) => { setPwDraft(e.target.value); setPwError('') }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-pw2">Yeni Sifre (Tekrar)</FieldLabel>
                    <Input
                      id="new-pw2"
                      type="password"
                      placeholder="Ayni sifreyi gir"
                      value={pwDraft2}
                      onChange={(e) => { setPwDraft2(e.target.value); setPwError('') }}
                    />
                  </Field>
                  {pwError && <p className="text-destructive text-sm">{pwError}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={async () => {
                        if (!oldPwDraft) { setPwError('Mevcut sifreni gir'); return }
                        if (pwDraft.length < 4) { setPwError('En az 4 karakter'); return }
                        if (pwDraft !== pwDraft2) { setPwError('Sifreler eslesmiyor'); return }
                        try {
                          await changeAppPassword(oldPwDraft, pwDraft)
                          setOldPwDraft(''); setPwDraft(''); setPwDraft2('')
                          toast.success('Sifre degistirildi')
                        } catch { setPwError('Mevcut sifre hatali') }
                      }}
                    >
                      Sifre Degistir
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!oldPwDraft) { setPwError('Mevcut sifreni gir'); return }
                        try {
                          await removeAppPassword(oldPwDraft)
                          setOldPwDraft(''); setPwDraft(''); setPwDraft2('')
                          toast.success('Sifre kaldirildi')
                        } catch { setPwError('Mevcut sifre hatali') }
                      }}
                    >
                      Sifreyi Kaldir
                    </Button>
                  </div>
                </FieldGroup>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategoriler</CardTitle>
              <CardDescription>
                Varsayılan ve özel kategorilerini yönet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend variant="label">Gider Kategorileri</FieldLegend>
                <div className="flex flex-wrap items-center gap-2">
                  {allCategories.expense.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={cat.isCustom ? 'outline' : 'secondary'}
                    >
                      {cat.label}
                      {cat.isCustom && (
                        <button
                          onClick={() =>
                            handleRemoveCategory('expense', cat.id)
                          }
                          className="ml-1 opacity-50 hover:opacity-100"
                        >
                          <XIcon className="size-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </FieldSet>
              <Separator className="my-4" />
              <FieldSet>
                <FieldLegend variant="label">Gelir Kategorileri</FieldLegend>
                <div className="flex flex-wrap items-center gap-2">
                  {allCategories.income.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={cat.isCustom ? 'outline' : 'default'}
                    >
                      {cat.label}
                      {cat.isCustom && (
                        <button
                          onClick={() => handleRemoveCategory('income', cat.id)}
                          className="ml-1 opacity-50 hover:opacity-100"
                        >
                          <XIcon className="size-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </FieldSet>
              <Separator className="my-4" />
              <FieldSet>
                <FieldLegend variant="label">Özel Kategori Ekle</FieldLegend>
                <FieldGroup orientation="horizontal">
                  <Field>
                    <FieldLabel htmlFor="new-cat-label">
                      Kategori adı
                    </FieldLabel>
                    <Input
                      id="new-cat-label"
                      placeholder="ör. Kira"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-cat-type">Tür</FieldLabel>
                    <Select
                      items={[
                        { label: 'Gider', value: 'gider' },
                        { label: 'Gelir', value: 'gelir' }
                      ]}
                      value={newCatType}
                      onValueChange={(v) => setNewCatType(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="gider">Gider</SelectItem>
                          <SelectItem value="gelir">Gelir</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="self-end">
                    <Button
                      onClick={handleAddCategory}
                      disabled={!newCatLabel.trim()}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Ekle
                    </Button>
                  </div>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hedef Oluştur</CardTitle>
              <CardDescription>
                Yeni bir birikim hedefi belirle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Field>
                    <FieldLabel htmlFor="goal-title">Hedef adı</FieldLabel>
                    <Input
                      id="goal-title"
                      placeholder="örn. Tatil"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-target">Hedef tutar (TL)</FieldLabel>
                    <Input
                      id="goal-target"
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="goal-deadline">
                      Son tarih (opsiyonel)
                    </FieldLabel>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                    />
                  </Field>
                  <div className="self-end">
                    <Button
                      onClick={handleAddGoal}
                      disabled={!goalTitle.trim() || !goalTarget}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Ekle
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hedeflerim</CardTitle>
                <CardDescription>
                  Birikim hedeflerini yönet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const pct =
                      goal.targetAmount > 0
                        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                        : 0
                    return (
                      <div
                        key={goal.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium">{goal.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {goal.deadline
                                ? new Date(goal.deadline).toLocaleDateString('tr-TR')
                                : 'Süresiz'}{' '}
                              &middot; %{pct} tamamlandı
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              handleDeleteGoal(goal.id, goal.title)
                            }
                          >
                            <XIcon className="size-3.5" />
                          </Button>
                        </div>
                        <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mb-3 flex items-center justify-between text-sm">
                          <span className="font-medium tabular-nums">
                            {goal.currentAmount?.toLocaleString('tr-TR')} TL
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            / {goal.targetAmount?.toLocaleString('tr-TR')} TL
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Tutar"
                            className="h-8 w-28"
                            value={goalAddAmount[goal.id] || ''}
                            onChange={(e) =>
                              setGoalAddAmount((prev) => ({
                                ...prev,
                                [goal.id]: e.target.value
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToGoal(goal.id)}
                            disabled={
                              !goalAddAmount[goal.id] ||
                              Number(goalAddAmount[goal.id]) <= 0
                            }
                          >
                            Ekle
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Veri Yedekleme</CardTitle>
              <CardDescription>
                Tüm verilerini dışa aktar veya önceden aldığın bir yedeği geri
                yükle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Button onClick={handleExport} variant="outline">
                    <DownloadIcon data-icon="inline-start" />
                    Dışa Aktar
                  </Button>
                  <Button onClick={handleImport} variant="outline">
                    <UploadIcon data-icon="inline-start" />
                    İçe Aktar
                  </Button>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raporlar</CardTitle>
              <CardDescription>
                Bu ayki verilerini CSV veya PDF olarak dışa aktar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Button onClick={handleCsvExport} variant="outline">
                    <TableIcon data-icon="inline-start" />
                    CSV İndir
                  </Button>
                  <Button onClick={handlePrintReport} variant="outline">
                    <FileTextIcon data-icon="inline-start" />
                    PDF Rapor
                  </Button>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
