import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

export interface FeedbackReq {
    sender: string,
    recipient: string
    recipientName:string
    feedback: string
}

initAuth()
export default async function sendFeedback(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== "POST") {
        res.status(200).send({ message: "invalid method" })
        return
    }
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ error: "missing token" });
    }
    try {
        console.log("token-feedback", token)
        const user = await verifyIdToken(token);
        const fres = await appendFeedback(user,req);
        const company = user.email?.split("@")[1]??"undefined"
        await addActivity(req.body.recipientName,company)
        await deductBalance(user.id??"undefined")
        return res.status(200).json({status:"okay"});   
    } catch (e) {
        return res.status(400).json({ error: "invalid token" });
    }

}

async function appendFeedback(authUser: AuthUser, req: NextApiRequest) {
    const body = req.body
    console.log(body)
    try {
        const res = await AxiosClient.post("/append/feedback", {
            "row": {
                sender: authUser.id,
                recipient: body.recipient,
                feedback: body.feedback,
                created_at: Date(),
                status: "unread"
            }
        })
    
    }catch(e){
        throw e
    }
}

async function addActivity(forName: string, company: string) {
    await AxiosClient.post("/append/activity", JSON.stringify({
        row: {
            activity: "New Feedback has been added for " + forName,
            created_at: Date(),
            company: company
        }
    }))
}
async function deductBalance(uid: string) {
    await AxiosClient.put("/update/Users/factor", JSON.stringify({
        keys: {
            "uid": uid,
        },
        factor: {
            "balance": -1
        }
    }))
}