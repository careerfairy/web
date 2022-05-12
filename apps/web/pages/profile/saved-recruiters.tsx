import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"

const SavedRecruitersPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | Saved Recruiters" />
         <UserView currentPath="/profile/saved-recruiters" />
      </UserLayout>
   )
}

export default SavedRecruitersPage
