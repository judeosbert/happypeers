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
import Loader, { showError, showSuccess } from "@/components/Loader";
import { logout } from "@/configs/firebase";
import { Modal, Space, Table, Tabs } from "antd";
import { BsFillBuildingFill, BsPeople, BsPeopleFill, BsPersonAdd } from "react-icons/bs";
import User from "@/models/user";
import { debug } from "console";

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
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [loaderMessage, setLoaderMessage] = useState<string>("")
    const [existingEmployees, setExistingEmployees] = useState<User[]>([])
    const [isAddEmpOpen, setIsAddEmpOpen] = useState(false)

    useEffect(() => {
        setLoaderMessage("Getting Company Profile")
        setIsLoading(true)
        SelfAxiosClient.get<any, AxiosResponse<Company>>("/get-company").then((c) => {
            setIsLoading(false)
            console.log(c)
            setCompany(c.data)
            setCompanyName(c.data.name)
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            console.log(e)
        })
    }, [])

    useEffect(() => {
        getExistingEmployees()
    }, [])

    function getExistingEmployees() {
        setLoaderMessage("Listing Employees")
        setIsLoading(true)
        SelfAxiosClient.get<any, AxiosResponse<User[]>>("/get-employees").then((c) => {
            setIsLoading(false)
            console.log(c.data)
            setExistingEmployees(c.data)
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            showError(e.error)
        })
    }

    function createCompany() {
        setLoaderMessage("Setting up the company profile")
        setIsLoading(true)
        if (employees == "") {
            setIsLoading(false)
            showError("Add few employees to continue.")
            return
        }
        let emps = employees.split("\n")
        if (emps.length == 0) {
            setIsLoading(false)
            showError("Add few employees to continue.")

            return
        }
        SelfAxiosClient.post("/create-company", {
            name: companyName,
            employees: emps
        }).then((res) => {
            setIsLoading(false)
            router.push("/dashboard")
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            showError("Failed to setup company profile - " + e)
        })

    }

    function updateCompany() {
        setLoaderMessage("Updating company profile.")
        setIsLoading(true)
        if (employees == "") {
            showError("Add few employees to continue.")
            setIsLoading(false)
            return
        }
        let e = employees.split("\n")
        if (e.length == 0) {
            showError("Add few employees to continue.")
            setIsLoading(false)
            return
        }

        let emps = Array.from(new Set(e))
        debugger
        SelfAxiosClient.post("/add-employees", {
            name: company?.name,
            employees: emps
        }).then((res) => {
            setIsLoading(false)
            showSuccess("Added Succesfully")
            setIsAddEmpOpen(false)
            getExistingEmployees()
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            alert(e)
        })
    }

    function companyDetailsElement(): JSX.Element {
        return <>
            <div className="min-w-full flex flex-col gap-5 text-start">
                <div className="">
                    <p className="">Company Name </p>
                    <input onChange={(e) => {
                        if (company) {
                            showError("Contact support to update companyx name")
                            return
                        }
                        setCompanyName(e.target.value)
                    }} className="border min-w-full py-2 px-5 bg-white rounded-lg" value={companyName}></input>


                </div>
                <div>
                    <p className="">Your Email <span className="text-sm text-gray-500">(From the account you logged in with)</span></p>
                    <input disabled readOnly className="border min-w-full py-2 px-5 bg-white rounded-lg" value={authUser.email ?? "undefined"}></input>
                </div>

                {
                    !company ? <div>
                        <p className="">Employee Emails<span className="text-sm text-gray-500">(Use to add new Employees)</span></p>
                        <textarea onChange={(e) => {
                            setEmployees(e.target.value)
                        }} className="border min-w-full py-2 px-5 bg-white rounded-lg" placeholder="Add one email per line">
                            {
                                employees
                            }
                        </textarea>
                    </div> : <></>
                }

                <div>
                    <p className="">Plan <span className="text-sm text-gray-500">(free during beta)</span></p>
                    <input disabled readOnly className="border min-w-full py-2 px-5 bg-white rounded-lg" value={"FREE"}></input>
                </div>

                <button onClick={company ? updateCompany : createCompany} className="bg-pbutton-500 text-white rounded-lg py-3">{company ? "Add New Employees" : "Create Company Profile"}</button>
            </div>
        </>
    }

    function disableEmployee(employee: User) {
        setLoaderMessage("Deleting " + employee.email)
        setIsLoading(true)
        SelfAxiosClient.post("/remove-employee", {
            employee: employee
        }).then((res) => {
            setIsLoading(false)
            showSuccess("Deleted Succesfully")
            getExistingEmployees()
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            alert(e)
        })
    }

    function activateEmployee(employee: User) {
        setLoaderMessage("Enabling " + employee.email)
        setIsLoading(true)
        SelfAxiosClient.post("/activate-employee", {
            employee: employee
        }).then((res) => {
            setIsLoading(false)
            showSuccess("Enabled Succesfully")
            getExistingEmployees()
        }).catch((e) => {
            if (e.response.status == 401) {
                authUser.signOut()
                return
            }
            setIsLoading(false)
            alert(e)
        })
    }

    let employeeTableColumns = [
        {
            title: "Email",
            dataIndex: "email",
            key: "email"
        },
        {
            title: "Status",
            key: "activated",
            render: (_: any, employee: User) => (
                <p>{employee.activated.toLowerCase() == "true" ? "Enabled" : "Disabled"}</p>
            )


        },
        {
            title: "Actions",
            key: "action",
            render: (_: any, employee: User) => (
                <Space size={"middle"}>
                    <p className={employee.activated.toLowerCase() == "true" ? "text-red-600 cursor-pointer" : "text-green-600 cursor-pointer"} onClick={() => {
                        if (employee.activated.toLowerCase() == "true") {
                            disableEmployee(employee)
                        } else {
                            activateEmployee(employee)
                        }

                    }}>{employee.activated.toLowerCase() == "true" ? "Disable" : "Enable"}</p>
                </Space>
            )


        }
    ]

    function manageEmployeesElement(): JSX.Element {
        return <div className="flex flex-col items-end">
            <button onClick={() => {
                setIsAddEmpOpen(true)
            }} className="bg-pbutton-500 text-white rounded-lg py-3 px-4 text-sm">Add New Employees</button>
            <Table className="mt-5 min-w-full overflow-scroll" dataSource={existingEmployees} columns={employeeTableColumns} />
        </div>
    }

    function getTabItems() {
        let items = [{

            label: (<div className="flex flex-row gap-2 items-baseline"><BsFillBuildingFill /> <p>Company Details</p></div>),
            key: "company_det",
            children: companyDetailsElement()
        }]
        if (company) {
            items.push({
                label: (<div className="flex flex-row gap-2 items-baseline"><BsPeopleFill /> <p>Manage Employees</p></div>),
                key: "manage_employees",
                children: manageEmployeesElement()
            })
        }
        return items
    }

    function renderAddEmpOpen() {
        return <Modal title="Add New Employees" open={isAddEmpOpen}
            onCancel={()=>{
                setIsAddEmpOpen(false)
            }}
            footer={<div className="flex flex-row-reverse items-end gap-5">
                <button onClick={() => {
                    updateCompany()
                }} className="bg-pbutton-500 text-white rounded-lg py-3 px-4 text-sm"><span className="flex flex-row items-baseline gap-2"><BsPersonAdd />Add</span></button>
                <button onClick={() => {
                    setIsAddEmpOpen(false)
                }} className="text-primary-500 rounded-lg py-3 px-4 text-sm">Cancel</button>



            </div>}
        >
            <textarea className="min-w-full border h-20" onChange={(e) => {
                setEmployees(e.target.value)
            }} placeholder="Add new emails in new lines.">

            </textarea>
        </Modal>
    }

    return (
        <>
            {isLoading ? <Loader message={loaderMessage} /> : <></>}
            {isAddEmpOpen ? renderAddEmpOpen() : <></>}
            <ProtectedRoute>
                <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-inter">
                    <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>

                        <p className='font-bold  text-2xl'>happypeers.work</p>
                        <button onClick={() => {
                            setLoaderMessage("Signing Out")
                            setIsLoading(true)
                            authUser.signOut()
                        }} className='border-2 border-gray-200 p-2 rounded-lg'>Logout</button>
                    </nav>
                    <section className="p-5 min-w-full">
                        <center>
                            <div className="bg-white shadow rounded-xl p-10 max-w-screen-sm">
                                <p className="font-light text-3xl text-center">{company ? "Update company details" : "Setup your company"}</p>
                                <Tabs
                                    centered={true}
                                    className="mt-5"
                                    defaultActiveKey="1"
                                    items={getTabItems()}>
                                </Tabs>
                            </div>
                        </center>


                    </section>
                </main>
            </ProtectedRoute>

        </>
    )
}