export default interface Company{
    id:string,
    name:string,
    email_domain:string,
    admin:string,
    created_at:string,
    plan:string,
    expires_on:string
    activated:string
}
export interface CompanyResponse{
    company:Company[]
}