import Loader, { showError, showSuccess } from '@/components/Loader'
import { SelfAxiosClient } from '@/configs/axios'
import { firebaseAuth, signinWithGoogle } from '@/configs/firebase'
import { AppDataContextProvider } from '@/context'
import { initAuth } from '@/initAuth'
import User from '@/models/user'
import { EyeInvisibleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import { AuthAction, useAuthUser, withAuthUser } from 'next-firebase-auth'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { BsFillBuildingFill, BsPersonAdd } from "react-icons/bs"
import { FaPeopleArrows } from "react-icons/fa"
import { GiPlantWatering } from "react-icons/gi"
import { TiTick } from "react-icons/ti"
import { PublicDomains } from './api/public_email_domains'



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
  const TopSectionEmployer = "employer"
  const TopSectionEmployee = "employee"
  const fbUser = useAuthUser()
  const [isLoading, setIsLoading] = useState(false)
  const [topSection, setTopSection] = useState(TopSectionEmployer)
  const [isSubmitHRModelOpen, setIsSubmitHRModelOpen] = useState(false)
  const [hrEmail, setHrEmail] = useState("")
  const [loaderMessage, setLoaderMessage] = useState("")
  const router = useRouter()
  async function signIn() {
    setLoaderMessage("Signing In")
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

  function addHrEmail() {
    let e = hrEmail.trim()
    if (e.length == 0) {
      showError("Add an email to submit")
      return
    }
    let domain = e.split("@")[1]
    if(PublicDomains.has(domain)){
      showError("Please share a work email")
      return
    }
    setLoaderMessage("Submitting Email")
    setIsLoading(true)
    SelfAxiosClient.post("/add-email-lead", {
      email: e
    }).then((_) => {
      setIsLoading(false)
      setIsSubmitHRModelOpen(false)
      showSuccess("Thank you! We will reachout shortly to "+e)
    }).catch(err => {
      setIsLoading(false)
      showError("Could not submit the email. Please try again.")
    })
  }
  function renderTopSection() {
    if (topSection == TopSectionEmployer) {
      return <>
        <h1 className='text-5xl font-bold '>Innovative Employee Feedback System</h1>
        <p className='text-xl font-light leading-7 text-gray-700 mt-4'>Boost your employee  by addressing internal issues faster</p>
      </>
    } else {
      return <>
        <p className='text-5xl font-bold '>Safe space to share feedbacks</p>
        <p className='text-xl font-light leading-7 text-gray-700 mt-4'>Share feedbacks with higher authories anonymously</p>
      </>
    }
  }

  function renderSubmitHrModel() {
    return <Modal title="Share HR email to setup HappyPeers" centered open={isSubmitHRModelOpen}
      onCancel={() => {
        setIsSubmitHRModelOpen(false)
      }}
      footer={<div className="flex flex-row-reverse items-end gap-5">
        <button onClick={() => {
          addHrEmail()
        }} className="bg-pbutton-500 text-white rounded-lg py-3 px-4 text-sm"><span className="flex flex-row items-baseline gap-2"><BsPersonAdd />Submit Email</span></button>
        <button onClick={() => {
          setIsSubmitHRModelOpen(false)
        }} className="text-primary-500 rounded-lg py-3 px-4 text-sm">Cancel</button>
      </div>}
    >
      <div className='flex flex-col gap-3'>
        <p>Don&apos;t worry, we will not share any information regarding you while reaching out to the HR</p>
        <input type='email' value={hrEmail} onChange={(e) => {
          setHrEmail(e.target.value)
        }} className="border min-w-full py-2 px-5 bg-white rounded-lg" placeholder='Enter HR email' />

      </div>

    </Modal>
  }

  return (
    <>
      {
        isLoading ? <Loader message="" /> : <></>
      }
      {
        isSubmitHRModelOpen ? renderSubmitHrModel() : <></>
      }

      <AppDataContextProvider>
        <main className="min-h-screen min-w-full bg-grey-500 text-primary-500 font-inter">
          <nav className='flex  items-center p-4 gap-3 justify-between'>
            <p className='font-bold  text-2xl'>happypeers.work</p>
            <button onClick={signIn} className='border-2 border-gray-200 p-2 rounded-lg'>Login</button>
          </nav>
          <section className='px-5 text-center mt-20'>
            <div className='mt-20 flex flex-col gap-2 items-center justify-center text-center px-2'>
              <a href="https://www.producthunt.com/posts/happypeers?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-happypeers" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=403646&theme=light" alt="HappyPeers - Anonymous&#0032;peer&#0032;feedback&#0032;to&#0032;improve&#0032;your&#0032;workspace | Product Hunt" width={250} height={22} /></a>
              <div className='mt-5'>
                <div className='inline-flex items-center gap-3 border  rounded-full px-1 py-1'>
                  <div className={topSection === TopSectionEmployer ? "cursor-pointer px-3 py-2  bg-pbutton-500 text-white rounded-full" : "cursor-pointer px-3 py-2 text-primary-500 font-light"} onClick={() => {
                    setTopSection(TopSectionEmployer)
                  }}>
                    <p>For Organisations</p>
                  </div>
                  <div className={topSection === TopSectionEmployee ? "cursor-pointer px-3 py-2  bg-pbutton-500 text-white rounded-full" : "cursor-pointer px-3 py-2 text-primary-500 font-light"} onClick={() => {
                    setTopSection(TopSectionEmployee)
                  }}>
                    <p>For Employees</p>
                  </div>

                </div>
                <div className='mt-8 transition-all'>
                  {renderTopSection()}
                </div>
              </div>
            </div>
            <div className='flex flex-col md:flex-row gap-5 mt-8 md:justify-center'>
              <button onClick={signIn} className='bg-pbutton-500 py-3 md:px-5 md:py-3 text-white rounded-2xl '>{
                topSection === TopSectionEmployer ? "Setup for your organisation" : "Have us? Submit Feedback"
              }</button>
              <div className='border-2 border-gray-200 py-3 md:px-5 md:py-3 text-primary-500 font-semibold rounded-2xl' onClick={() => {
                topSection === TopSectionEmployer ? router.push("#pricing-section") : setIsSubmitHRModelOpen(true)
              }}><button>{topSection === TopSectionEmployer ? "See Pricing" : "Want us there? Share HR email with us"}</button></div>
            </div>
            {/* <div className='mt-8 flex flex-col items-center gap-3 text-center'>
              <div className='flex flex-row -space-x-1.5'>
                <img className='ring ring-gray-200 rounded-full h-12 w-12' src='../happy_man.jpg' />
                <img className='ring ring-gray-200 rounded-full h-12 w-12' src='../happy_woman.avif' />

              </div>
              <p className='font-thin px-5'><span className='font-semibold'>Isn't your feedback sessions with the team bringing out issues?</span> Happy Peers is for you.</p>
            </div> */}
            <div className='flex flex-row justify-center'>
              <img alt='a preview of the dashboard of Happy Peers for employee management system' className='mt-6  max-w-full md:max-w-screen-xl' src="../console_preview.png" />
            </div>
            <div className='mt-12 flex flex-col gap-4 items-center'>
              <h3 className='text font-light'> Know internal issues before it is posted online</h3>
              <h2 className='text-4xl font-bold'>Anonymous feedbacks for atmost honesty</h2>
              <p className='text-lg font-light px-6 max-w-screen-sm'>HappyPeers is an innovative feedback system for your organisation that encourages people to speak up by maintaining anonymity, identify points of improvement for individuals and organisation for a happier workspace</p>
              <div className='grid grid-flow-row gap-y-16 px-5 md:px-10 lg:px-20 md:pb-16 mt-20 lg:mt-20'>
                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div className='block md:hidden'>
                    <img alt='HappyPeers promises complete anonimity to all of its users' src='../complete_anonymity.png' />
                  </div>

                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <EyeInvisibleOutlined className='text-4xl flex-1' />
                    </div>
                    <h1 className='text-2xl'>Complete Anonymity</h1>
                    <p className='font-light text-lg'>The identity of the reviewer is never shared. We will not share the identity with anyone, even on request from the employer.</p>
                  </div>

                  <div className='md:block hidden'>
                    <img alt='HappyPeers promises complete anonimity to all of its users' src='../complete_anonymity.png' />
                  </div>

                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div>
                    <img alt='Users can only submit constructive feedbacks. This is ensured by our Nice Talk Engine, Powered by AI' className='max-w-full' src='../only_constructive.png' />
                  </div>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <GiPlantWatering className='text-4xl flex-1' />
                    </div>
                    <h2 className='text-2xl'>Only Constructive Feedbacks</h2>
                    <h3 className='font-light text-lg'>All feedbacks submitted are ensured to be constructive using our NiceTalk engine.</h3>
                  </div>
                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='block md:hidden'>
                      <img alt='Feedbacks can only be submitted by consuming a point.' className='max-w-full' src='../point_based_review_system.png' />
                    </div>

                    <div className='border-2 p-2 rounded-xl'>
                      <FaPeopleArrows className='text-4xl flex-1' />
                    </div>
                    <h2 className='text-2xl'>Point Based Peer Review System</h2>
                    <h3 className='font-light text-lg'>Every employee can submit 2 reviews monthly. If the previous comments are marked as constructive, their point is credited back to contribute more.</h3>
                  </div>
                  <div className='hidden md:block'>
                    <img alt='Feedbacks can only be submitted by consuming a point.' className='max-w-full' src='../point_based_review_system.png' />
                  </div>
                </div>

                <div className='grid grid-flow-row md:grid-flow-row md:grid-cols-2 gap-3 md:gap-10'>
                  <div>
                    <img alt='Feedbacks are available inside your organisation. Nothing goes out. ' className='max-w-full' src='../private_feedbacks.png' />
                  </div>
                  <div className='flex flex-col items-start gap-4 text-start justify-center'>
                    <div className='border-2 p-2 rounded-xl'>
                      <BsFillBuildingFill className='text-4xl flex-1' />
                    </div>
                    <h2 className='text-2xl'>Feedbacks never leave your organization</h2>
                    <h3 className='font-light text-lg'>Every feedback submitted within your organization is never shared publically. They are right in your inbox for you to take the right actions.</h3>
                  </div>
                </div>

              </div>
            </div>
            <div id="pricing-section" className='mt-20 flex flex-col items-center justify-center'>
              <h2 className='text-4xl font-bold '>Pricing</h2>
              <p className='mt-7'><span className='text-primary-500 text-2xl font-bold'>FREE</span></p>
              <p className='font-light text-sm'>Early-Bird Offer</p>
              <div className='rounded-xl mt-5  shadow bg-white p-5 border border-gray-200 flex flex-col text-start md:text-center lg:text-center max-w-screen-md md:max-w-screen-xl'>
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
              <p className='text-l font-bold'>Contact</p>
              <Link className='text-xl' href='mailto:hello@happypeers.work'>hello@happypeers.work</Link>
            </div>

            <div className='md:block hidden'>
              <p className='font-light'>Powered by</p>
              <a target="_blank" href="https://onsheets.io"><p className='text-xl md:text-2xl font-bold'>onsheets.io</p></a>
            </div>
            <div className='flex flex-col font-light'>
              <p className='text-l font-bold'>Boring</p>
              <Link href='/privacy-policy'>Privacy Policy</Link>
              <Link href='/terms-conditions'>Terms and Conditions</Link>
            </div>
          </div>
        </main>
      </AppDataContextProvider>

    </>
  )
}
