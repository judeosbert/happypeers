import { initAuth } from '@/initAuth'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { clarity } from 'clarity-js'
import { useEffect } from 'react'

initAuth()



export default function App({ Component, pageProps }: AppProps) {
  useEffect(()=>{
    let config = {
      projectId:"hwzlun3yd8"
    }
    clarity.start(config)
  },[])
  return <Component {...pageProps} />
}

