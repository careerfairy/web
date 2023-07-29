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
   const { group, groupQuestions } = useGroup()
   const [values, setValues] = useState(groupQuestions)

   const initialValues = useMemo(
      () => ({
         questions: groupQuestions,
      }),
      [groupQuestions]
   )
   const handleSubmit = useCallback(
      async ({ questions }: { questions: GroupQuestion[] }) => {
         debugger
         try {
            const promises = []
            const initialQuestionsIds = groupQuestions.map(
               (question) => question.id
            )
            const questionsToBeCreated = []
            const questionsToBeupdated = []
            questions.forEach((question) => {
               if (!initialQuestionsIds.includes(question.id)) {
                  questionsToBeCreated.push({ ...question })
               } else {
                  questionsToBeupdated.push({ ...question })
               }
            })

            if (questionsToBeCreated.length > 0) {
               promises.push(
                  ...questionsToBeCreated.map(
                     ({ options, name, questionType }) => {
                        return groupRepo.addNewGroupQuestion(group.id, {
                           options,
                           name,
                           questionType,
                        })
                     }
                  )
               )
            }
            if (questionsToBeupdated) {
               promises.push(
                  ...questionsToBeupdated.map((question) => {
                     return groupRepo.updateGroupQuestion(group.id, question)
                  })
               )
            }
            await Promise.all(promises)
            console.log("saved")
         } catch (e) {
            console.log(e)
            // errorLogAndNotify(e)
         }
      },
      [values, setValues]
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

         <QuestionnaireCreation
            initialData={initialValues}
            handleSubmit={handleSubmit}
         />
      </Box>
   )
}

export default LiveStreamRegistrationQuestions
