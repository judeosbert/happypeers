import { initAuth } from '@/initAuth'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

initAuth()



export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

