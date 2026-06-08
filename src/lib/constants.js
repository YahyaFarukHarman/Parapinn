export const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'market', label: 'Market', icon: 'ShoppingCartIcon' },
    { id: 'food', label: 'Yeme İçme', icon: 'UtensilsIcon' },
    { id: 'transport', label: 'Ulaşım', icon: 'CarIcon' },
    { id: 'bills', label: 'Faturalar', icon: 'ReceiptIcon' },
    { id: 'health', label: 'Sağlık', icon: 'HeartPulseIcon' },
    { id: 'entertainment', label: 'Eğlence', icon: 'Gamepad2Icon' },
    { id: 'shopping', label: 'Alışveriş', icon: 'BaggageClaimIcon' },
    { id: 'education', label: 'Eğitim', icon: 'BookOpenIcon' },
    { id: 'rent', label: 'Kira', icon: 'HomeIcon' },
    { id: 'other', label: 'Diğer', icon: 'MoreHorizontalIcon' }
  ],
  income: [
    { id: 'salary', label: 'Maaş', icon: 'BanknoteIcon' },
    { id: 'freelance', label: 'Freelance', icon: 'LaptopIcon' },
    { id: 'investment', label: 'Yatırım', icon: 'TrendingUpIcon' },
    { id: 'gift', label: 'Hediye', icon: 'GiftIcon' },
    { id: 'other-income', label: 'Diğer', icon: 'MoreHorizontalIcon' }
  ]
}

export const CURRENCY = 'TL'

export const APP_NAME = 'Parapin'
export const APP_DESCRIPTION = 'Yapay Zeka Destekli Kişisel Bütçe Asistanı'

export const ROUTES = {
  home: '/',
  chat: '/chat',
  dashboard: '/dashboard',
  reports: '/reports',
  kasa: '/kasa',
  portfolio: '/portfolio',
  settings: '/settings'
}
