import ProtectedRoute from "@/components/ProtectedRoute";
import { MenuOutlined } from "@ant-design/icons";
import { useEffect, useReducer, useState } from "react";
import { AxiosClient, SelfAxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { auth } from "firebase-admin";
import Company from "@/models/company";
import { AxiosResponse } from "axios";
import { useRouter } from "next/router";

initAuth()

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    authPageURL: "/"
})(Setup)

function Setup() {
    const router = useRouter()
    const authUser = useAuthUser()
    const companyDomain = authUser.email?.split("@")[1]
    const [companyName, setCompanyName] = useState("")
    const [employees, setEmployees] = useState("")
    const [company, setCompany] = useState<Company>()
    useEffect(() => {
        SelfAxiosClient.get<any, AxiosResponse<Company>>("/get-company").then((c) => {
            console.log(c)
            setCompany(c.data)
            setCompanyName(c.data.name)
        }).catch((e) => {
            console.log(e)
        })
    }, [])

    function createCompany() {
        SelfAxiosClient.post("/create-company", {
            name: companyName,
            employees: employees.split("\n")
        }).then((res) => {
            router.push("/dashboard")
        })

    }

    function updateCompany() {
        SelfAxiosClient.post("/add-employees", {
            name: company?.name,
            employees: employees.split("\n")
        }).then((res) => {
            alert("Added Succesfully")
        }).catch((e) => {
            alert(e)
        })
    }
    return (
        <>
            <ProtectedRoute>
                <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-poppins">
                    <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>

                        <p className='font-bold  text-2xl'>happypeers.work</p>
                        <button onClick={authUser.signOut} className='border-2 border-gray-200 p-2 rounded-lg'>Logout</button>
                    </nav>
                    <section className="p-5">
                        <div className="min-w-full flex flex-col gap-3">
                            <p>Setup your company</p>
                            <div>
                                <p className="">Company Name </p>
                                <input onChange={(e) => {
                                    if (company) {
                                        alert("Contact support to update company name")
                                        return
                                    }
                                    setCompanyName(e.target.value)
                                }} className="border min-w-full py-2 px-5 bg-white rounded-lg" value={companyName}></input>


                            </div>
                            <div>
                                <p className="">Your Email <span className="text-sm text-gray-500">(From the account you logged in with)</span></p>
                                <input disabled readOnly className="border min-w-full py-2 px-5 bg-white rounded-lg" value={authUser.email ?? "undefined"}></input>
                            </div>
                            <div>
                                <p className="">Employee Emails<span className="text-sm text-gray-500">(Use to add new Employees)</span></p>
                                <textarea onChange={(e) => {
                                    setEmployees(e.target.value)
                                }} className="border min-w-full py-2 px-5 bg-white rounded-lg" placeholder="Add one email per line">
                                    {
                                        employees
                                    }
                                </textarea>
                            </div>
                            <div>
                                <p className="">Plan <span className="text-sm text-gray-500">(free during beta)</span></p>
                                <input disabled readOnly className="border min-w-full py-2 px-5 bg-white rounded-lg" value={"SUPREME"}></input>
                            </div>

                            <button onClick={company ? updateCompany : createCompany} className="bg-pbutton-500 text-white rounded-lg py-3">{company ? "Add New Employees" : "Create Company Profile"}</button>
                        </div>

                    </section>
                </main>
            </ProtectedRoute>

        </>
    )
}