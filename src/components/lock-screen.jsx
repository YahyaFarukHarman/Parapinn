import { useState } from 'react'
import { LockIcon, SparklesIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { APP_NAME } from '@/lib/constants'
import { useSettingsStore } from '@/stores/settings-store'

export default function LockScreen() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const unlock = useSettingsStore((s) => s.unlock)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      await unlock(password.trim())
    } catch {
      setError('Hatali sifre')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl">
            <SparklesIcon className="size-8" />
          </div>
          <h1 className="font-heading text-xl font-semibold">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Uygulamaya erismek icin sifreni gir
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lock-password">Sifre</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="lock-password"
                  type="password"
                  placeholder="Sifreni gir"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </InputGroup>
            </Field>
          </FieldGroup>

          {error && (
            <Alert variant="destructive" className="mb-4 mt-4">
              <LockIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="mt-6 w-full" disabled={loading || !password.trim()}>
            {loading ? 'Aciliyor...' : 'Kilidi Ac'}
          </Button>
        </form>
      </div>
    </div>
  )
}
