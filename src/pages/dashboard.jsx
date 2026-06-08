import { useEffect, useMemo, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useTransactionStore } from '@/stores/transaction-store'
import { useGoalsStore } from '@/stores/goals-store'
import { useAccountsStore } from '@/stores/accounts-store'
import {
  AlertTriangleIcon,
  ArrowLeftRightIcon,
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  RepeatIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts'
import { toast } from 'sonner'

import { DEFAULT_CATEGORIES, ROUTES } from '@/lib/constants'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const typeItems = [
  { label: 'Gider', value: 'gider' },
  { label: 'Gelir', value: 'gelir' }
]

function getCategoryItems(type) {
  const cats =
    type === 'gelir' ? DEFAULT_CATEGORIES.income : DEFAULT_CATEGORIES.expense
  return cats.map((c) => ({ label: c.label, value: c.label }))
}

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
]

const PIE_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16'
]

function formatAmount(value) {
  return value.toLocaleString('tr-TR') + ' TL'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const transactions = useTransactionStore((s) => s.transactions)
  const loadTransactions = useTransactionStore((s) => s.loadTransactions)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const getActiveRecurringTemplates = useTransactionStore(
    (s) => s.getActiveRecurringTemplates
  )
  const toggleRecurringActive = useTransactionStore(
    (s) => s.toggleRecurringActive
  )
  const deleteRecurringWithInstances = useTransactionStore(
    (s) => s.deleteRecurringWithInstances
  )
  const generateRecurringInstances = useTransactionStore(
    (s) => s.generateRecurringInstances
  )
  const transferBetweenAccounts = useTransactionStore(
    (s) => s.transferBetweenAccounts
  )
  const goals = useGoalsStore((s) => s.goals)
  const loadGoals = useGoalsStore((s) => s.loadGoals)
  const addToGoal = useGoalsStore((s) => s.addToGoal)
  const accounts = useAccountsStore((s) => s.accounts)
  const loadAccounts = useAccountsStore((s) => s.loadAccounts)
  const budgets = useSettingsStore((s) => s.budgets)
  const categoryBudgets = useSettingsStore((s) => s.categoryBudgets)

  const [editingTx, setEditingTx] = useState(null)
  const [monthOffset, setMonthOffset] = useState(0)
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferFrom, setTransferFrom] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  useEffect(() => {
    loadTransactions()
    loadGoals()
    loadAccounts()
  }, [loadTransactions, loadGoals, loadAccounts])

  const now = new Date()
  const selectedDate = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    return d
  }, [monthOffset])

  const filteredTxs = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [transactions, selectedDate])

  const allCategories = [...new Set(filteredTxs.map((t) => t.category))].sort()

  const displayTxs = useMemo(() => {
    let result = filteredTxs
    if (filterType !== 'all')
      result = result.filter((t) => t.type === filterType)
    if (filterCategory !== 'all')
      result = result.filter((t) => t.category === filterCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q))
    }
    return result
  }, [filteredTxs, filterType, filterCategory, searchQuery])

  const monthlyIncome = filteredTxs
    .filter((t) => t.type === 'gelir')
    .reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = filteredTxs
    .filter((t) => t.type === 'gider')
    .reduce((s, t) => s + t.amount, 0)
  const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`
  const monthBudget = budgets?.[monthKey] ?? 0
  const remainingBudget = monthBudget - monthlyExpense
  const budgetPercent =
    monthBudget > 0 ? (monthlyExpense / monthBudget) * 100 : 0

  const categoryData = useMemo(() => {
    const groups = {}
    filteredTxs
      .filter((t) => t.type === 'gider')
      .forEach((t) => {
        groups[t.category] = (groups[t.category] || 0) + t.amount
      })
    return Object.entries(groups)
      .map(([category, amount], i) => ({
        category,
        amount,
        fill: PIE_COLORS[i % PIE_COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTxs])

  const comparisonData = useMemo(
    () => [
      { name: 'Gelir', amount: monthlyIncome, fill: '#22c55e' },
      { name: 'Gider', amount: monthlyExpense, fill: '#ef4444' }
    ],
    [monthlyIncome, monthlyExpense]
  )

  const pieConfig = {
    amount: { label: 'Tutar' }
  }

  const barConfig = {
    gelir: { label: 'Gelir', color: '#22c55e' },
    gider: { label: 'Gider', color: '#ef4444' }
  }

  const handleDelete = async (id) => {
    await deleteTransaction(id)
    toast.success('İşlem silindi')
  }

  const handleEdit = async () => {
    if (!editingTx) return
    await updateTransaction(editingTx.id, {
      type: editingTx.type,
      amount: editingTx.amount,
      category: editingTx.category,
      title: editingTx.title
    })
    setEditingTx(null)
    toast.success('İşlem güncellendi')
  }

  useEffect(() => {
    if (transactions.length === 0) return
    generateRecurringInstances(monthKey)
  }, [monthKey, generateRecurringInstances, transactions.length])

  const activeTemplates = useMemo(() => getActiveRecurringTemplates(), [transactions, getActiveRecurringTemplates])

  const recurringMonthlyTotal = useMemo(
    () =>
      activeTemplates
        .filter((t) => t.type === 'gider')
        .reduce((s, t) => s + t.amount, 0),
    [activeTemplates]
  )

  const recurringMonthlyIncome = useMemo(
    () =>
      activeTemplates
        .filter((t) => t.type === 'gelir')
        .reduce((s, t) => s + t.amount, 0),
    [activeTemplates]
  )

  const isCurrentMonth = monthOffset === 0

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMonthOffset((p) => p - 1)}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg font-semibold">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
          {!isCurrentMonth && (
            <Button variant="ghost" size="xs" onClick={() => setMonthOffset(0)}>
              Bu Ay
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMonthOffset((p) => p + 1)}
          disabled={isCurrentMonth}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUpIcon className="size-3.5 text-green-500" />
              Gelir
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">
              {formatAmount(monthlyIncome)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TrendingDownIcon className="size-3.5 text-red-500" />
              Gider
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600">
              {formatAmount(monthlyExpense)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <WalletIcon className="size-3.5 text-blue-500" />
              Kalan Bütçe
            </CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-blue-600'}`}
            >
              {formatAmount(remainingBudget)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardDescription className="flex items-center gap-1.5">
                <WalletIcon className="size-3.5 text-indigo-500" />
                Toplam Bakiye
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-600">
                {formatAmount(accounts.reduce((s, a) => s + (a.balance || 0), 0))}
              </CardTitle>
            </div>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRightIcon data-icon="inline-start" />
              Transfer
            </Button>
          </CardFooter>
        </Card>
      </div>

      {monthBudget > 0 && budgetPercent >= 80 && (
        <Alert
          variant={budgetPercent >= 100 ? 'destructive' : 'default'}
          className="mb-6"
        >
          <AlertTriangleIcon />
          <AlertTitle>
            {budgetPercent >= 100
              ? 'Bütçe limiti aşıldı!'
              : `Bütçe limitinin %${Math.round(budgetPercent)}'ine ulaştın`}
          </AlertTitle>
          <AlertDescription>
            {budgetPercent >= 100
              ? `Bu ay ${(monthlyExpense - monthBudget).toLocaleString('tr-TR')} TL bütçe aşımın var.`
              : `Kalan bütçen: ${formatAmount(remainingBudget)}`}
          </AlertDescription>
        </Alert>
      )}

      {goals.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            🎯 Birikim Hedefleri
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const pct =
                goal.targetAmount > 0
                  ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                  : 0
              return (
                <Card key={goal.id} size="sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{goal.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        %{pct}
                      </Badge>
                    </div>
                    <CardDescription>
                      {goal.deadline
                        ? new Date(goal.deadline).toLocaleDateString('tr-TR')
                        : 'Süresiz'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium tabular-nums">
                        {goal.currentAmount?.toLocaleString('tr-TR')} TL
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        / {goal.targetAmount?.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {filteredTxs.length > 0 && (
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Bazında Harcama</CardTitle>
              <CardDescription>Giderlerinin kategori dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
                  Bu aya ait gider yok
                </div>
              ) : (
                <ChartContainer config={pieConfig}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              )}
              {Object.keys(categoryBudgets).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Kategori Butce Durumu</p>
                  {Object.entries(categoryBudgets).map(([cat, limit]) => {
                    const spent = filteredTxs
                      .filter((t) => t.type === 'gider' && t.category === cat)
                      .reduce((s, t) => s + t.amount, 0)
                    const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs">
                          <span>{cat}</span>
                          <span className={pct >= 100 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {spent.toLocaleString('tr-TR')} / {limit.toLocaleString('tr-TR')} TL
                          </span>
                        </div>
                        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gelir / Gider Karşılaştırması</CardTitle>
              <CardDescription>Aylık gelir ve giderlerin</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <ChartContainer
                config={barConfig}
                className="h-full w-full overflow-hidden"
              >
                <BarChart data={comparisonData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickMargin={16}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickMargin={43}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(v) => formatAmount(v)} />
                    }
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card size="sm" className="cursor-pointer" onClick={() => navigate(ROUTES.reports)}>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-yellow-500" />
              Bütçe Analizi
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              AI ile harcama analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Tek seferlik harcamaları tespit et, risk puanını gör, öneriler al.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Raporu Gör
            </Button>
          </CardContent>
        </Card>
        <Card size="sm" className="cursor-pointer" onClick={() => navigate(ROUTES.reports)}>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-purple-500" />
              Gelecek Ay Tahmini
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              AI destekli tahmin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Geçmiş 3 ayın verilerine göre gelecek ay harcama tahmini ve bütçe uyarıları.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Tahmini Gör
            </Button>
          </CardContent>
        </Card>
      </div>

      {activeTemplates.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RepeatIcon className="size-5 text-yellow-500" />
              Aktif Abonelikler
            </CardTitle>
            <CardDescription>
              Tekrarlayan işlemlerin ve aylık toplamları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {activeTemplates.map((tmpl) => {
                const isExpense = tmpl.type === 'gider'
                const intervalLabel =
                  tmpl.recurringInterval === 'monthly'
                    ? `Her ay ${tmpl.recurringDay}.`
                    : tmpl.recurringInterval === 'weekly'
                      ? 'Her hafta'
                      : 'Her yıl'
                return (
                  <div
                    key={tmpl.id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => toggleRecurringActive(tmpl.id)}
                      >
                        {tmpl.active === false ? (
                          <PlayIcon className="size-3.5 text-muted-foreground" />
                        ) : (
                          <PauseIcon className="size-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${tmpl.active === false ? 'text-muted-foreground line-through' : ''}`}
                        >
                          {tmpl.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {tmpl.category} &middot; {intervalLabel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium tabular-nums ${isExpense ? 'text-red-500' : 'text-green-500'}`}
                      >
                        {isExpense ? '-' : '+'}
                        {tmpl.amount.toLocaleString('tr-TR')} TL
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          if (
                            window.confirm(
                              `"${tmpl.title}" ve tüm tekrarlanan kayıtları silinsin mi?`
                            )
                          ) {
                            deleteRecurringWithInstances(tmpl.id)
                            toast.success('Abonelik ve kayıtları silindi')
                          }
                        }}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aylık tekrarlayan gider</span>
              <span className="font-medium tabular-nums text-red-500">
                -{recurringMonthlyTotal.toLocaleString('tr-TR')} TL
              </span>
            </div>
            {recurringMonthlyIncome > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Aylık tekrarlayan gelir
                </span>
                <span className="font-medium tabular-nums text-green-500">
                  +{recurringMonthlyIncome.toLocaleString('tr-TR')} TL
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
          <CardDescription>
            {MONTHS[selectedDate.getMonth()]} ayı işlem kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTxs.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <InputGroup className="w-48">
                <InputGroupInput
                  placeholder="Başlıkta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                items={[{ label: 'Tümü', value: 'all' }, ...typeItems]}
                value={filterType}
                onValueChange={(v) => setFilterType(v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[{ label: 'Tümü', value: 'all' }, ...typeItems].map(
                      (item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                items={[
                  { label: 'Tümü', value: 'all' },
                  ...allCategories.map((c) => ({ label: c, value: c }))
                ]}
                value={filterCategory}
                onValueChange={(v) => setFilterCategory(v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[
                      { label: 'Tümü', value: 'all' },
                      ...allCategories.map((c) => ({ label: c, value: c }))
                    ].map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          {displayTxs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3Icon className="size-8" />
                </EmptyMedia>
                <EmptyTitle>
                  {filteredTxs.length === 0
                    ? 'Bu aya ait işlem yok'
                    : 'Eşleşen işlem bulunamadı'}
                </EmptyTitle>
                <EmptyDescription>
                  {filteredTxs.length === 0
                    ? 'Sohbet üzerinden harcama ekledikçe işlemlerin burada görünecek.'
                    : 'Filtreleri değiştirerek tekrar dene.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate(ROUTES.chat)}>
                  Harcama Ekle
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTxs.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {tx.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'gider' ? 'secondary' : 'default'}
                      >
                        {tx.type === 'gider' ? 'Gider' : 'Gelir'}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell className="max-w-40 truncate">
                      {tx.title}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${tx.type === 'gelir' ? 'text-green-600' : ''}`}
                    >
                      {formatAmount(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setEditingTx({
                              id: tx.id,
                              type: tx.type,
                              amount: tx.amount,
                              category: tx.category,
                              title: tx.title
                            })
                          }
                        >
                          <PencilIcon className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editingTx}
        onOpenChange={(o) => {
          if (!o) setEditingTx(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlemi Düzenle</DialogTitle>
            <DialogDescription>İşlem detaylarını güncelle.</DialogDescription>
          </DialogHeader>
          {editingTx && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-type">Tür</FieldLabel>
                <Select
                  items={typeItems}
                  value={editingTx.type}
                  onValueChange={(v) =>
                    setEditingTx((prev) => ({
                      ...prev,
                      type: v,
                      category: getCategoryItems(v)[0].value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {typeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-amount">Tutar (TL)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="edit-amount"
                    type="number"
                    min="0"
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx((prev) => ({
                        ...prev,
                        amount: Number(e.target.value)
                      }))
                    }
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-category">Kategori</FieldLabel>
                <Select
                  items={getCategoryItems(editingTx.type)}
                  value={editingTx.category}
                  onValueChange={(v) =>
                    setEditingTx((prev) => ({ ...prev, category: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {getCategoryItems(editingTx.type).map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-title">Başlık</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="edit-title"
                    value={editingTx.title}
                    onChange={(e) =>
                      setEditingTx((prev) => ({
                        ...prev,
                        title: e.target.value
                      }))
                    }
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTx(null)}>
              İptal
            </Button>
            <Button onClick={handleEdit}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showTransfer}
        onOpenChange={(o) => {
          if (!o) setShowTransfer(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap Arası Transfer</DialogTitle>
            <DialogDescription>
              Bir hesaptan diğerine para aktar.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="transfer-from">Kaynak hesap</FieldLabel>
              <Select
                items={accounts.map((a) => ({
                  label: `${a.name} (${(a.balance || 0).toLocaleString('tr-TR')} TL)`,
                  value: a.id
                }))}
                value={transferFrom}
                onValueChange={(v) => setTransferFrom(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({(a.balance || 0).toLocaleString('tr-TR')} TL)
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="transfer-to">Hedef hesap</FieldLabel>
              <Select
                items={accounts
                  .filter((a) => a.id !== transferFrom)
                  .map((a) => ({
                    label: a.name,
                    value: a.id
                  }))}
                value={transferTo}
                onValueChange={(v) => setTransferTo(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts
                      .filter((a) => a.id !== transferFrom)
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="transfer-amount">Tutar (TL)</FieldLabel>
              <Input
                id="transfer-amount"
                type="number"
                min="0"
                placeholder="0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransfer(false)}>
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (!transferFrom || !transferTo || !transferAmount) return
                await transferBetweenAccounts(
                  transferFrom,
                  transferTo,
                  Number(transferAmount)
                )
                setShowTransfer(false)
                setTransferFrom('')
                setTransferTo('')
                setTransferAmount('')
                toast.success('Transfer tamamlandı')
              }}
              disabled={!transferFrom || !transferTo || !transferAmount}
            >
              <ArrowLeftRightIcon data-icon="inline-start" />
              Transfer Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
