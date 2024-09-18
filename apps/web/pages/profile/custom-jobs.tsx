import { useRouter } from "next/router"
import SEO from "../../components/util/SEO"
import UserLayout from "../../layouts/UserLayout"
import UserView from "../../layouts/UserLayout/UserView"

const CustomJobsPage = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | Jobs"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView currentPath="/profile/custom-jobs" />
      </UserLayout>
   )
}

export default CustomJobsPage
