import ProtectedRoute from "@/components/ProtectedRoute";
import { AxiosClient, SelfAxiosClient } from "@/configs/axios";
import { initAuth } from "@/initAuth";
import Feedback, { FeedbackResponse } from "@/models/feedback";
import { AxiosResponse } from "axios";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import Link from "next/link";
import {useEffect, useState } from "react";

initAuth()

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    authPageURL: "/"
})(ViewFeedbacks)
function ViewFeedbacks() {
    const user = useAuthUser()
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [unreadFeedback, setUnreadFeedback] = useState<Feedback[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const index = 0
    useEffect(() => {
        getFeedbacks()
    }, [])

    function getFeedbacks() {
        SelfAxiosClient.get<any, AxiosResponse<FeedbackResponse>>("/get-feedback").then((res) => {
            const unread: Feedback[] = []
            const others: Feedback[] = []
            res.data.feedback.forEach((f) => {
                if (f.status == "unread") {
                    unread.push(f)
                } else {
                    others.push(f)
                }
            })
            setUnreadFeedback(unread)
            setFeedbacks(others)
            setIsLoading(false)
        })
    }

    function markAsConstructive() {
        setIsLoading(true)
        const f = unreadFeedback || []
        const cf = f[index]
        cf.status = "constructive"
        SelfAxiosClient.post("/update-feedback", {
            "feedback": cf
        }).then((res) => {
            getFeedbacks()
        }).catch((e) => {
            alert("Could not update status")
        })

    }
    function markAsNonConstructive() {
        setIsLoading(true)
        const f = unreadFeedback || []
        const cf = f[index]
        cf.status = "non-constructive"
        SelfAxiosClient.post("/update-feedback", {
            "feedback": cf
        }).then((res) => {
            getFeedbacks()
        }).catch((e) => {
            alert("Could not update status")
        })
    }

    function renderFeedback() {
        return (
            <>
                <div className=" rounded-xl px-5 ">
                    <p className="text-end">{unreadFeedback?.length} unread feedbacks</p>
                    <div className="mt-5 px-5 py-10 border rounded-lg bg-white">
                        <p className="text-2xl">{unreadFeedback?.at(index)?.feedback}</p>
                        <p className="text-end text-gray-500 text-sm">Sent on {unreadFeedback?.at(index)?.created_at}</p>
                        <div className="flex flex-row gap-2 mt-10">
                            <button disabled={isLoading} onClick={markAsNonConstructive} className="flex-1 bg-red-600 text-white py-4  rounded-lg">Non Constructive</button>
                            <button disabled={isLoading} onClick={markAsConstructive} className="flex-1 bg-green-600 text-white py-4 rounded-lg">Constructive</button>
                        </div>
                        <p className="mt-1 text-gray-500 text-xs">Mark this feedback either as &quot;Constructive&quot; or &quot;Non Constructive&quot; to see the next feedback</p>
                    </div>

                </div>
            </>
        )
    }

    function renderOldFeedback() {
        function renderNonConstructiveIndicator() {
            return <button disabled className="disabled:opacity-60 flex-1 text-red-600 border border-red-600 py-4  rounded-lg">You marked this as Non Constructive</button>
        }
        function renderConstructiveIndicator() {
            return <button disabled className="disabled:opacity-60 flex-1 text-green-600 border border-green-600 py-4 rounded-lg">You marked this as Constructive</button>
        }

        const of:JSX.Element[] = []
        feedbacks.forEach((f) => {
            of.push(<>
                <div className="mt-5 px-5 py-10 border rounded-lg bg-white">
                    <p className="text-2xl">{f?.feedback}</p>
                    <p className="text-end text-gray-500 text-sm">Sent on {f?.created_at}</p>
                    <div className="flex flex-row gap-2 mt-10">
                        {f.status == "constructive" ? renderConstructiveIndicator() : renderNonConstructiveIndicator()}
                    </div>
                </div>
            </>)
        })

        return <>
            <div className=" rounded-xl px-10">
                <p className="text-end">{feedbacks?.length} feedbacks</p>
                {of}
            </div>
        </>
    }
    function renderEmptyState() {
        return (
            <>
                <p className="p-5 bg-white mt-5 ml-5 border shadow border-gray-200 text-center">You have no feedbacks so far.</p>
            </>

        )
    }


    return (<>
        <ProtectedRoute>
            <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-poppins">
                <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>

                    <Link href="/dashboard"><p className='font-bold  text-2xl'>happypeers.work</p></Link>
                    <button onClick={user.signOut} className='border-2 border-gray-200 p-2 rounded-lg'>Logout</button>
                </nav>
                <section className="p-5">
                    <p className="text-xl font-bold ml-5">Feedbacks for you</p>
                    {unreadFeedback.length == 0 ? renderEmptyState() : renderFeedback()}
                    <div className="text-center mt-10">
                        <p className="mt-10 text-gray-500 text-xs">Do you want to send feedback to some one?</p>
                        <Link href="/feedback/send"><button className="bg-pbutton-500 text-white p-3 rounded-xl mt-4">Mark your feedback</button></Link>
                    </div>
                </section>
                <section>
                    <p className="px-5 text-xl font-bold ml-5">All Feedbacks for you</p>
                    {feedbacks.length == 0 ? renderEmptyState() : renderOldFeedback()}
                </section>
            </main>
        </ProtectedRoute>

    </>)


}
