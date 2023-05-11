import { AxiosClient, SelfAxiosClient } from "@/configs/axios";
import { firebaseAuth } from "@/configs/firebase";
import { AppDataContextProvider, useAppDataContext } from "@/context";
import Feedback, { FeedbackResponse } from "@/models/feedback";
import { MenuOutlined } from "@ant-design/icons";
import { AxiosResponse } from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createStore } from "state-pool";
import { logggedInUser } from "..";
import Activity, { ActivityResponse } from "@/models/activity";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthAction, AuthUser, useAuthUser, withAuthUser } from "next-firebase-auth";
import { UserResponse } from "@/models/user";
import { initAuth } from "@/initAuth";
import { useRouter } from "next/router";

initAuth()

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    authPageURL: "/"
})(Dashboard)
function Dashboard() {
    const router = useRouter()
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [activity, setActivities] = useState<Activity[]>([])
    const [isAdmin,setIsAdmin] = useState<boolean>(false)
    const [balance,setBalance] = useState(0)
    const AuthUser = useAuthUser()
    
    useEffect(() => {
        if (!AuthUser) return
        getFeedbacksForUser()
    }, [AuthUser])

    useEffect(() => {
        if (!AuthUser) return
        getActivities()
    }, [AuthUser])

    useEffect(()=>{
        if (!AuthUser) return
        getUserBalance()
    },[AuthUser])

    useEffect(()=>{
        setIsAdmin(localStorage.getItem("is_admin") === "true")
    },[])

    async function getUserBalance(){
        if(!AuthUser.id) return
        const userResponse = await SelfAxiosClient.get("/get-user")
        debugger
        if (!userResponse || !userResponse.data || !userResponse.data.Users || userResponse.data.Users.length == 0) {
            alert("Error logging in. ")
            return
        }
        const user = userResponse.data.Users[0]
        if (!user) {
            alert("Could not find your profile. Contact admin")
            return
        }
        setBalance(parseInt(user.balance))
    }


    async function getFeedbacksForUser() {
        if(!AuthUser.id) return
        const feedbackResponse = await SelfAxiosClient.get<any, AxiosResponse<FeedbackResponse>>("/get-feedback")
        if (!feedbackResponse || !feedbackResponse.data.feedback) {
            alert("Failed to load feedbacks for you")
            return
        }
        setFeedbacks(feedbackResponse.data.feedback)
    }

    function getUnreadCount(): string {
        
        let count = 0
        feedbacks.forEach((f) => {
            if (f.status == "unread") {
                count++
            }
        })
        return count + " unread"
    }

    async function getActivities() {
        if(!AuthUser) return
        SelfAxiosClient.get<any, AxiosResponse<ActivityResponse>>("/get-company-activities").then((res) => {
            if (!res || !res.data) {
                alert("Failed to get activities")
                return
            }
            const a = res.data.activity
            setActivities(a.reverse())
        })
    }
    function renderEmptyState() {
        return <>
            <div className="mt-5 shadow bg-white min-w-full p-5 rounded-xl">
                <div className="px-5 py-3 border rounded-lg">
                    <p className="text-center">Its quiet at your organisation!!</p>
                </div>
            </div>
        </>
    }
    function renderActivities() {
        const divs: JSX.Element[] = []
        activity.map((a: Activity) => {
            divs.push(<>
                <div key={a.id} className="bg-white min-w-full p-5 rounded-xl">
                    <div className="px-5 py-3 border rounded-lg">
                        <p>{a.activity}</p>
                        <p className="text-end text-gray-500 text-sm">{a.created_at}</p>
                    </div>
                </div>
            </>)
        })
        return divs
    }
    return (
        <>
            <ProtectedRoute>
                <AppDataContextProvider>
                    <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-poppins">
                        <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>
                           
                            <p className='font-bold  text-2xl'>healthypeers</p>
                            <div className="flex flex-row gap-2">
                                {isAdmin?<button
                                onClick={()=>{
                                    router.push("/setup")
                                }}
                                className="p-2 rounded-md bg-pbutton-500 text-white text-sm">Edit Company Details</button>:<></>}
                            <button onClick={AuthUser.signOut} className='border-2 border-gray-200 p-2 rounded-lg'>Logout</button>
                            </div>
                        </nav>
                        <section className="p-5">
                            <div className="flex flex-row gap-2">

                                <div className="flex-1 bg-white shadow border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center">
                                    <p className="text-xl">Feedbacks for you</p>
                                    <p className="text-5xl mt-2 text-center border-2 rounded-lg p-2 w-min">{feedbacks.length}</p>
                                    <p className="text-center">Feedbacks so far</p>
                                    <p className="font-bold">{getUnreadCount()}</p>
                                    <Link href={"/feedback/view"}><button className="p-3 rounded-xl mt-2 bg-pbutton-500 text-white ">View Feedbacks</button></Link>
                                </div>
                                <div className="flex-1 bg-white shadow border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center">
                                    <p className="text-xl">Mark Feedback</p>
                                    <p className="text-5xl mt-2 text-center border-2 rounded-lg p-2 w-min">{balance}</p>
                                    <p className="text-center">Feedbacks you can submit this month</p>
                                    <Link href="/feedback/send"><button className="p-3 rounded-xl mt-2 bg-pbutton-500 text-white ">Mark Feedback</button></Link>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-4">
                                <p className="text-lg font-bold">Recent Activites at Greedygame</p>
                                {activity.length == 0 ? renderEmptyState() : renderActivities()}
                            </div>
                            <p className="text-center text-gray-500 text-sm mt-5"> You have reached the end!!</p>
                        </section>
                    </main>
                </AppDataContextProvider>
            </ProtectedRoute>
        </>
    )
}