import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { PublicDomains } from "./public_email_domains";

export interface AddEmailLeadReq {
  email:string
}

initAuth();

export default async function addEmailLead(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "invalid req method" });
  }
  try {
    await addLead(req.body); 
    return res.status(200).json({status:"Success"});
  } catch (e:any) {
    console.log("getUser", e);
    return res.status(400).json({ error: e.message });
  }
}

async function addLead(req: AddEmailLeadReq) {
  await AxiosClient.post(
    "/append/email_lead",
    {
      row: {
        "email": req.email,
      },
    }
  );
}
