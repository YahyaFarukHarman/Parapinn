import { useMemo, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useTransactionStore } from '@/stores/transaction-store'
import {
  AlertTriangleIcon,
  BarChart3Icon,
  LightbulbIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { analyzeBudget, forecastNextMonth } from '@/lib/ai'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const MONTHS = [
  'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
  'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'
]

function formatAmount(value) {
  return value.toLocaleString('tr-TR') + ' TL'
}

export default function ReportsPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const budgets = useSettingsStore((s) => s.budgets)
  const categoryBudgets = useSettingsStore((s) => s.categoryBudgets)
  const apiKey = useSettingsStore((s) => s.apiKey)
  const aiBaseUrl = useSettingsStore((s) => s.aiBaseUrl)
  const aiModel = useSettingsStore((s) => s.aiModel)

  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [forecastResult, setForecastResult] = useState(null)
  const [isForecasting, setIsForecasting] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const selectedDate = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    return d
  }, [monthOffset])

  const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`
  const monthBudget = budgets?.[monthKey] ?? 0

  const filteredTxs = useMemo(() => {
    const month = selectedDate.getMonth()
    const year = selectedDate.getFullYear()
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [transactions, selectedDate])

  const monthlyIncome = filteredTxs.filter((t) => t.type === 'gelir').reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = filteredTxs.filter((t) => t.type === 'gider').reduce((s, t) => s + t.amount, 0)
  const remainingBudget = monthBudget - monthlyExpense
  const budgetPercent = monthBudget > 0 ? (monthlyExpense / monthBudget) * 100 : 0

  const riskColor =
    analysisResult?.riskScore === 0
      ? 'bg-muted-foreground'
      : analysisResult?.riskScore <= 2
        ? 'bg-green-500'
        : analysisResult?.riskScore <= 3
          ? 'bg-amber-500'
          : 'bg-red-500'

  const runAnalysis = async () => {
    if (isAnalyzing) return
    setIsAnalyzing(true)
    try {
      const result = await analyzeBudget(transactions, budgets, monthKey, {
        apiKey,
        model: aiModel,
        baseUrl: aiBaseUrl
      })
      setAnalysisResult(result)
    } catch {
      toast.error('Analiz basarisiz')
    }
    setIsAnalyzing(false)
  }

  const handleForecast = async () => {
    if (isForecasting) return
    setIsForecasting(true)
    try {
      const result = await forecastNextMonth(transactions, budgets, monthKey, {
        apiKey,
        model: aiModel,
        baseUrl: aiBaseUrl
      })
      setForecastResult(result)
    } catch {
      toast.error('Tahmin basarisiz')
    }
    setIsForecasting(false)
  }

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold">Raporlar</h1>
          <p className="text-muted-foreground text-sm">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()} — Butce Analizi ve Tahminler
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonthOffset((p) => p - 1)}>
            <TrendingUpIcon className="size-4 rotate-90" />
          </Button>
          <span className="text-sm font-medium tabular-nums">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset((p) => p + 1)}
            disabled={monthOffset === 0}
          >
            <TrendingDownIcon className="size-4 rotate-90" />
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
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
              <BarChart3Icon className="size-3.5 text-blue-500" />
              Butce
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {formatAmount(monthBudget)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {monthBudget <= 0 && (
        <Alert className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>Butce Belirtilmemis</AlertTitle>
          <AlertDescription>
            Analiz ve tahmin icin Ayarlar sayfasindan butce limiti belirleyebilirsin.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-5 text-yellow-500" />
              Butce Analizi
            </CardTitle>
            <CardDescription>
              AI ile harcama analizi ve risk degerlendirmesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-muted-foreground text-sm">
                  Butce durumunu yapay zeka ile analiz et, tek seferlik
                  harcamalari tespit et ve risk puanini gor.
                </p>
                <Button onClick={runAnalysis} disabled={isAnalyzing || monthBudget <= 0}>
                  {isAnalyzing ? 'Analiz ediliyor...' : 'Analizi Baslat'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${riskColor}`}>
                    {analysisResult.riskScore > 0 ? analysisResult.riskScore : '?'}
                  </div>
                  <div>
                    <p className="font-medium">{analysisResult.summary}</p>
                    <p className="text-muted-foreground mt-0.5 text-sm">{analysisResult.details}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span>Harcama: <strong>{analysisResult.totalSpent?.toLocaleString('tr-TR') || monthlyExpense.toLocaleString('tr-TR')} TL</strong></span>
                  <span>Butce: <strong>{analysisResult.budget?.toLocaleString('tr-TR') || monthBudget.toLocaleString('tr-TR')} TL</strong></span>
                  {analysisResult.oneTimeTotal > 0 && (
                    <Badge variant="secondary">Tek seferlik: {analysisResult.oneTimeTotal.toLocaleString('tr-TR')} TL</Badge>
                  )}
                </div>
                {analysisResult.oneTimeExpenses?.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm font-medium">Tek seferlik harcamalar:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.oneTimeExpenses.map((e, i) => (
                        <Badge key={i} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analysisResult.hasStructuralIssue && (
                  <Alert variant="destructive">
                    <AlertTriangleIcon className="size-4" />
                    <AlertTitle>Yapisal Sorun Tespit Edildi</AlertTitle>
                    <AlertDescription>Tekrarlayan harcamalarin ortalamanin cok uzerinde.</AlertDescription>
                  </Alert>
                )}
                {analysisResult.recommendation && (
                  <Alert>
                    <LightbulbIcon className="size-4" />
                    <AlertTitle>Oneri</AlertTitle>
                    <AlertDescription>{analysisResult.recommendation}</AlertDescription>
                  </Alert>
                )}
                <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
                  Tekrar Analiz Et
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-5 text-purple-500" />
              Gelecek Ay Tahmini
            </CardTitle>
            <CardDescription>
              Gecmis 3 ayin verilerine gore AI tahmini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!forecastResult ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-muted-foreground text-sm">
                  Gecmis harcamalarina gore gelecek ay ne kadar harcayacagini tahmin et.
                </p>
                <Button onClick={handleForecast} disabled={isForecasting}>
                  {isForecasting ? 'Tahmin ediliyor...' : 'Tahmin Olustur'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">Tahmini Harcama</p>
                    <p className="text-3xl font-bold">
                      {forecastResult.predictedTotal?.toLocaleString('tr-TR') || 0} TL
                    </p>
                  </div>
                  <Badge variant={forecastResult.budgetStatus === 'ustunde' ? 'destructive' : 'secondary'}>
                    {forecastResult.budgetStatus === 'ustunde' ? 'Butce ustunde' : forecastResult.budgetStatus === 'esit' ? 'Butceye yakin' : 'Butce altinda'}
                  </Badge>
                </div>
                {forecastResult.budgetDifference !== 0 && (
                  <Alert variant={forecastResult.budgetStatus === 'ustunde' ? 'destructive' : 'default'}>
                    <AlertTriangleIcon className="size-4" />
                    <AlertTitle>
                      {forecastResult.budgetStatus === 'ustunde' ? 'Butce asimi bekleniyor' : 'Butce icinde kalman bekleniyor'}
                    </AlertTitle>
                    <AlertDescription>
                      {forecastResult.budgetStatus === 'ustunde'
                        ? `Tahminen butceni ${Math.abs(forecastResult.budgetDifference).toLocaleString('tr-TR')} TL asabilirsin.`
                        : 'Butcenin altinda kalman bekleniyor.'}
                    </AlertDescription>
                  </Alert>
                )}
                {forecastResult.categoryBreakdown?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Kategori Bazinda Tahmin</p>
                    <div className="space-y-1.5">
                      {forecastResult.categoryBreakdown.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">~{cat.predicted?.toLocaleString('tr-TR')} TL</span>
                            <Badge variant="outline" className={cat.trend === 'artiyor' ? 'border-red-200 text-red-600' : cat.trend === 'azaliyor' ? 'border-green-200 text-green-600' : ''}>
                              {cat.trend === 'artiyor' ? (String.fromCharCode(8593)) : cat.trend === 'azaliyor' ? (String.fromCharCode(8595)) : (String.fromCharCode(8594))}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {forecastResult.insight && (
                  <p className="text-muted-foreground text-sm">{forecastResult.insight}</p>
                )}
                {forecastResult.recommendation && (
                  <Alert>
                    <LightbulbIcon className="size-4" />
                    <AlertTitle>Oneri</AlertTitle>
                    <AlertDescription>{forecastResult.recommendation}</AlertDescription>
                  </Alert>
                )}
                <Button variant="outline" size="sm" onClick={() => setForecastResult(null)}>
                  Yeniden Hesapla
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(categoryBudgets).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-5 text-orange-500" />
              Kategori Butce Gerceklestirme
            </CardTitle>
            <CardDescription>Her kategorinin butce limitine gore doluluk orani</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryBudgets).map(([cat, limit]) => {
                const spent = filteredTxs.filter((t) => t.type === 'gider' && t.category === cat).reduce((s, t) => s + t.amount, 0)
                const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{cat}</span>
                      <span className={pct >= 100 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {spent.toLocaleString('tr-TR')} / {limit.toLocaleString('tr-TR')} TL
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
