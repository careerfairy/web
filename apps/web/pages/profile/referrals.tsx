import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"

const ReferralsPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | Referrals" />
         <UserView currentPath="/profile/referrals" />
      </UserLayout>
   )
}

export default ReferralsPage
