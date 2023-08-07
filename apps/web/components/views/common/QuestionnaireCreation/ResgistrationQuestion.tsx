import { Box, Button, Stack, Typography } from "@mui/material"
import SaveChangesButton from "components/views/admin/company-information/SaveChangesButton"
import { Edit2, PlusCircle } from "react-feather"
import QuestionOption from "./QuestionOption"
import {
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/groups"
import { ReactElement, useEffect, useState } from "react"
import { Form, Formik, useFormik } from "formik"
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import QuestionName from "./QuestionName"
import { sxStyles } from "types/commonTypes"
import { v4 as uuidv4 } from "uuid"
import { createAGroupQuestion } from "./createAGroupQuestion"
import { createAGroupQuestionOption } from "./createAGroupQuestionOption"
import { errorLogAndNotify } from "util/CommonUtil"

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
   removeOptionButton: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      borderRadius: "32px",
      border: "1px solid #FF4A4A",
      color: "#FF4A4A",
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
   setInputMode?: (values: boolean) => void
}

const RegistrationQuestion: React.FC<Props> = ({
   initialValues,
   inputMode,
   setInputMode,
}): ReactElement => {
   const { group } = useGroup()
   const [isNew, setIsNew] = useState(!inputMode)

   const [localGroupQuestion, setLocalGroupQuestion] = useState<GroupQuestion>(
      getInitialGroupQuestion(initialValues)
   )

   useEffect(() => {
      if (
         initialValues &&
         Boolean(initialValues.name) &&
         initialValues.name !== ""
      ) {
         setIsNew(false)
      }
   }, [initialValues])

   const handleValuesReset = (): GroupQuestion => {
      return createAGroupQuestion()
   }

   const deleteQuestion = async ({ groupQuestionId }: QuestionDeleteParams) => {
      await groupRepo.deleteGroupQuestion(group.id, groupQuestionId.toString())
      return setInputMode(false)
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
         } else {
            groupRepo.updateGroupQuestion(group.id, { ...question })
         }

         setInputMode(false)
      } catch (e) {
         errorLogAndNotify(e)
      }
   }

   return (
      <Formik
         initialValues={localGroupQuestion}
         onSubmit={handleSubmit}
         enableReinitialize
      >
         {({ values, setFieldValue }) => (
            <form onSubmit={() => handleSubmit(values)}>
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
                        <Box
                           sx={{
                              display: "flex",
                              width: "-webkit-fill-available",
                              alignItems: "flex-end",
                              justifyContent: "flex-end",
                              mb: "16px",
                           }}
                        >
                           <Button
                              sx={styles.removeOptionButton}
                              onClick={() =>
                                 deleteQuestion({ groupQuestionId: values.id })
                              }
                           >
                              remove question
                           </Button>
                           <SaveChangesButton
                              onClick={() => handleSubmit(values)}
                           >
                              Save
                           </SaveChangesButton>
                        </Box>
                     </Stack>
                  )}
               </Stack>
            </form>
         )}
      </Formik>
   )
}

export default RegistrationQuestion
