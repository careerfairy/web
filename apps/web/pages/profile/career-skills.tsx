import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"
import { useRouter } from "next/router"

const CareerSkillsPage = () => {
   const { pathname } = useRouter()
   return (
      <UserLayout>
         <SEO
            title="CareerFairy | My Career Skills"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <UserView currentPath="/profile/career-skills" />
      </UserLayout>
   )
}

export default CareerSkillsPage
