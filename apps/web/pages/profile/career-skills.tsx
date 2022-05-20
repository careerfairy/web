import React from "react"
import UserLayout from "../../layouts/UserLayout"
import SEO from "../../components/util/SEO"
import UserView from "../../layouts/UserLayout/UserView"

const CareerSkillsPage = () => {
   return (
      <UserLayout>
         <SEO title="CareerFairy | My Career Skills" />
         <UserView currentPath="/profile/career-skills" />
      </UserLayout>
   )
}

export default CareerSkillsPage
