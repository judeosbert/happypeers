import { initAuth } from "@/initAuth";
import aposToLexForm from "apos-to-lex-form";
import natural from "natural";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "next-firebase-auth";
import * as SpellingCorrector from "spelling-corrector";
import { removeStopwords } from 'stopword';



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
    const score = analyseFeedback(req.body.feedback)
    let analysis = ""
    if(score>0){
        analysis = "Constructive feedback"
    } else if(score <0) {
        analysis = "Non Constructive feedback. Mention ways how they can improve themselves."
    } else {
        analysis = "Mention ways in which they can improve themselves."
    }

    return res.status(200).json({
        analysis:analysis,
        score:score
    })

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