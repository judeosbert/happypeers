import { AxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthUser, verifyIdToken } from "next-firebase-auth";
import aposToLexForm from "apos-to-lex-form";
import natural from "natural"
import * as SpellingCorrector from "spelling-corrector";
import {removeStopwords} from 'stopword';

export interface FeedbackReq {
    sender: string,
    recipient: string
    recipientName: string
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
    let user;
    try {
        user = await verifyIdToken(token);
    } catch (e) {
        return res.status(401).json({ error: "token expired" });
    }
    const analysis = analyseFeedback(req.body.feedback)
    if (analysis < 0) {
        return res.status(400).json({ error: "This feedback is not constructive. Be constructive so that they can improve." })
    }
    try {  
        const fres = await appendFeedback(user, req);
        const company = user.email?.split("@")[1] ?? "undefined"
        await addActivity(req.body.recipientName, company)
        await deductBalance(user.id ?? "undefined")
        return res.status(200).json({ status: "okay" });
    } catch (e) {
        return res.status(400).json({ error: "invalid token" });
    }

}

function analyseFeedback(review: string): number {
    const lexedReview = aposToLexForm(review);
    const casedReview = lexedReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
    if (!tokenizedReview) {
        return 0;
    }
    let spellCorrector = new SpellingCorrector()
    tokenizedReview.forEach((word, index) => {
        tokenizedReview[index] = spellCorrector.correct(word);
    })

    const filteredReview = removeStopwords(tokenizedReview);

    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filteredReview);
    return analysis
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

    } catch (e) {
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