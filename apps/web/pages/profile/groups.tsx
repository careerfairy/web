import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"
import { useRouter } from "next/router"

const MyGroupsPage = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | Groups"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView currentPath="/profile/groups" />
      </UserLayout>
   )
}
export default MyGroupsPage
