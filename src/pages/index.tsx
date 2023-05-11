import Image from 'next/image'
import { Inter } from 'next/font/google'
import { EyeInvisibleOutlined, MenuOutlined } from '@ant-design/icons'
import { firebaseAuth, signinWithGoogle } from '@/configs/firebase'
import { AxiosClient } from '@/configs/axios'
import { GiPlantWatering } from "react-icons/gi"
import { FaPeopleArrows } from "react-icons/fa"
import { BsFillBuildingFill } from "react-icons/bs"
import { TiTick } from "react-icons/ti"
import { AxiosResponse } from 'axios'
import Company, { CompanyResponse } from '@/models/company'
import User, { UserResponse } from '@/models/user'
import { useRouter } from 'next/router'
import { createStore } from 'state-pool'
import { AppDataContextProvider } from '@/context'
import { AuthAction, useAuthUser, withAuthUser } from 'next-firebase-auth'
import { useEffect } from 'react'


const inter = Inter({ subsets: ['latin'] })
//TODO change to context provider
export let logggedInUser: User = {
  id: '',
  company: '',
  uid: '',
  email: '',
  created_at: '',
  balance: '',
  activated: '',
  name: ''
}
export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit:AuthAction.RENDER,
  whenUnauthedAfterInit: AuthAction.RENDER,
})(Home)

