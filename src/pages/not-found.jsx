import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FileXIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileXIcon className="size-8" />
          </EmptyMedia>
          <EmptyTitle>Sayfa bulunamadı</EmptyTitle>
          <EmptyDescription>Aradığın sayfa mevcut değil.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate(ROUTES.chat)}>Ana Sayfaya Dön</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
