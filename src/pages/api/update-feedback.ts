import { initAuth } from "@/initAuth";
import Feedback from "@/models/feedback";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "next-firebase-auth";
import { AxiosClient } from "@/configs/axios";

initAuth();

interface UpdateFeedbackStatusReq {
  feedback: Feedback;
}

export default async function updateFeedback(
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
  let user;
  try {
    user = await verifyIdToken(token);
  } catch (e) {
    return res.status(401).json({ error: "token expired" });
  }
  try {
    const body: UpdateFeedbackStatusReq = req.body;
    if (body.feedback.recipient != user.id) {
      return res.status(400).json({ error: "invalid request" });
    }
    const fres = await updateFeedbackStatus(body.feedback);
    return res.status(200).json(fres);
  } catch (e) {
    console.log("getFeedback", e);
    return res.status(400).json({ error: "invalid id token" });
  }
}

async function updateFeedbackStatus(feedback: Feedback) {
  const res = await AxiosClient.put(
    "/update/feedback",
    JSON.stringify({
      keys: {
        id: feedback.id,
      },
      data: {
        status: feedback.status,
      },
    })
  );
  if (feedback.status != "constructive") {
    return;
  }
  await returnPoint(feedback);
}

async function returnPoint(feedback: Feedback) {
  await AxiosClient.put(
    "/update/Users/factor",
    JSON.stringify({
      keys: {
        uid: feedback.sender,
      },
      factor: {
        balance: 1,
      },
    })
  );
}
