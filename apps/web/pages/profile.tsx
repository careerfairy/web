import React from "react"
import UserView from "../layouts/UserLayout/UserView"
import UserLayout from "../layouts/UserLayout"
import SEO from "../components/util/SEO"
import { useRouter } from "next/router"

const UserProfile = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | My Profile"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView path="/profile" />
      </UserLayout>
   )
}

export default UserProfile
