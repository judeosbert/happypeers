import { AxiosClient } from "@/configs/axios";
import { FeedbackResponse } from "@/models/feedback";
import { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";

export default async function getFeedback(
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
    console.log("token-feedback",token)
    const fres = await getFeedbacks(user);
    return res.status(200).json(fres);
  } catch (e) {
    console.log("getFeedback",e)
    return res.status(400).json({ error: "invalid id token" });
  }
}

async function getFeedbacks(user: AuthUser) {
  const res = await AxiosClient.post<any, AxiosResponse<FeedbackResponse>>(
    "/get/feedback",
    JSON.stringify({
      filters: [
        {
          column: "recipient",
          filters: {
            text_equals: user.id,
          },
        },
      ],
    })
  );
  if (!res) {
    throw Error("Unable to load feedback");
  }
  return res.data;
}
