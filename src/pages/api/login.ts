import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { setAuthCookies } from "next-firebase-auth";

initAuth()

export default async function Login(req:NextApiRequest,res:NextApiResponse){
    try{
        await setAuthCookies(req,res) 
    } catch(e:any){
        return res.status(200).json({ error: 'Unexpected error.' })
    }
    return res.status(200).json({ success: true })
}