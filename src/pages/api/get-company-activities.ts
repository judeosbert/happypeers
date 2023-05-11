import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { ActivityResponse } from "@/models/activity";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

initAuth()

export default async function getCompanyActivities(req:NextApiRequest,res:NextApiResponse){
    if (req.method !== "GET") {
        return res.status(400).json({ error: "invalid req method" });
      }
      const token = req.headers.authorization;
      if (!token) {
        return res.status(400).json({ error: "missing token" });
      }
      try {
        const user = await verifyIdToken(token);
        const ud = await getActivities(user)
        return res.status(200).json(ud)
      }catch(e){
        console.log("getUser",e)
        return res.status(400).json({error:e})
      }
}

async function getActivities(user:AuthUser){
    const res = await AxiosClient.post<any, AxiosResponse<ActivityResponse>>("/get/activity", JSON.stringify({
        filters: [{
            column: "company",
            filters: {
                "text_equals": user.email?.split("@")[1]
            }
        }]
    }))
    if (!res || !res.data) {
        throw Error("Invalid activity response")
        return
    }
    const a = res.data.activity
    return {
        activity:a
    }
}