export default interface User{
    id:string,
    company:string,
    uid:string,
    email:string,
    created_at:string,
    balance:string,
    activated:string
    name:string
}

export interface UserResponse {
    Users:User[]
}