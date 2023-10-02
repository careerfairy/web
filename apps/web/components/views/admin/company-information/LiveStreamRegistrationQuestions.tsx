import QuestionnaireCreation from "components/views/admin/company-information/QuestionnaireCreation/QuestionnaireCreation"
import { useGroup } from "layouts/GroupDashboardLayout"
import React from "react"
import SectionComponent from "./SectionComponent"

const [title, description] = [
   "Live stream registration questions",
   `Create the questions that are going to be answered by students
   when joining one of your live streams! These questions can always
   be edited.`,
]

const LiveStreamRegistrationQuestions = () => {
   const { groupQuestions } = useGroup()

   return (
      <SectionComponent title={title} description={description}>
         <QuestionnaireCreation groupQuestions={groupQuestions} />
      </SectionComponent>
   )
}

export default LiveStreamRegistrationQuestions