function Home() {
  const fbUser = useAuthUser()
  async function signIn() {
    try {
      await signinWithGoogle()
      let email = firebaseAuth.currentUser?.email
      if (!email) {
        throw Error("Unable to sign in")
      }

      // let companyResponse = (await AxiosClient.post<any, AxiosResponse<CompanyResponse>>("get/company", JSON.stringify({
      //   "filters": [{
      //     "column": "email_domain",
      //     "filter": {
      //       "text_equals": email.split("@")[1]
      //     }
      //   }]
      // })))
      // if (!companyResponse) {
      //   alert("Error signing in")
      //   return
      // }
      // if (companyResponse.data.company.length == 0) {
      //   alert("Error signing in")
      //   return
      // }
      // const company = companyResponse.data.company[0]
      // if (!company) {
      //   router.push("/setup")
      //   return
      // }
      // if (company.activated !== "true") {
      //   alert("Your plan for the company has expired. Please renew.")
      //   return
      // }

    //   let userResponse = await AxiosClient.post<any, AxiosResponse<UserResponse>>("/get/Users", JSON.stringify({
    //     "filters": [{
    //       "column": "email",
    //       filters: {
    //         "text_equals": email
    //       }
    //     }]
    //   }))
    //   if (!userResponse || !userResponse.data || !userResponse.data.Users || userResponse.data.Users.length == 0) {
    //     alert("Error logging in. ")
    //     return
    //   }
    //   const user = userResponse.data.Users[0]
    //   if (!user) {
    //     alert("Could not find your profile. Contact admin")
    //     return
    //   }
    //   if (user.activated !== "true") {
    //     user.uid = firebaseAuth.currentUser?.uid ?? "null"
    //     await AxiosClient.put("update/Users", JSON.stringify({
    //       keys: {
    //         "email": email
    //       },
    //       data: {
    //         "activated": "true",
    //         "uid": user.uid,
    //         "name": firebaseAuth.currentUser?.displayName
    //       }
    //     }))
    //     user.activated = "true"
    //   }
    //   logggedInUser = user
    //   // router.push("/dashboard")

    } catch (e) {
      console.log(e)
      alert("Failed to login")
    }
  }
  return (
    <AppDataContextProvider>
      <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-poppins">
        <nav className='bg-white flex  items-center p-4 gap-3 justify-between'>
         
          <p className='font-bold  text-2xl'>healthypeers</p>
          <button onClick={signIn} className='border-2 border-gray-200 p-2 rounded-lg'>Login</button>
        </nav>
        <section className='px-5 text-center'>
          <div className='mt-10 flex flex-col gap-2 items-center justify-center text-center px-2'>
            <h1 className='text-5xl font-bold '>Anonymous Peer Feedback</h1>
            <p className='text-lg font-normal leading-7 text-gray-700'>Promote an Open & Healthy work enviroment<br /> for Happy Employees </p>
          </div>
          <div className='flex flex-col gap-5 mt-5 '>
            <button onClick={signIn} className='bg-pbutton-500 py-3 text-white rounded-2xl '>Get Started</button>
            <a className='border-2 border-gray-200 py-3 text-primary-500 font-semibold rounded-2xl' href="#pricing-section"><button  >See Pricing</button></a>
          </div>
          <div className='mt-8 flex flex-col items-center gap-3 text-center'>
            <div className='flex flex-row -space-x-1.5'>
              <img className='ring ring-white rounded-full h-12 w-12' src='https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Favatars%2Fana.png&optimizer=image' />
              <img className='ring ring-white rounded-full h-12 w-12' src='https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Favatars%2Fana.png&optimizer=image' />
              <img className='ring ring-white rounded-full h-12 w-12' src='https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Favatars%2Fana.png&optimizer=image' />
              <img className='ring ring-white rounded-full h-12 w-12' src='https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Favatars%2Fana.png&optimizer=image' />
              <img className='ring ring-white rounded-full h-12 w-12' src='https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Favatars%2Fana.png&optimizer=image' />
            </div>
            <p className='font-thin px-5'>Join <span className='font-semibold'> 175+ MNCs and new-age startups</span> and get your organisation on the path to productivity</p>
          </div>
          <div className='min-w-full flex flex-row justify-center'>
          <img className='mt-6' src="https://cdn.feather.blog/?src=https%3A%2F%2Ffeather.so%2Fimages%2Flanding%2Fhero-mockup.png&optimizer=image" />
          </div>
          <div className='mt-8 flex flex-col gap-4'>
            <h1 className='text-2xl font-bold'>Innovative Anonymous Feedback System powered by AI</h1>
            <p className='text-lg'>HealthyPeers is an innovative feedback system for your organisation that encourages people to speak up, identify points of improvement for individuals for a happier workspace</p>
            <div className='grid grid-flow-row md:grid-flow-col lg:grid-flow-col  gap-4'>
              <div className='flex flex-col gap-5 items-center card shadow px-5 py-5 bg-white rounded-xl'>
                <EyeInvisibleOutlined className='text-5xl flex-1' />
                <h3 className='text-3xl'>Complete Anonymity</h3>
                <div className='flex flex-1 gap-2 flex-col'>
                  <p className='text-gray-700 text-center px-5'>The identity of the reviewer is never shared. We will not share the identity with anyone even on request from the employer.</p>
                </div>
              </div>
              <div className='flex flex-col gap-5 items-center card shadow px-5 py-5 bg-white rounded-xl'>
                <GiPlantWatering className='text-5xl flex-1' />
                <h3 className='text-3xl'>Constructive Feedbacks</h3>
                <div className='flex flex-1 gap-2 flex-col'>
                  <p className='text-gray-700 text-center px-5'>All feedbacks submitted are ensured to be constructive using AI. </p>
                </div>
              </div>
              <div className='flex flex-col gap-5 items-center card shadow px-5 py-5 bg-white rounded-xl'>
                <FaPeopleArrows className='text-5xl flex-1' />
                <h3 className='text-3xl'>Point Based Review System </h3>
                <div className='flex flex-1 gap-2 flex-col'>
                  <p className='text-gray-700 text-center px-5'>Every employee can submit 2 reviews monthly. If the previous comments are marked as constructive, their point is credited back to contribute more.</p>
                </div>
              </div>
              <div className='flex flex-col gap-5 items-center card shadow px-5 py-5 bg-white rounded-xl'>
                <BsFillBuildingFill className='text-5xl flex-1' />
                <h3 className='text-3xl'>Reviews never leave your organization</h3>
                <div className='flex flex-1 gap-2 flex-col'>
                  <p className='text-gray-700 text-center px-5'>Every peer reviews submitted within your organization is never shared publically. They are right in your inbox for you to take the right actions.</p>
                </div>
              </div>
            </div>
          </div>
          <div id="pricing-section" className=' mt-5 flex flex-col items-start md:items-center lg:items-center justify-center'>
            <h1 className='text-3xl font-bold '>Pricing</h1>
            <div className='rounded-xl mt-5 min-w-full shadow bg-white p-5 border border-gray-200 flex flex-col text-start md:text-center lg:text-center'>
              <p className='text-3xl'>Supreme</p>
              <p><span className='line-through text-gray-400 text-lg'>$80/month</span>&nbsp;<span className='text-primary-500 text-lg'>FREE</span></p>
              <div className='mt-5 text-start '></div>
              <div className='flex flex-col lg:items-center  md:items-center '>
                <div className='flex flex-row'>
                  <TiTick size={"30px"} />
                  <p>Unlimited Users</p>
                </div> 
                <div className='flex flex-row'>
                  <TiTick  size={"30px"} />
                  <p>AI Analysis to ensure quality feedback</p>
                </div> 
                <div className='flex flex-row'>
                  <TiTick  size={"30px"} />
                  <p>Point System maintaing quality</p>
                </div>
                <div className='flex flex-row'>
                  <TiTick  size={"30px"} />
                  <p>Anonymity for employees</p>
                </div>
              </div>

              <button onClick={signIn} className='mt-5 bg-pbutton-500 text-white p-3 rounded-xl'>
                Get Started
              </button>
            </div>

          </div>


        </section>
        <div className='bg-pbutton-500 px-10 pt-10 mt-10 text-white'>
          <p>Powered by</p>
          <a href="#"><p className='text-5xl font-bold'>onsheets.io</p></a>
          <p className='text-center mt-5'>Made with ❤️ by Jude</p>
        </div>
      </main>
    </AppDataContextProvider>
  )
}
