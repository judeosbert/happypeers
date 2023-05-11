import { logggedInUser } from "@/pages"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function ProtectedRoute(props:any){
    const router = useRouter()
    useEffect(()=>{

            if(!logggedInUser){
                router.push("/")
            }
    },[])
    return (
        <>
        {props.children}
        </>
    )
    
}