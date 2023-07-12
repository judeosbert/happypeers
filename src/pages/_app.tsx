import { initAuth } from '@/initAuth'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'

initAuth()



export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-XF3MP6YJVT" />
    <Script id="google-analytics">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XF3MP6YJVT');
`}
    </Script>
    <Component {...pageProps} /></>
}

