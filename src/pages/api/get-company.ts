import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { CompanyResponse } from "@/models/company";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

initAuth();
export default async function getCompany(
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
    const ud = await getDetails(user);
    return res.status(200).json(ud);
  } catch (e) {
    console.log("getUser", e);
    return res.status(400).json({ error: e });
  }
}

async function getDetails(user: AuthUser) {
  const company = user.email?.split("@")[1];
  try {
    const res = await AxiosClient.post<any, AxiosResponse<CompanyResponse>>(
      "/get/company",
      JSON.stringify({
        filters: [
          {
            column: "email_domain",
            filters: {
              text_equals: company,
            },
          },
        ],
      })
    );
    if (!res || !res.data || !res.data.company) {
      throw Error("Company response error");
    }
    console.log(res.data);
    const c = res.data.company[0];
    console.log("company", c);
    return c;
  } catch (e) {
    throw e;
  }
}
