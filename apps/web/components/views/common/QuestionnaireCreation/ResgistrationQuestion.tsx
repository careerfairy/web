import { Box, Button, Stack, Typography } from "@mui/material"
import SaveChangesButton from "components/views/admin/company-information/SaveChangesButton"
import { Edit2, PlusCircle, Save } from "react-feather"
import QuestionOption from "./QuestionOption"
import {
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/groups"
import { ReactElement, useEffect, useState } from "react"
import { Form, Formik } from "formik"
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import QuestionName from "./QuestionName"
import { sxStyles } from "types/commonTypes"
import { v4 as uuidv4 } from "uuid"
import { createAGroupQuestionOption } from "./createAGroupQuestionOption"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"

const getInitialGroupQuestion = (
   groupQuestion?: GroupQuestion
): GroupQuestion => {
   if (groupQuestion) {
      return {
         ...groupQuestion,
      }
   }
   return {
      id: uuidv4(),
      name: "",
      options: {},
      hidden: false,
      questionType: "custom",
   }
}

const styles = sxStyles({
   form: {
      width: "100%",
   },
   stack: {
      color: "#212020",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: 1,
      alignSelf: "stretch",
      borderRadius: "10px",
      border: "1px solid #EBEBEB",
      background: "#FEFEFE",
      width: "-webkit-fill-available",
      "#registration-question-name-field": {
         display: "flex",
         alignItems: "flex-end",
         width: "-webkit-fill-available",
         m: 1,
         justifyContent: "space-between",
      },
      "#registration-question-action-buttons": {
         width: "-webkit-fill-available",
      },
   },
   addOptionButton: {
      display: "flex",
      padding: "12px 0px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      alignSelf: "stretch",
      borderRadius: "43px",
      border: "1.5px solid #6749EA",
      color: "#6749EA",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
   },
   actionButtons: {
      display: "flex",
      width: "-webkit-fill-available",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      mt: "16px",
      mb: "16px",
   },
   removeOptionButton: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "32px",
      border: "1px solid #FF4A4A",
      color: "#FF4A4A",
      marginRight: "20px",
      textTransform: "none",
   },
   addNewQuestionButton: {
      display: "flex",
      height: "74px",
      padding: "28px",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      alignSelf: "stretch",
      borderRadius: "8px",
      border: "1px solid #ECECEC",
      background: "#FEFEFE",
      color: "#D9D9D9",
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "16px",
   },
})

type QuestionDeleteParams = {
   groupQuestionId: Pick<GroupQuestion, "id">
}

type Props = {
   initialValues?: GroupQuestion
   inputMode?: boolean
   setInputMode?: (value: boolean) => void
   onRemove?: (questionId: Pick<GroupQuestion, "id">) => void
}

const RegistrationQuestion: React.FC<Props> = ({
   initialValues,
   inputMode,
   setInputMode,
   onRemove,
}): ReactElement => {
   const { group } = useGroup()
   const [isNew, setIsNew] = useState(true)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const localGroupQuestion = getInitialGroupQuestion(initialValues)

   useEffect(() => {
      if (
         initialValues &&
         Boolean(initialValues.name) &&
         initialValues.name !== ""
      ) {
         setIsNew(false)
      }
   }, [initialValues])

   const deleteQuestion = async ({ groupQuestionId }: QuestionDeleteParams) => {
      if (!isNew) {
         await groupRepo.deleteGroupQuestion(
            group.id,
            groupQuestionId.toString()
         )
      }
      return onRemove(groupQuestionId)
   }

   const handleAddOption = (question, setFieldValue) => {
      const newOption = createAGroupQuestionOption()
      const newOptions = { ...question.options }
      newOptions[newOption.id] = newOption
      setFieldValue("options", newOptions)
   }

   const handleSubmit = (question): void => {
      try {
         if (isNew) {
            groupRepo.addNewGroupQuestion(group.id, { ...question })
            successNotification("New Question added")
         } else {
            successNotification("Question updated")
            groupRepo.updateGroupQuestion(group.id, { ...question })
         }

         setInputMode(false)
      } catch (e) {
         errorNotification(e, "An error has occured")
      }
   }

   return (
      <Formik
         initialValues={localGroupQuestion}
         onSubmit={handleSubmit}
         enableReinitialize
      >
         {({ dirty, values, setFieldValue }) => (
            <Form style={styles.form}>
               <Stack sx={styles.stack}>
                  <Box id="registration-question-name-field">
                     <QuestionName
                        editing={inputMode}
                        value={values.name}
                        setValue={(value) => setFieldValue(`name`, value)}
                     />
                     {!inputMode && (
                        <Button onClick={() => setInputMode(true)}>
                           <Edit2 color="#A0A0A0" width={16} />
                        </Button>
                     )}
                  </Box>
                  {Object.values(values.options).map(
                     (option: GroupQuestionOption, cardinal) => (
                        <QuestionOption
                           key={`${values.id}${cardinal}`}
                           cardinal={cardinal + 1}
                           editing={inputMode}
                           value={option.name}
                           setValue={(newValue) =>
                              setFieldValue(
                                 `options.${option.id}.name`,
                                 newValue
                              )
                           }
                        />
                     )
                  )}
                  {inputMode && (
                     <Stack id="registration-question-action-buttons">
                        <Button
                           sx={styles.addOptionButton}
                           onClick={() =>
                              handleAddOption(values, setFieldValue)
                           }
                        >
                           <PlusCircle />
                           <Typography variant="button">
                              Add an option
                           </Typography>
                        </Button>
                        <Box sx={styles.actionButtons}>
                           <Button
                              sx={styles.removeOptionButton}
                              onClick={() =>
                                 deleteQuestion({ groupQuestionId: values.id })
                              }
                           >
                              Remove question
                           </Button>
                           <SaveChangesButton
                              icon={<Save color={dirty ? "#FFF" : "#BBBBBB"} />}
                              active={dirty}
                              onClick={() => dirty && handleSubmit(values)}
                           >
                              Save
                           </SaveChangesButton>
                        </Box>
                     </Stack>
                  )}
               </Stack>
            </Form>
         )}
      </Formik>
   )
}

export default RegistrationQuestion
