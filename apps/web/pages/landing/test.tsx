import Header from "../../components/cms/landing-page/Header"
import UpcomingLivestreams from "../../components/cms/landing-page/UpcomingLivestreams"
import MarketingSignUp from "../../components/cms/landing-page/MarketingSignUp"
import GeneralLayout from "../../layouts/GeneralLayout"

/**
 * Just for us to develop the UI while we don't have the hygraph cms setup
 */

const test = () => {
   return (
      <GeneralLayout>
         <Header />
         <UpcomingLivestreams />
         <MarketingSignUp />
      </GeneralLayout>
   )
}

export default test
