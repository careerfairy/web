import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"
import { useRouter } from "next/router"

const SavedRecruitersPage = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | Saved Recruiters"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView currentPath="/profile/saved-recruiters" />
      </UserLayout>
   )
}

export default SavedRecruitersPage
