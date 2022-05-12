import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"

const UserProfile = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | My Profile" />
         <UserView currentPath="/profile" />
      </UserLayout>
   )
}

export default UserProfile
