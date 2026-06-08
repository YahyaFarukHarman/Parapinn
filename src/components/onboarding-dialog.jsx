import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SparklesIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings-store'
import { ROUTES, APP_NAME } from '@/lib/constants'

export default function OnboardingDialog() {
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const setUsername = useSettingsStore((s) => s.setUsername)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!name.trim()) return
    await setUsername(name.trim())
    navigate(ROUTES.chat)
  }

  if (step === 0) {
    return (
      <Dialog open>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-3xl">
              <SparklesIcon className="size-7" />
            </div>
            <DialogTitle className="text-xl">{APP_NAME}</DialogTitle>
            <DialogDescription>
              Bütçe yönetimini sohbet ederek yapmanın en kolay yolu.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setStep(1)}>Başlayalım</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adın nedir?</DialogTitle>
          <DialogDescription>Sana nasıl hitap edelim?</DialogDescription>
        </DialogHeader>
        <FieldGroup onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="name">İsmin</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="name"
                placeholder="Örn: Ahmet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </InputGroup>
          </Field>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Başla
          </Button>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}
