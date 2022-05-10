import React from "react"
import UserView from "../layouts/UserLayout/UserView"
import UserLayout from "../layouts/UserLayout"
import SEO from "../components/util/SEO"

const MyGroupsPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | Groups" />
         <UserView path="/groups" />
      </UserLayout>
   )
}
export default MyGroupsPage
