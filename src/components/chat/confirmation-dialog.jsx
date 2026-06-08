import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty
} from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RepeatIcon } from 'lucide-react'
import { DEFAULT_CATEGORIES } from '@/lib/constants'
import { useSettingsStore } from '@/stores/settings-store'
import { useAccountsStore } from '@/stores/accounts-store'
import { WalletIcon } from 'lucide-react'

const items = [
  { label: 'Gider', value: 'gider' },
  { label: 'Gelir', value: 'gelir' }
]

const intervalItems = [
  { label: 'Her ay', value: 'monthly' },
  { label: 'Her hafta', value: 'weekly' },
  { label: 'Her yıl', value: 'yearly' }
]

export default function ConfirmationDialog({
  data,
  open,
  onConfirm,
  onCancel,
  onEdit
}) {
  const [editData, setEditData] = useState(data)
  const customCategories = useSettingsStore((s) => s.categories)
  const accounts = useAccountsStore((s) => s.accounts)

  useEffect(() => {
    if (data) setEditData(data)
  }, [data])

  if (!editData) return null

  const defaultCats =
    editData.type === 'gelir'
      ? DEFAULT_CATEGORIES.income
      : DEFAULT_CATEGORIES.expense
  const extraCats = (
    customCategories?.[editData.type === 'gelir' ? 'income' : 'expense'] || []
  ).map((c) => ({ label: c.label, value: c.label }))
  const catItems = [
    ...defaultCats.map((c) => ({ label: c.label, value: c.label })),
    ...extraCats
  ]

  const isExpense = editData.type === 'gider'
  const isRecurring = editData.recurring === true

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel?.()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={isExpense ? 'secondary' : 'default'}>
              {isExpense ? 'Gider' : 'Gelir'}
            </Badge>
            {editData.amount?.toLocaleString('tr-TR')} TL
            {isRecurring && (
              <RepeatIcon className="size-4 text-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            AI harcamanı aşağıdaki gibi algıladı. Onaylıyor musun?
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-type">Tür</FieldLabel>
            <Select
              items={items}
              value={editData.type}
              onValueChange={(v) => {
                setEditData((prev) => ({
                  ...prev,
                  type: v,
                  category:
                    v === 'gelir'
                      ? DEFAULT_CATEGORIES.income[0].label
                      : DEFAULT_CATEGORIES.expense[0].label
                }))
                onEdit?.({ ...editData, type: v })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
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
            <Input
              id="edit-amount"
              type="number"
              min="0"
              value={editData.amount}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value)
                }))
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-category">Kategori</FieldLabel>
            <Combobox
              items={catItems}
              value={editData.category}
              onValueChange={(v) =>
                setEditData((prev) => ({ ...prev, category: v }))
              }
            >
              <ComboboxInput placeholder="Kategori seç veya ara..." />
              <ComboboxContent>
                <ComboboxList>
                  {catItems.map((item) => (
                    <ComboboxItem key={item.value} value={item.value}>
                      {item.label}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>Kategori bulunamadı</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-title">Başlık</FieldLabel>
            <Input
              id="edit-title"
              value={editData.title}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </Field>

          {accounts.length > 0 && (
            <Field>
              <FieldLabel htmlFor="edit-account">
                <WalletIcon className="size-3.5" />
                Hesap
              </FieldLabel>
              <Select
                items={[
                  { label: 'Hesapsız', value: '' },
                  ...accounts.map((a) => ({
                    label: `${a.name} (${a.type})`,
                    value: a.id
                  }))
                ]}
                value={editData.accountId || ''}
                onValueChange={(v) =>
                  setEditData((prev) => ({
                    ...prev,
                    accountId: v || null
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hesap seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">Hesapsız</SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="recurring-toggle"
              checked={isRecurring}
              onCheckedChange={(checked) => {
                setEditData((prev) => ({
                  ...prev,
                  recurring: checked,
                  recurringInterval: checked ? 'monthly' : null,
                  recurringDay: checked ? 1 : null
                }))
              }}
            />
            <Label htmlFor="recurring-toggle" className="flex items-center gap-1.5 text-sm">
              <RepeatIcon className="size-3.5" />
              Tekrarlayan işlem
            </Label>
          </div>

          {isRecurring && (
            <div className="flex gap-3">
              <div className="flex-1">
                <FieldLabel>Tekrarlama</FieldLabel>
                <Select
                  items={intervalItems}
                  value={editData.recurringInterval || 'monthly'}
                  onValueChange={(v) =>
                    setEditData((prev) => ({ ...prev, recurringInterval: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {intervalItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <FieldLabel>
                  {editData.recurringInterval === 'weekly' ? 'Gün' : 'Gün'}
                </FieldLabel>
                <Input
                  type="number"
                  min={editData.recurringInterval === 'weekly' ? 0 : 1}
                  max={editData.recurringInterval === 'weekly' ? 6 : 31}
                  value={editData.recurringDay || 1}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      recurringDay: Number(e.target.value)
                    }))
                  }
                />
              </div>
            </div>
          )}
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button onClick={() => onConfirm(editData)}>Onayla</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
