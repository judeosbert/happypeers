import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";


export interface UpdateCompanyReq{
    name:string,
    employees:string[]
}

initAuth()

export default async function addEmployeesEp(req:NextApiRequest,res:NextApiResponse){
    if (req.method !== "POST") {
        return res.status(400).json({ error: "invalid req method" });
      }
      const token = req.headers.authorization;
      if (!token) {
        return res.status(400).json({ error: "missing token" });
      }
      try {
        const user = await verifyIdToken(token);
        const ud = await addEmployees(user,req.body)
        return res.status(200).json(ud)
      }catch(e){
        console.log("getUser",e)
        return res.status(400).json({error:e})
      }

}

async function addEmployees(authUser:AuthUser,req:UpdateCompanyReq){
    const domain = authUser.email?.split("@")[1]
    if (req.name.length == 0) {
        throw Error("Add a company name")
    }
    if (req.employees.length == 0) {
        throw Error("Add some employees")
    }
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