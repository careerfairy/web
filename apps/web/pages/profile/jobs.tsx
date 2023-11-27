import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"
import { useRouter } from "next/router"

const MyJobsPage = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | Index"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView currentPath="/profile/jobs" />
      </UserLayout>
   )
}
export default MyJobsPage
