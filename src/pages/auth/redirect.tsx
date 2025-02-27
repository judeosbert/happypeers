import { AxiosClient, SelfAxiosClient } from "@/configs/axios";
import { firebaseAuth, TOKEN_KEY } from "@/configs/firebase";
import { initAuth } from "@/initAuth";
import { CompanyResponse } from "@/models/company";
import { UserResponse } from "@/models/user";
import { AxiosResponse } from "axios";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdEmail, MdNoAccounts } from "react-icons/md"
import { GiEarthCrack } from "react-icons/gi"
import { SyncLoader } from "react-spinners";
import { showError } from "@/components/Loader";

initAuth()

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    authPageURL: "/"
})(AuthRedirect)

const PageStateInitial = "initial"
const PageStateAccountNotFound = "account_not_found"
const PageStateInvalidApiResponse = "invalid_api_response"
const PagePublicEmailDomain = "public_email_domain"
function AuthRedirect() {
    //check if the user is already setup
    //if setup,  send to dashboard
    //if not setup, send to setup page.
    const router = useRouter()
    const fbUser = firebaseAuth.currentUser
    const AuthUser = useAuthUser()

    const [pageState, setPageState] = useState(PageStateInitial)

    useEffect(() => {
        if (firebaseAuth.currentUser) {
            firebaseAuth.currentUser.getIdToken().then((res) => {
                if (!res) {
                    router.push("/")
                    return
                }
                localStorage.setItem(TOKEN_KEY, res)
                isPublicDomainEmail().then((domainCheckStatus) => {
                    if (domainCheckStatus == 401) {
                        AuthUser.signOut()
                        return
                    }

                    if (domainCheckStatus == 220) {
                        setPageState(PagePublicEmailDomain)
                        return
                    }

                    getCompanyDetails().then(() => {
                        getUserDetails()
                    }).catch((e) => {
                        console.log("redirect", e)
                    })
                })


            }).catch((e) => {
                console.log("redirect-token", e)
            })
        } else {
            router.push("/")
        }

    }, [])


    async function isPublicDomainEmail() {
        let res = await SelfAxiosClient.get<any, AxiosResponse<any>>("/check-public-emails")
        return res.status

    }

    async function getUserDetails() {
        const email = fbUser?.email
        let userResponse = await AxiosClient.post<any, AxiosResponse<UserResponse>>("/get/Users", JSON.stringify({
            "filters": [{
                "column": "email",
                "filters": {
                    "text_equals": email
                }
            }]
        }))


        if (!userResponse || !userResponse.data || !userResponse.data.Users) {
            setPageState(PageStateInvalidApiResponse)
            return
        }

        const user = userResponse.data.Users[0]
        if (!user) {
            setPageState(PageStateAccountNotFound)
            return
        }
        if (user.activated !== "true") {
            user.uid = fbUser?.uid ?? "null"
            await AxiosClient.put("update/Users", JSON.stringify({
                keys: {
                    "email": email
                },
                data: {
                    "activated": "true",
                    "uid": user.uid,
                    "name": fbUser?.displayName
                }
            }))
            user.activated = "true"
        }
        router.push("/dashboard")
    }

    async function getCompanyDetails() {
        const email = fbUser?.email ?? ""

        let companyResponse = (await AxiosClient.post<any, AxiosResponse<CompanyResponse>>("get/company", JSON.stringify({
            "filters": [{
                "column": "email_domain",
                "filters": {
                    "text_equals": email.split("@")[1]
                }
            }]
        })))
        if (!companyResponse) {
            setPageState(PageStateInvalidApiResponse)
            return
        }
        const company = companyResponse.data.company[0]
        if (!company) {
            router.push("/setup")
            throw ("Company not setup")
        }
        localStorage.setItem("is_admin", company.admin === email ? "true" : "false")
    }

    function initialState() {
        return <>
            <main className="bg-white min-h-screen min-w-full flex flex-col justify-center items-center text-primary-500 gap-3">
                <SyncLoader
                    color="#0f172b"
                    size={5}
                />
                <p className="font-medium text-lg">Please wait</p>
                <p className="text-center text-sm">Redirecting</p>
            </main>
        </>
    }

    function renderAccountNotFound() {
        return <>
            <main className="bg-white min-h-screen min-w-full flex flex-col justify-center items-center text-primary-500">
                <MdNoAccounts size={90} />
                <p className="font-medium text-lg">Account Not Found!</p>
                <p className="text-center text-sm">Please check with admin at your organization.</p>
                <p className="text-center text-sm text-gray-400 font-semibold"><span className="font-normal">Logged in with </span>{fbUser?.email}</p>
                <button onClick={() => {
                    AuthUser.signOut()
                }} className={"border-2 border-gray-200 px-5 py-2 mt-5 rounded-lg"}>Logout</button>
            </main>
        </>
    }
    function renderInvalidApiResult() {
        return <>
            <main className="bg-white min-h-screen min-w-full flex flex-col justify-center items-center text-primary-500">
                <GiEarthCrack size={90} />
                <p className="font-medium text-lg">Unable to load the page</p>
                <p className="text-center text-sm">This is on us. Please be patient while we fix this.</p>
            </main>
        </>
    }

    function renderPublicEmailDomain() {
        return <>
            <main className="bg-white min-h-screen min-w-full flex flex-col justify-center items-center text-primary-500">
                <MdEmail size={90} />
                <p className="font-medium text-lg">Log in with your work email!</p>
                <p className="text-center text-sm">You need to login with a work email to use happypeers.</p>
                <p className="text-center text-sm text-gray-400 font-semibold"><span className="font-normal">Logged in with </span>{fbUser?.email}</p>
                <button onClick={() => {
                    AuthUser.signOut()
                }} className={"border-2 border-gray-200 px-5 py-2 mt-5 rounded-lg"}>Logout</button>
            </main>
        </>
    }

    if (pageState === PageStateInitial) {
        return initialState()
    } else if (pageState === PageStateAccountNotFound) {
        return renderAccountNotFound()
    } else if (pageState === PageStateInvalidApiResponse) {
        return renderInvalidApiResult()
    } else if (pageState == PagePublicEmailDomain) {
        return renderPublicEmailDomain()
    }
    else {
        return <></>
    }
    

}

