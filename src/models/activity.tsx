export default interface Activity {
    id:string,
    activity:string,
    created_at:string,
    company:string
}

export interface ActivityResponse {
    activity:Activity[]
}