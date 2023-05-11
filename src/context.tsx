import { createContext, useContext, useState } from "react";
import User from "./models/user"

interface AppData{
    user:User
    setUser:(user:User)=>void
}
const emptyUser:User = {
    id: "",
    company: "",
    uid: "",
    email: "",
    created_at: "",
    balance: "",
    activated: "",
    name: ""
}
const emptyAppData:AppData = {
    user: emptyUser,
    setUser: function (user: User): void {
        
    }
}
const AppDataContext = createContext<AppData>(emptyAppData)

export function useAppDataContext(){
    return useContext(AppDataContext)
}

export function AppDataContextProvider(props:any){
    const [appData,setAppData] = useState<AppData>(emptyAppData)
    return (
        <>
        <AppDataContext.Provider value={appData}>
            {props.children}
        </AppDataContext.Provider>
        </>
    )
}
