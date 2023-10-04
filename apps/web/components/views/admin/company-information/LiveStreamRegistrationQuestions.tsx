import QuestionnaireCreation from "components/views/admin/company-information/QuestionnaireCreation/QuestionnaireCreation"
import { useGroup } from "layouts/GroupDashboardLayout"
import SectionComponent from "./SectionComponent"
import { useMemo } from "react"

const [title, description] = [
   "Live stream registration questions",
   `Create the questions that are going to be answered by students
   when joining one of your live streams! These questions can always
   be edited.`,
]

const LiveStreamRegistrationQuestions = () => {
   const { groupQuestions, questionsLoaded } = useGroup()

   const initialQuestions = useMemo(
      () => groupQuestions,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [questionsLoaded]
   )

   return (
      <SectionComponent title={title} description={description}>
         {questionsLoaded ? (
            <QuestionnaireCreation groupQuestions={initialQuestions} />
         ) : null}
      </SectionComponent>
   )
}

export default LiveStreamRegistrationQuestions
