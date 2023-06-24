import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { UserResponse } from "@/models/user";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

initAuth();
export default async function getCompanyPeers(
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
    console.log("token-feedback", token);
    const userRes = await getPeers(user);
    return res.status(200).json(userRes);
  } catch (e) {
    return res.status(400).json({ error: "invalid token" });
  }
}

async function getPeers(authUser: AuthUser) {
  try {
    const res = await AxiosClient.post<any, AxiosResponse<UserResponse>>(
      "get/Users",
      JSON.stringify({
        filters: [
          {
            column: "company",
            filters: {
              text_equals: authUser.email?.split("@")[1],
            },
          },
          {
            column: "activated",
            filters: {
              text_equals: "TRUE",
            },
          },
          {
            column: "uid",
            filters: {
              text_not_contains: authUser.id,
            },
          },
        ],
      })
    );
    return res.data;
  } catch (e) {
    throw Error("could not get peers");
  }
}
