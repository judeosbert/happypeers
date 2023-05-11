export default interface Feedback{
    id:string,
    sender:string,
    recipient:string,
    status:string,
    created_at:string
    feedback:string
}

export interface FeedbackResponse {
    feedback:Feedback[] 
}