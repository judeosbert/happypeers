import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { UserResponse } from "@/models/user";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

initAuth();

export default async function getUser(
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
    const ud = await getUserDetails(user);
    return res.status(200).json(ud);
  } catch (e) {
    console.log("getUser", e);
    return res.status(400).json({ error: "invalid id token" });
  }
}

async function getUserDetails(authUser: AuthUser) {
  let userResponse = await AxiosClient.post<any, AxiosResponse<UserResponse>>(
    "/get/Users",
    {
      filters: [
        {
          column: "uid",
          filters: {
            text_equals: authUser.id ?? "",
          },
        },
      ],
    }
  );
  console.log("User Response", userResponse);
  if (!userResponse) {
    throw Error("Unable to get user information");
  }
  return userResponse.data;
}
