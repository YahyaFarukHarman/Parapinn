import { useEffect, useState } from 'react'
import { useInvestmentsStore } from '@/stores/investments-store'
import {
  PencilIcon,
  PlusIcon,
  XIcon
} from 'lucide-react'
import { toast } from 'sonner'

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
import { Separator } from '@/components/ui/separator'

function formatAmount(value) {
  return value.toLocaleString('tr-TR') + ' TL'
}

const typeItems = [
  { label: 'Altin / Emtia', value: 'emtia' },
  { label: 'Hisse Senedi', value: 'hisse' },
  { label: 'Doviz', value: 'doviz' },
  { label: 'Kripto Para', value: 'kripto' }
]

export default function PortfolioPage() {
  const investments = useInvestmentsStore((s) => s.investments)
  const loadInvestments = useInvestmentsStore((s) => s.loadInvestments)
  const addInvestment = useInvestmentsStore((s) => s.addInvestment)
  const updateInvestment = useInvestmentsStore((s) => s.updateInvestment)
  const deleteInvestment = useInvestmentsStore((s) => s.deleteInvestment)

  const [invName, setInvName] = useState('')
  const [invType, setInvType] = useState('emtia')
  const [invQty, setInvQty] = useState('')
  const [invPrice, setInvPrice] = useState('')
  const [editingInv, setEditingInv] = useState(null)

  useEffect(() => {
    loadInvestments()
  }, [loadInvestments])

  const totalCost = investments.reduce((s, i) => s + (i.purchasePrice || 0) * (i.quantity || 0), 0)
  const totalValue = investments.reduce((s, i) => s + (i.currentPrice || i.purchasePrice || 0) * (i.quantity || 0), 0)
  const totalPL = totalValue - totalCost
  const totalPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  const byType = {}
  investments.forEach((i) => {
    if (!byType[i.type]) byType[i.type] = { cost: 0, value: 0 }
    byType[i.type].cost += (i.purchasePrice || 0) * (i.quantity || 0)
    byType[i.type].value += (i.currentPrice || i.purchasePrice || 0) * (i.quantity || 0)
  })

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Toplam Maliyet</CardDescription>
            <CardTitle className="text-2xl font-bold">{formatAmount(totalCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Guncel Deger</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">{formatAmount(totalValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Kar / Zarar</CardDescription>
            <CardTitle className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {totalPL >= 0 ? '+' : ''}{formatAmount(totalPL)}
              <span className="ml-1 text-sm">(%{totalPct.toFixed(1)})</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(byType).map(([type, { cost, value }]) => {
            const pl = value - cost
            const pct = cost > 0 ? (pl / cost) * 100 : 0
            const label = type === 'emtia' ? 'Altin/Emtia' : type === 'hisse' ? 'Hisse' : type === 'doviz' ? 'Doviz' : 'Kripto'
            return (
              <Card key={type} size="sm">
                <CardHeader className="pb-2">
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className={`text-lg font-bold ${pl >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {pl >= 0 ? '+' : ''}{pl.toLocaleString('tr-TR')} TL
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-xs">{formatAmount(value)}</CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Varliklar</h3>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Yatirim Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <Field>
                  <FieldLabel>Varlik adi</FieldLabel>
                  <Input placeholder="Gram Altin" value={invName} onChange={(e) => setInvName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Tur</FieldLabel>
                  <Select items={typeItems} value={invType} onValueChange={(v) => setInvType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {typeItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Miktar</FieldLabel>
                  <Input type="number" min="0" step="any" placeholder="10" value={invQty} onChange={(e) => setInvQty(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Birim fiyat</FieldLabel>
                  <Input type="number" min="0" placeholder="2500" value={invPrice} onChange={(e) => setInvPrice(e.target.value)} />
                </Field>
                <div className="self-end">
                  <Button onClick={async () => { if (!invName.trim() || !invQty || !invPrice) return; await addInvestment({ name: invName.trim(), type: invType, quantity: Number(invQty), purchasePrice: Number(invPrice), currentPrice: Number(invPrice) }); setInvName(''); setInvQty(''); setInvPrice(''); toast.success('Yatirim eklendi') }} disabled={!invName.trim() || !invQty || !invPrice}>
                    <PlusIcon data-icon="inline-start" />
                    Ekle
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {investments.length > 0 && (
          <div className="space-y-2">
            {investments.map((inv) => {
              const pl = ((inv.currentPrice || inv.purchasePrice || 0) - (inv.purchasePrice || 0)) * (inv.quantity || 0)
              const pct = inv.purchasePrice > 0 ? (((inv.currentPrice || inv.purchasePrice) - inv.purchasePrice) / inv.purchasePrice) * 100 : 0
              const typeLabel = typeItems.find((t) => t.value === inv.type)?.label || inv.type
              return (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {inv.quantity} adet &middot; {typeLabel} &middot; Alis: {inv.purchasePrice?.toLocaleString('tr-TR')} TL
                      {inv.currentPrice !== inv.purchasePrice ? ` / Guncel: ${inv.currentPrice?.toLocaleString('tr-TR')} TL` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-medium tabular-nums ${pl >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {pl >= 0 ? '+' : ''}{pl.toLocaleString('tr-TR')} TL
                      </p>
                      <p className={`text-xs tabular-nums ${pl >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        %{pct.toFixed(1)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditingInv({ id: inv.id, name: inv.name, type: inv.type, quantity: inv.quantity, purchasePrice: inv.purchasePrice, currentPrice: inv.currentPrice })}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => { if (window.confirm(`"${inv.name}" silinsin mi?`)) { deleteInvestment(inv.id); toast.success('Silindi') } }}>
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editingInv} onOpenChange={(o) => { if (!o) setEditingInv(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yatirimi Duzenle</DialogTitle>
          </DialogHeader>
          {editingInv && (
            <FieldGroup>
              <Field>
                <FieldLabel>Varlik adi</FieldLabel>
                <Input value={editingInv.name} onChange={(e) => setEditingInv((p) => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field>
                <FieldLabel>Tur</FieldLabel>
                <Select items={typeItems} value={editingInv.type} onValueChange={(v) => setEditingInv((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {typeItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <Field>
                  <FieldLabel>Miktar</FieldLabel>
                  <Input type="number" min="0" step="any" value={editingInv.quantity} onChange={(e) => setEditingInv((p) => ({ ...p, quantity: Number(e.target.value) }))} />
                </Field>
                <Field>
                  <FieldLabel>Alis fiyati</FieldLabel>
                  <Input type="number" min="0" value={editingInv.purchasePrice} onChange={(e) => setEditingInv((p) => ({ ...p, purchasePrice: Number(e.target.value) }))} />
                </Field>
                <Field>
                  <FieldLabel>Guncel fiyat</FieldLabel>
                  <Input type="number" min="0" value={editingInv.currentPrice} onChange={(e) => setEditingInv((p) => ({ ...p, currentPrice: Number(e.target.value) }))} />
                </Field>
              </Field>
            </FieldGroup>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInv(null)}>Iptal</Button>
            <Button onClick={async () => { if (!editingInv) return; await updateInvestment(editingInv.id, { name: editingInv.name, type: editingInv.type, quantity: editingInv.quantity, purchasePrice: editingInv.purchasePrice, currentPrice: editingInv.currentPrice }); setEditingInv(null); toast.success('Guncellendi') }}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
