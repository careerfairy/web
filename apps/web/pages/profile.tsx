import React from "react"
import UserView from "../components/views/profile/UserView"
import UserLayout from "../layouts/UserLayout"
import SEO from "../components/util/SEO"

const UserProfile = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | My Profile" />
         <UserView path="/profile" />
      </UserLayout>
   )
}

export default UserProfile
