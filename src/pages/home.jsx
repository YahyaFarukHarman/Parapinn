import { useNavigate } from 'react-router-dom'
import { SparklesIcon, MessageSquareTextIcon, ShieldCheckIcon, WifiOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES, APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

const features = [
  {
    icon: MessageSquareTextIcon,
    title: 'Sohbetle Harcama Takibi',
    description: '"Bim\'den 850 TL alışveriş yaptım" yaz, gerisini AI halletsin.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Yerel ve Güvenli',
    description: 'Tüm verilerin cihazında kalır, sunucuya gönderilmez.'
  },
  {
    icon: WifiOffIcon,
    title: 'Çevrimdışı Çalışma',
    description: 'İnternet olmasa bile uygulama kesintisiz çalışır.'
  }
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-10 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-3xl">
          <SparklesIcon className="size-7" />
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground max-w-md text-base">{APP_DESCRIPTION}</p>
      </div>

      <div className="flex gap-3">
        <Button size="lg" onClick={() => navigate(ROUTES.chat)}>
          <MessageSquareTextIcon data-icon="inline-start" />
          Başla
        </Button>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} size="sm" className="min-w-0">
            <CardHeader>
              <CardTitle>
                <feature.icon className="text-primary -ml-0.5 inline size-4 align-text-bottom" />
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
