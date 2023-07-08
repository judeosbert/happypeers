import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import User from "@/models/user";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "next-firebase-auth";

export interface ActivateEmployeeReq {
  employee: User;
}

initAuth();

export default async function activateEmployeeEp(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "invalid req method" });
  }
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ error: "missing token" });
  }
  try {
    await verifyIdToken(token);
  } catch (e) {
    return res.status(401).json({ error: "token expired" });
  }
  try {
    await activateEmployee(req.body);
    return res.status(200).json({ status: "Success" });
  } catch (e) {
    console.log("remove user", e);
    return res.status(400).json({ error: e });
  }
}

async function activateEmployee(req: ActivateEmployeeReq) {
  let res = await AxiosClient.put<any, AxiosResponse<any>>(
    "https://api.onsheets.io/v1/update/Users",{
      "keys": {
        "email": req.employee.email,
      },
      "data":{
        "activated":true
      }
    }
  );
  console.log("Activate",res)
  if (!res || res.status != 200) {
    throw Error("Error Activating the user");
  }
}
