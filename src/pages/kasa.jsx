import { useEffect, useState } from 'react'
import { useAccountsStore } from '@/stores/accounts-store'
import { useDebtsStore } from '@/stores/debts-store'
import { useTransactionStore } from '@/stores/transaction-store'
import {
  AlertTriangleIcon,
  ArrowLeftRightIcon,
  PencilIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
  XIcon
} from 'lucide-react'
import { toast } from 'sonner'

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
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

function formatAmount(value) {
  return value.toLocaleString('tr-TR') + ' TL'
}

const typeItems = [
  { label: 'Nakit', value: 'nakit' },
  { label: 'Kredi Karti', value: 'kredi' },
  { label: 'Banka', value: 'banka' }
]

export default function KasaPage() {
  const accounts = useAccountsStore((s) => s.accounts)
  const loadAccounts = useAccountsStore((s) => s.loadAccounts)
  const addAccount = useAccountsStore((s) => s.addAccount)
  const updateAccount = useAccountsStore((s) => s.updateAccount)
  const deleteAccount = useAccountsStore((s) => s.deleteAccount)
  const transferBetweenAccounts = useTransactionStore((s) => s.transferBetweenAccounts)
  const debts = useDebtsStore((s) => s.debts)
  const loadDebts = useDebtsStore((s) => s.loadDebts)
  const addDebt = useDebtsStore((s) => s.addDebt)
  const recordPayment = useDebtsStore((s) => s.recordPayment)
  const deleteDebt = useDebtsStore((s) => s.deleteDebt)

  const [newAccName, setNewAccName] = useState('')
  const [newAccType, setNewAccType] = useState('nakit')
  const [newAccBalance, setNewAccBalance] = useState('')
  const [editingAcc, setEditingAcc] = useState(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferFrom, setTransferFrom] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  const [debtPerson, setDebtPerson] = useState('')
  const [debtType, setDebtType] = useState('alacak')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDesc, setDebtDesc] = useState('')
  const [debtPayment, setDebtPayment] = useState({})

  useEffect(() => {
    loadAccounts()
    loadDebts()
  }, [loadAccounts, loadDebts])

  const totalAlacak = debts.filter((d) => d.type === 'alacak').reduce((s, d) => s + d.remaining, 0)
  const totalBorc = debts.filter((d) => d.type === 'borc').reduce((s, d) => s + d.remaining, 0)
  const netDebt = totalAlacak - totalBorc

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <WalletIcon className="size-3.5 text-blue-500" />
              Toplam Bakiye
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {formatAmount(accounts.reduce((s, a) => s + (a.balance || 0), 0))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 text-green-600">
              <TrendingUpIcon className="size-3.5" />
              Alacak
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">
              {formatAmount(totalAlacak)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5 text-red-500">
              <TrendingDownIcon className="size-3.5" />
              Borc
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {formatAmount(totalBorc)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Net Durum</CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${netDebt >= 0 ? 'text-green-600' : 'text-destructive'}`}
            >
              {netDebt >= 0 ? '+' : ''}{formatAmount(netDebt)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {debts.filter((d) => d.remaining > 0 && d.dueDate).map((d) => {
        const daysLeft = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        if (daysLeft > 7) return null
        return (
          <Alert key={d.id} variant={daysLeft <= 0 ? 'destructive' : 'default'} className="mb-6">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle className="text-sm">{d.person}</AlertTitle>
            <AlertDescription className="text-xs">
              {daysLeft <= 0 ? `Vadesi gecti! ${Math.abs(daysLeft)} gun once.` : `${daysLeft} gun kaldi.`}
              {' '}{d.remaining.toLocaleString('tr-TR')} TL
            </AlertDescription>
          </Alert>
        )
      })}

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Hesaplar</h3>
          {accounts.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRightIcon data-icon="inline-start" />
              Transfer
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <Card key={acc.id} size="sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardDescription className="flex items-center gap-1.5">
                      <WalletIcon className="size-3.5" />
                      {acc.name}
                    </CardDescription>
                    <CardTitle className={`text-2xl font-bold ${(acc.balance || 0) < 0 ? 'text-destructive' : 'text-blue-600'}`}>
                      {(acc.balance || 0).toLocaleString('tr-TR')} TL
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditingAcc({ id: acc.id, name: acc.name, type: acc.type })}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => { if (window.confirm(`"${acc.name}" silinsin mi?`)) { deleteAccount(acc.id); toast.success('Hesap silindi') } }}>
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">
                  {acc.type === 'nakit' ? 'Nakit' : acc.type === 'kredi' ? 'Kredi Karti' : 'Banka'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Hesap Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <Field>
                  <FieldLabel>Hesap adi</FieldLabel>
                  <Input placeholder="Nakit Cuzdan" value={newAccName} onChange={(e) => setNewAccName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Tur</FieldLabel>
                  <Select items={typeItems} value={newAccType} onValueChange={(v) => setNewAccType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {typeItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Baslangic bakiyesi</FieldLabel>
                  <Input type="number" min="0" placeholder="0" value={newAccBalance} onChange={(e) => setNewAccBalance(e.target.value)} />
                </Field>
                <div className="self-end">
                  <Button onClick={async () => { if (!newAccName.trim()) return; await addAccount({ name: newAccName.trim(), type: newAccType, balance: Number(newAccBalance) || 0 }); setNewAccName(''); setNewAccBalance(''); toast.success('Hesap eklendi') }} disabled={!newAccName.trim()}>
                    <PlusIcon data-icon="inline-start" />
                    Ekle
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Borclar / Alacaklar</h3>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Borc/Alacak Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <Field>
                  <FieldLabel>Kisi</FieldLabel>
                  <Input placeholder="Ahmet" value={debtPerson} onChange={(e) => setDebtPerson(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Tur</FieldLabel>
                  <Select items={[{ label: 'Alacak (bana borclu)', value: 'alacak' }, { label: 'Borc (ben borcluyum)', value: 'borc' }]} value={debtType} onValueChange={(v) => setDebtType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="alacak">Alacak (bana borclu)</SelectItem>
                        <SelectItem value="borc">Borc (ben borcluyum)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Tutar</FieldLabel>
                  <Input type="number" min="0" placeholder="200" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} />
                </Field>
                <div className="self-end">
                  <Button onClick={async () => { if (!debtPerson.trim() || !debtAmount) return; await addDebt({ person: debtPerson.trim(), type: debtType, amount: Number(debtAmount), description: debtDesc.trim() || `${debtPerson.trim()} - ${debtType === 'alacak' ? 'Alacak' : 'Borc'}` }); setDebtPerson(''); setDebtAmount(''); setDebtDesc(''); toast.success('Kaydedildi') }} disabled={!debtPerson.trim() || !debtAmount}>
                    <PlusIcon data-icon="inline-start" />
                    Ekle
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {debts.length > 0 && (
          <div className="space-y-3">
            {debts.map((d) => {
              const isOwed = d.type === 'alacak'
              const pct = d.amount > 0 ? Math.round(((d.amount - d.remaining) / d.amount) * 100) : 0
              return (
                <div key={d.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{d.person}</p>
                      <p className="text-muted-foreground text-xs">{isOwed ? 'Alacak' : 'Borc'} &middot; %{pct} odendi</p>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => { if (window.confirm(`"${d.person}" silinsin mi?`)) { deleteDebt(d.id); toast.success('Silindi') } }}>
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full transition-all ${isOwed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className={`font-medium tabular-nums ${isOwed ? 'text-green-600' : 'text-destructive'}`}>
                      {isOwed ? '+' : '-'}{d.remaining?.toLocaleString('tr-TR')} TL
                    </span>
                    <span className="text-muted-foreground tabular-nums">/ {d.amount?.toLocaleString('tr-TR')} TL</span>
                  </div>
                  {d.remaining > 0 ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" min="0" placeholder="Odeme" className="h-8 w-28" value={debtPayment[d.id] || ''}
                        onChange={(e) => setDebtPayment((prev) => ({ ...prev, [d.id]: e.target.value }))} />
                      <Button size="sm" variant="outline" onClick={async () => { const amt = Number(debtPayment[d.id]); if (!amt || amt <= 0) return; await recordPayment(d.id, amt); setDebtPayment((prev) => ({ ...prev, [d.id]: '' })); toast.success('Odeme kaydedildi') }}
                        disabled={!debtPayment[d.id] || Number(debtPayment[d.id]) <= 0}>Odeme Yap</Button>
                    </div>
                  ) : <Badge variant="outline" className="text-green-600">Odendi</Badge>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={showTransfer} onOpenChange={(o) => { if (!o) setShowTransfer(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap Transferi</DialogTitle>
            <DialogDescription>Bir hesaptan digerine para aktar.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Kaynak</FieldLabel>
              <Select items={accounts.map((a) => ({ label: `${a.name} (${(a.balance || 0).toLocaleString('tr-TR')} TL)`, value: a.id }))} value={transferFrom} onValueChange={(v) => setTransferFrom(v)}>
                <SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({(a.balance || 0).toLocaleString('tr-TR')} TL)</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Hedef</FieldLabel>
              <Select items={accounts.filter((a) => a.id !== transferFrom).map((a) => ({ label: a.name, value: a.id }))} value={transferTo} onValueChange={(v) => setTransferTo(v)}>
                <SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.filter((a) => a.id !== transferFrom).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Tutar</FieldLabel>
              <Input type="number" min="0" placeholder="0" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransfer(false)}>Iptal</Button>
            <Button onClick={async () => { if (!transferFrom || !transferTo || !transferAmount) return; await transferBetweenAccounts(transferFrom, transferTo, Number(transferAmount)); setShowTransfer(false); setTransferFrom(''); setTransferTo(''); setTransferAmount(''); toast.success('Transfer tamamlandi') }}
              disabled={!transferFrom || !transferTo || !transferAmount}>
              <ArrowLeftRightIcon data-icon="inline-start" />
              Transfer Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAcc} onOpenChange={(o) => { if (!o) setEditingAcc(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesabi Duzenle</DialogTitle>
          </DialogHeader>
          {editingAcc && (
            <FieldGroup>
              <Field>
                <FieldLabel>Hesap adi</FieldLabel>
                <Input value={editingAcc.name} onChange={(e) => setEditingAcc((p) => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field>
                <FieldLabel>Tur</FieldLabel>
                <Select items={typeItems} value={editingAcc.type} onValueChange={(v) => setEditingAcc((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {typeItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAcc(null)}>Iptal</Button>
            <Button onClick={async () => { if (!editingAcc) return; await updateAccount(editingAcc.id, { name: editingAcc.name, type: editingAcc.type }); setEditingAcc(null); toast.success('Guncellendi') }}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
