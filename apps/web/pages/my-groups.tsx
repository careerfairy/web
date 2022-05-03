import React from "react"
import UserView from "../components/views/profile/UserView"
import UserLayout from "../layouts/UserLayout"
import SEO from "../components/util/SEO"

const MyGroupsPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | My Profile" />
         <UserView path="/my-groups" />
      </UserLayout>
   )
}

export default MyGroupsPage
