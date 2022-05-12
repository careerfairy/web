import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"

const MyGroupsPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | Groups" />
         <UserView currentPath="/profile/groups" />
      </UserLayout>
   )
}
export default MyGroupsPage
