import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";
import { PublicDomains } from "./public_email_domains";



initAuth()
export default async function checkPublicEmails(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== "GET") {
        res.status(400).send({ message: "invalid method" })
        return
    }
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ error: "missing token" });
    }
    let user:AuthUser;
    try {
        user = await verifyIdToken(token);
    } catch (e) {
        return res.status(401).json({ error: "token expired" });
    }
    
    let domain = user.email?.split("@")[1]??""
    if(PublicDomains.has(domain)){
        return res.status(220).json({error:"Please use your work email to sign up."})
    }
    return res.status(200).json({status:"success"})
}