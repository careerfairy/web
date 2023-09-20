import React, { useMemo } from "react"
import QuestionnaireCreation from "components/views/common/QuestionnaireCreation/QuestionnaireCreation"
import { useGroup } from "layouts/GroupDashboardLayout"
import SectionComponent from "./SectionComponent"

const [title, description] = [
   "Live stream registration questions",
   `Create the questions that are going to be answered by students
   when joining one of your live streams! These questions can always
   be edited.`,
]

const LiveStreamRegistrationQuestions = () => {
   const { groupQuestions } = useGroup()
   console.log(groupQuestions)
   const initialValues = useMemo(
      () => ({
         questions: groupQuestions,
      }),
      [groupQuestions]
   )

   return (
      <SectionComponent title={title} description={description}>
         <QuestionnaireCreation initialData={initialValues} />
      </SectionComponent>
   )
}

export default LiveStreamRegistrationQuestions
