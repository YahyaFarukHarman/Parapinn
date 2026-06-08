const config = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/lib/(.*)$',
    '^@/hooks/(.*)$',
    '^@/contexts/(.*)$',
    '',
    '^@/components/ui/(.*)$',
    '^@/components/(.*)$',
    '',
    '^@/data/(.*)$',
    '',
    '^[./]'
  ],
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ]
}

export default config
