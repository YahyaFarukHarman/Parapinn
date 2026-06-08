import { useState, useRef, useEffect } from 'react'
import { SendHorizonalIcon } from 'lucide-react'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useChatStore } from '@/stores/chat-store'

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const isProcessing = useChatStore((s) => s.isProcessing)
  const sendMessage = useChatStore((s) => s.sendMessage)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isProcessing) return
    setInput('')

    await sendMessage(text)
    onSend?.(text)
  }

  return (
    <div className="flex gap-2">
      <InputGroup className="flex-1">
        <InputGroupInput
          ref={inputRef}
          placeholder="Harcamanı yaz... (örn: Bim'den 850 TL alışveriş)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isProcessing}
        />
      </InputGroup>
      <Button onClick={handleSend} disabled={!input.trim() || isProcessing} size="icon">
        {isProcessing ? <Spinner /> : <SendHorizonalIcon />}
      </Button>
    </div>
  )
}
