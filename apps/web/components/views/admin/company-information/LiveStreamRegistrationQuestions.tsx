import React, { useMemo } from "react"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import QuestionnaireCreation from "components/views/common/QuestionnaireCreation/QuestionnaireCreation"
import { useGroup } from "layouts/GroupDashboardLayout"
import LeftColumn from "./LeftColumn"

const LiveStreamRegistrationQuestions = () => {
   const { groupQuestions } = useGroup()

   const initialValues = useMemo(
      () => ({
         questions: groupQuestions,
      }),
      [groupQuestions]
   )

   const [title, description] = [
      "Live stream registration questions",
      `Create the questions that are going to be answered by students
      when joining one of your live streams! These questions can always
      be edited.`,
   ]
   return (
      <Box sx={Styles.section}>
         <LeftColumn title={title} description={description} />
         <Box sx={{ gap: "12px", width: "-webkit-fill-available" }}>
            <QuestionnaireCreation initialData={initialValues} />
         </Box>
      </Box>
   )
}

export default LiveStreamRegistrationQuestions
