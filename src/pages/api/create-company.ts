import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";


export interface CreateCompanyReq{
    name:string,
    employees:string[]
}

initAuth()

export default async function createCompanyEp(req:NextApiRequest,res:NextApiResponse){
    if (req.method !== "POST") {
        return res.status(400).json({ error: "invalid req method" });
      }
      const token = req.headers.authorization;
      if (!token) {
        return res.status(400).json({ error: "missing token" });
      }
      try {
        const user = await verifyIdToken(token);
        const ud = await createCompany(user,req.body)
        return res.status(200).json(ud)
      }catch(e){
        console.log("getUser",e)
        return res.status(400).json({error:e})
      }

}

async function createCompany(authUser:AuthUser,req:CreateCompanyReq){
    const domain = authUser.email?.split("@")[1]
    if (req.name.length == 0) {
        throw Error("Add a company name")
    }
    if (req.employees.length == 0) {
        throw Error("Add some employees")
    }
    const d = new Date()
    const expiryDate = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate())

    async function addUsers() {
        await AxiosClient.post("/append/Users", JSON.stringify({
            row: {
                name: authUser.displayName,
                uid:authUser.id,
                company: domain,
                email: authUser.email,
                created_at: Date(),
                balance: 2,
                activated: true
            }

        }));
        for(let i = 0; i < req.employees.length;i++){
            const e = req.employees[i]
            if (e.length !== 0) {
                await AxiosClient.post("/append/Users", JSON.stringify({
                    row: {
                        name: "",
                        company: domain,
                        email: e,
                        created_at: Date(),
                        balance: 2,
                        activated: false
                    }

                }));
            }
        };

    }
    
    await AxiosClient.post("/append/company", JSON.stringify({
        row: {
            name: req.name,
            email_domain: domain,
            admin: authUser.email,
            created_at: Date(),
            plan: "supreme",
            expires_on: expiryDate,
            activated: true
        }
    }))
    addUsers()
}