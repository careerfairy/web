import React, { useCallback, useMemo, useState } from "react"
import { Button, Container, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"
import { Formik } from "formik"
import * as yup from "yup"
import SaveChangesButton from "./SaveChangesButton"
import PollCreationModal from "components/views/streaming/LeftMenu/categories/polls/poll-creation-modal/PollCreationModal"
import QuestionnaireCreation from "components/views/common/QuestionnaireCreation/QuestionnaireCreation"
import { useGroup } from "layouts/GroupDashboardLayout"
import { groupRepo } from "data/RepositoryInstances"
import { GroupQuestion } from "@careerfairy/shared-lib/groups"

const LiveStreamRegistrationQuestions = () => {
   const { groupQuestions } = useGroup()

   const initialValues = useMemo(
      () => ({
         questions: groupQuestions,
      }),
      [groupQuestions]
   )

   return (
      <Box sx={Styles.section}>
         <div className="section-left_column">
            <h3>Live stream registration questions</h3>
            <p>
               Create the questions that are going to be answered by students
               when joining one of your live streams! These questions can always
               be edited.
            </p>
         </div>
         <Box sx={{ gap: "12px", width: "-webkit-fill-available" }}>
            <QuestionnaireCreation initialData={initialValues} />
         </Box>
      </Box>
   )
}

export default LiveStreamRegistrationQuestions
