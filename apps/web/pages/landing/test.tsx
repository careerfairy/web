import Header from "../../components/cms/landing-page/Header"
import UpcomingLivestreams from "../../components/cms/landing-page/UpcomingLivestreams"
import MarketingSignUp from "../../components/cms/landing-page/MarketingSignUp"
import GeneralLayout from "../../layouts/GeneralLayout"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

const Test = () => {
   const dispatch = useDispatch()

   useEffect(() => {
      dispatch(actions.inLandingPage())

      return () => {
         dispatch(actions.outOfLandingPage())
      }
   }, [])

   return (
      <GeneralLayout>
         <Header
            title={"This is the title"}
            subTitle={"this is the subtitle"}
         />
         <UpcomingLivestreams fieldsOfStudy={[""]} />
         <MarketingSignUp />
      </GeneralLayout>
   )
}

export default Test
