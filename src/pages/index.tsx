import Loader, { showError } from '@/components/Loader'
import { firebaseAuth, signinWithGoogle } from '@/configs/firebase'
import { AppDataContextProvider } from '@/context'
import { initAuth } from '@/initAuth'
import User from '@/models/user'
import { EyeInvisibleOutlined } from '@ant-design/icons'
import { AuthAction, useAuthUser, withAuthUser } from 'next-firebase-auth'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useState } from 'react'
import { BsFillBuildingFill } from "react-icons/bs"
import { FaPeopleArrows } from "react-icons/fa"
import { GiPlantWatering } from "react-icons/gi"
import { TiTick } from "react-icons/ti"



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
initAuth()
export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.RENDER,
  whenUnauthedAfterInit: AuthAction.RENDER,
})(Home)

function Home() {
  const fbUser = useAuthUser()
  const [isLoading, setIsLoading] = useState(false)
  async function signIn() {
    try {
      setIsLoading(true)
      await signinWithGoogle()
      let email = firebaseAuth.currentUser?.email
      if (!email) {
        setIsLoading(false)
        throw Error("Unable to login in")
      }
    } catch (e) {
      setIsLoading(false)
      showError("Failed to login")
    }
  }
  return (
    <>
      {
        isLoading ? <Loader message="Signing In" /> : <></>
      }
      <AppDataContextProvider>
        <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-inter">
          <nav className='flex  items-center p-4 gap-3 justify-between'>
            <p className='font-bold  text-2xl'>happypeers.work</p>
            <button onClick={signIn} className='border-2 border-gray-200 p-2 rounded-lg'>Login</button>
          </nav>
          <section className='px-5 text-center mt-20'>
            <div className='mt-20 flex flex-col gap-2 items-center justify-center text-center px-2'>
              <a href="https://www.producthunt.com/posts/happypeers?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-happypeers" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=403646&theme=light" alt="HappyPeers - Anonymous&#0032;peer&#0032;feedback&#0032;to&#0032;improve&#0032;your&#0032;workspace | Product Hunt" width={250} height={54}/></a>
              <h1 className='text-5xl font-bold '>Innovative Employee Feedback System</h1>
              <p className='text-xl font-light leading-7 text-gray-700 mt-4'>Boost your employee  by addressing internal issues faster</p>
            </div>
            <div className='flex flex-col md:flex-row gap-5 mt-8 md:justify-center'>
              <button onClick={signIn} className='bg-pbutton-500 py-3 md:px-5 md:py-3 text-white rounded-2xl '>Get Started</button>
              <a className='border-2 border-gray-200 py-3 md:px-5 md:py-3 text-primary-500 font-semibold rounded-2xl' href="#pricing-section"><button  >See Pricing</button></a>
            </div>
            {/* <div className='mt-8 flex flex-col items-center gap-3 text-center'>
              <div className='flex flex-row -space-x-1.5'>
                <img className='ring ring-gray-200 rounded-full h-12 w-12' src='../happy_man.jpg' />
                <img className='ring ring-gray-200 rounded-full h-12 w-12' src='../happy_woman.avif' />

              </div>
              <p className='font-thin px-5'><span className='font-semibold'>Isn't your feedback sessions with the team bringing out issues?</span> Happy Peers is for you.</p>
            </div> */}
            <div className='flex flex-row justify-center'>
              <img className='mt-6  max-w-full md:max-w-screen-xl' src="../console_preview.png" />
            </div>
            <div className='mt-12 flex flex-col gap-4 items-center'>
              <h1 className='text font-light'> Know internal issues before it is posted online</h1>
              <h1 className='text-4xl font-bold'>Anonymous feedbacks for atmost honesty</h1>
              <p className='text-lg font-light px-6 max-w-screen-sm'>HappyPeers is an innovative feedback system for your organisation that encourages people to speak up by maintaining anonymity, identify points of improvement for individuals and organisation for a happier workspace</p>
              <div className='grid grid-flow-row gap-y-16 px-5 md:px-10 lg:px-20 md:pb-16 mt-20 lg:mt-20'>
                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div className='block md:hidden'>
                    <img src='../complete_anonymity.png' />
                  </div>

                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <EyeInvisibleOutlined className='text-4xl flex-1' />
                    </div>
                    <h1 className='text-2xl'>Complete Anonymity</h1>
                    <p className='font-light text-lg'>The identity of the reviewer is never shared. We will not share the identity with anyone, even on request from the employer.</p>
                  </div>

                  <div className='md:block hidden'>
                    <img src='../complete_anonymity.png' />
                  </div>

                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div>
                    <img className='max-w-full' src='../only_constructive.png' />
                  </div>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <GiPlantWatering className='text-4xl flex-1' />
                    </div>
                    <h1 className='text-2xl'>Only Constructive Feedbacks</h1>
                    <p className='font-light text-lg'>All feedbacks submitted are ensured to be constructive using our NiceTalk engine.</p>
                  </div>
                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='block md:hidden'>
                      <img className='max-w-full' src='../point_based_review_system.png' />
                    </div>

                    <div className='border-2 p-2 rounded-xl'>
                      <FaPeopleArrows className='text-4xl flex-1' />
                    </div>
                    <h1 className='text-2xl'>Point Based Peer Review System</h1>
                    <p className='font-light text-lg'>Every employee can submit 2 reviews monthly. If the previous comments are marked as constructive, their point is credited back to contribute more.</p>
                  </div>
                  <div className='hidden md:block'>
                    <img className='max-w-full' src='../point_based_review_system.png' />
                  </div>
                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div>
                    <img className='max-w-full' src='../private_feedbacks.png' />
                  </div>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <BsFillBuildingFill className='text-4xl flex-1' />
                    </div>
                    <h1 className='text-2xl'>Feedbacks never leave your organization</h1>
                    <p className='font-light text-lg'>Every feedback submitted within your organization is never shared publically. They are right in your inbox for you to take the right actions.</p>
                  </div>
                </div>

              </div>
            </div>
            <div id="pricing-section" className='mt-20 flex flex-col items-center justify-center max-w-screen-md md:max-w-screen-xl'>
              <h1 className='text-4xl font-bold '>Pricing</h1>
              <p className='mt-7'><span className='text-primary-500 text-2xl font-bold'>FREE</span></p>
              <p className='font-light text-sm'>Early-Bird Offer</p>
              <div className='rounded-xl mt-5  shadow bg-white p-5 border border-gray-200 flex flex-col text-start md:text-center lg:text-center  max-w-screen-xl'>
                <div className='mt-5 text-start '></div>
                <div className='flex flex-col items-start font-light text-xl gap-y-5 '>
                  <div className='flex flex-row'>
                    <TiTick color='green' size={"30px"} />
                    <p>Unlimited Users</p>
                  </div>
                  <div className='flex flex-row'>
                    <TiTick color='green' size={"30px"} />
                    <p>AI Analysis to ensure quality feedback</p>
                  </div>
                  <div className='flex flex-row'>
                    <TiTick color='green' size={"30px"} />
                    <p>Point System maintaing quality</p>
                  </div>
                  <div className='flex flex-row'>
                    <TiTick color='green' size={"30px"} />
                    <p>Anonymity for employees</p>
                  </div>
                </div>
                <div className='flex justify-center'>
                  <button onClick={signIn} className='mt-5 bg-pbutton-500 text-white p-3 md:px-5 md:py-3 rounded-xl  min-w-full md:min-w-min'>
                    Get Started
                  </button>
                </div>
              </div>

            </div>


          </section>
          <div className='bg-pbutton-500 px-10 pt-10 mt-10 text-white pb-10 flex flex-row justify-between gap-5'>
            
            <div className='flex flex-col font-light'>
              <h2 className='text-l font-bold'>Contact</h2>
              <Link className='text-xl' href='mailto:hello@happypeers.work'>hello@happypeers.work</Link>
            </div>

            <div className='md:block hidden'>
              <p className='font-light'>Powered by</p>
              <a href="#"><p className='text-xl md:text-2xl font-bold'>onsheets.io</p></a>
            </div>
            <div className='flex flex-col font-light'>
              <h2 className='text-l font-bold'>Boring</h2>
              <Link href='/privacy-policy'>Privacy Policy</Link>
              <Link href='/terms-conditions'>Terms and Conditions</Link>
            </div>
          </div>
        </main>
      </AppDataContextProvider>

    </>
  )
}
