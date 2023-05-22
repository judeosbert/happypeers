import ProtectedRoute from "@/components/ProtectedRoute";
import { SelfAxiosClient } from "@/configs/axios";
import User, { UserResponse } from "@/models/user";
import { MenuOutlined } from "@ant-design/icons";
import { AxiosResponse } from "axios";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
export default withAuthUser({
    whenUnauthedAfterInit:AuthAction.REDIRECT_TO_LOGIN,
    authPageURL:"/"
})(ViewFeedbacks)
function ViewFeedbacks() {
    const user = useAuthUser()
    const [peers, setPeers] = useState<User[]>([])
    const [appUser,setAppUser] = useState<User>()
    const [refresh,setRefresh] = useState(false)

    useEffect(()=>{
        SelfAxiosClient.get<any,AxiosResponse<UserResponse>>("/get-user").then((userResponse)=>{
            if (!userResponse || !userResponse.data || !userResponse.data.Users || userResponse.data.Users.length == 0) {
                alert("Error logging in. ")
                return
            }
            const user = userResponse.data.Users[0]
            if (!user) {
                alert("Could not find your profile. Contact admin")
                return
            }
            setAppUser(user)
        }).catch((e)=>{
            alert("Could not get user profile")
            console.log(e)
        })
    },[refresh])

    useEffect(() => {
        SelfAxiosClient.get<any, AxiosResponse<UserResponse>>("/get-company-peers").then((res) => {
            if (!res || !res.data || !res.data.Users) {
                alert("Error")
                return
            }
            const p = res.data.Users
            const fp: User[] = []
            p.forEach((p) => {
                if (p.uid != user.id) {
                    fp.push(p)
                }
            })
            setPeers(fp)
        }).catch((e) => {
            alert(e)
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
        if(!appUser) return
        if (parseInt(appUser.balance) <= 0) {
            alert("You don't have enough balance to submit reviews.")
            return
        }

        if (selectedPeer?.uid.length == 0) {
            alert("Select a peer to review")
            return
        }

        if (!feedback?.length) {
            alert("Write a feedback to submit")
            return
        }

        //TODO check if its constructive.
        SelfAxiosClient.post<any, AxiosResponse<any>>("/send-feedback", {
            recipient: selectedPeer?.uid,
            recipientName:selectedPeer?.name,
            feedback: feedback
        }).then((resp) => {
            alert("Feedback submitted")
            setRefresh(true)
        }).catch((e) => {
            alert("failed to submit review")
        })

    }


    return (
        <>
            <ProtectedRoute>
                <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-poppins">
                    <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>
                       
                        <Link href={"/dashboard"}><p className='font-bold  text-2xl'>happypeers.work</p></Link>
                        <button onClick={user.signOut} className='border-2 border-gray-200 p-2 rounded-lg'>Logout</button>
                    </nav>
                    <section className="p-5">
                        <p className="text-xl font-bold ml-5">Send your feedback</p>
                        <div className=" rounded-xl px-5 ">
                            <p className="text-end">{appUser?.balance} feedbacks remaining</p>
                            <div className="mt-5 px-5 py-10 border rounded-lg bg-white flex flex-col gap-3">
                                <select onChange={(e) => {
                                    setSelectedPeer({ uid: e.target.selectedOptions[0].value, name: e.target.selectedOptions[0].text })
                                }} className=" rounded-lg border p-2 min-w-full" placeholder="Search for a collegue" value={selectedPeer?.uid} >
                                    {
                                        generatePeerOptions()
                                    }
                                </select>
                                <textarea onChange={(e) => {
                                    setFeedback(e.target.value)
                                }} id="feedbackArea" className="rounded-lg border p-2" placeholder="Mark your feedback here. Rememeber it shoyld be constructive">
                                    {feedback}
                                </textarea>

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