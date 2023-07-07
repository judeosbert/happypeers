import Loader, { showError, showSuccess } from "@/components/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SelfAxiosClient } from "@/configs/axios";
import User, { UserResponse } from "@/models/user";
import { MenuOutlined } from "@ant-design/icons";
import { AxiosResponse } from "axios";
import { debug } from "console";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    authPageURL: "/"
})(ViewFeedbacks)
function ViewFeedbacks() {
    const AuthUser = useAuthUser()
    const [peers, setPeers] = useState<User[]>([])
    const [appUser, setAppUser] = useState<User>()
    const [refresh, setRefresh] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [analysis, setAnalysis] = useState<AnalysisResponse>()

    useEffect(() => {
        setLoadingMessage("Hold your thought for a second")
        setIsLoading(true)
        SelfAxiosClient.get<any, AxiosResponse<UserResponse>>("/get-user").then((userResponse) => {
            if (!userResponse || !userResponse.data || !userResponse.data.Users || userResponse.data.Users.length == 0) {
                if (userResponse.status == 401) {
                    setIsLoading(true)
                    setLoadingMessage("Token Expired")
                    AuthUser.signOut()
                    return
                }
                setIsLoading(false)
                showError("Error logging in. ")
                return
            }
            setIsLoading(false)
            const user = userResponse.data.Users[0]
            if (!user) {
                showError("Could not find your profile. Contact admin")
                return
            }
            setAppUser(user)
        }).catch((e) => {
            if (e.response.status == 401) {
                setIsLoading(true)
                setLoadingMessage("Token Expired")
                AuthUser.signOut()
                return
            }
            setIsLoading(false)
            showError("Could not get user profile")
            console.log(e)
        })
    }, [refresh])

    useEffect(() => {
        setLoadingMessage("Finding your peers")
        setIsLoading(true)
        SelfAxiosClient.get<any, AxiosResponse<UserResponse>>("/get-company-peers").then((res) => {
            if (!res || !res.data || !res.data.Users) {
                if (res.status == 401) {
                    setIsLoading(true)
                    setLoadingMessage("Token Expired")
                    AuthUser.signOut()
                    return
                }
                setIsLoading(false)
                showError("Error finding your peers")
                return
            }
            setIsLoading(false)
            const p = res.data.Users
            const fp: User[] = []
            p.forEach((p) => {
                if (p.uid != AuthUser.id) {
                    fp.push(p)
                }
            })
            setPeers(fp)
        }).catch((e) => {
            if (e.response.status == 401) {
                setIsLoading(true)
                setLoadingMessage("Token Expired")
                AuthUser.signOut()
                return
            }
            setIsLoading(false)
            showError(e)
        })
    }, [])

    function generatePeerOptions() {
        const options: JSX.Element[] = []
        options.push(<option disabled selected>Select your collegue</option>)
        peers.forEach((p) => {
            options.push(<option value={p.uid}>{p.name}</option>)
        })
        return options
    }

    const [feedback, setFeedback] = useState<String>()
    interface SelectedPeer {
        name: string
        uid: string
    }
    const [selectedPeer, setSelectedPeer] = useState<SelectedPeer>()
    function submitFeedback() {
        if (!appUser) return
        if (parseInt(appUser.balance) <= 0) {
            showError("You don't have enough balance to submit reviews.")
            return
        }
        if (!selectedPeer || selectedPeer?.uid.length == 0) {
            showError("Select a peer to review")
            return
        }

        if (!feedback?.length) {
            showError("Write a feedback to submit")
            return
        }

        setLoadingMessage("Posting your feedback. Hold on!!")
        setIsLoading(true)
        //TODO check if its constructive.
        SelfAxiosClient.post<any, AxiosResponse<any>>("/send-feedback", {
            recipient: selectedPeer?.uid,
            recipientName: selectedPeer?.name,
            feedback: feedback
        }).then((resp) => {
            showSuccess("Your feedback is submitted!")
            setRefresh(true)
            setIsLoading(false)
            setFeedback("")

        }).catch((e) => {
            if (e.response.status == 401) {
                setIsLoading(true)
                setLoadingMessage("Token Expired")
                AuthUser.signOut()
                return
            }
            setIsLoading(false)
            showError(e.response.data.error ?? "failed to submit feedback")
        })

    }


    interface AnalysisResponse {
        analysis: string,
        score: number,
    }
    const errorAnalysis = {
        analysis: "Could not analyse your feedback. Change something to try again",
        score: -1
    }
    function getAnalysis(feedback: string) {
        if (!feedback || feedback.trim().length == 0) {
            
            setAnalysis(undefined)
            return
        }
        SelfAxiosClient.post<any, AxiosResponse<AnalysisResponse>>("/get-analysis-score",{
            feedback:feedback
        }).then((resp) => {
            
            setAnalysis(resp.data)
        }).catch((e) => {
            
            if (e.response.status == 401) {
                setIsLoading(true)
                setLoadingMessage("Token Expired")
                AuthUser.signOut()
                return
            }
            setAnalysis(errorAnalysis)
        })
    }


    return (
        <>
            {
                isLoading ? <Loader message={loadingMessage} /> : <></>
            }
            <ProtectedRoute>
                <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-inter">
                    <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>

                        <Link href={"/dashboard"}><p className='font-bold  text-2xl'>happypeers.work</p></Link>
                    </nav>
                    <section className="p-5">
                        <p className="text-xl font-bold ml-5">Send your feedback</p>
                        <p className="ml-5">Be constructive in your feedback to be accepted. </p>
                        <div className=" rounded-xl px-5 ">
                            <div className="mt-5 px-5 py-10 border rounded-lg bg-white flex flex-col gap-3">
                                <p className="text-start">{appUser?.balance} feedbacks remaining</p>
                                <select onChange={(e) => {
                                    setSelectedPeer({ uid: e.target.selectedOptions[0].value, name: e.target.selectedOptions[0].text })
                                }} className=" rounded-lg border p-2 min-w-full" placeholder="Search for a collegue" value={selectedPeer?.uid} >
                                    {
                                        generatePeerOptions()
                                    }
                                </select>
                                <textarea onChange={(e) => {
                                    setFeedback(e.target.value)
                                    
                                    getAnalysis(e.target.value)
                                }} id="feedbackArea" className="rounded-lg border p-2" placeholder="Mark your feedback here. Rememeber it should be constructive">
                                    {feedback}
                                </textarea>
                                {
                                    analysis ? <p className={analysis!!.score > 0 ? "text-green-600 text-sm" : analysis!!.score < 0 ? "text-red-600" : "text-yellow-500"}>
                                        {analysis?.analysis}
                                    </p> : <></>
                                }

                                <button onClick={submitFeedback} className="bg-pbutton-500 text-white p-3 rounded-xl ">Submit feedback</button>
                            </div>

                        </div>
                        <div className="text-center mt-10">
                            <p className="mt-10 text-gray-500 text-xs">Do you want to see the feedbacks for you?</p>
                            <Link href={"/feedback/view"}><button className="bg-pbutton-500 text-white p-3 rounded-xl mt-4">View my feedback</button></Link>
                        </div>
                    </section>
                </main>
            </ProtectedRoute>
        </>
    )
}