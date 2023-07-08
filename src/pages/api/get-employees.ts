import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { UserResponse } from "@/models/user";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

export interface UpdateCompanyReq {
  name: string;
  employees: string[];
}

initAuth();

export default async function getEmployeesEp(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "invalid req method" });
  }
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ error: "missing token" });
  }
  let user;
  try {
    user = await verifyIdToken(token);
  } catch (e) {
    return res.status(401).json({ error: "token expired" });
  }
  try {
    const ud = await getEmployees(user);
    return res.status(200).json(ud);
  } catch (e) {
    console.log("getUser", e);
    return res.status(400).json({ error: e });
  }
}

async function getEmployees(authUser: AuthUser) {
  const domain = authUser.email?.split("@")[1];
  
  let res = await AxiosClient.post<any, AxiosResponse<UserResponse>>(
    "https://api.onsheets.io/v1/get/Users",
    JSON.stringify({
      filters: [{
        "column":"company",
        filters:{
          "text_equals":domain
        }
      }],
    })
  )
  if (!res || !res.data || !res.data.Users) {
    throw Error("User Listing response error");
  }
  return res.data.Users
}
