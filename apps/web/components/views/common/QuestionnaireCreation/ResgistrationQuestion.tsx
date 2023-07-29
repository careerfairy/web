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
import { convertDictToDocArray } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { sxStyles } from "types/commonTypes"
import { v4 as uuidv4 } from "uuid"
import { createAGroupQuestion } from "./createAGroupQuestion"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { createAGroupQuestionOption } from "./createAGroupQuestionOption"
import { convertArrayOfObjectsToDictionaryByProp } from "data/util/AnalyticsUtil"
import { Preview } from "@mui/icons-material"

type QuestionDeleteParams = {
   groupQuestionId: Pick<GroupQuestion, "id">
}

type Props = {
   initialValues?: GroupQuestion
   editing?: boolean
}

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
      display: "flex",
      padding: "16px",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "24px",
      alignSelf: "stretch",
      borderRadius: "10px",
      border: "1px solid #EBEBEB",
      background: "#FEFEFE",
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

const RegistrationQuestion: React.FC<Props> = ({
   initialValues,
   editing,
}): ReactElement => {
   const { group } = useGroup()
   const [isNew, setIsNew] = useState(!editing)
   const [inputMode, setInputMode] = useState(false)

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
      debugger
      try {
         if (isNew) {
            groupRepo.addNewGroupQuestion(group.id, { ...question })
         } else {
            groupRepo.updateGroupQuestion(group.id, { ...question })
         }

         setInputMode(false)
      } catch (e) {
         console.log(e)
         // errorLogAndNotify(e)
      }
   }

   return (
      <Formik
         initialValues={localGroupQuestion}
         onSubmit={handleSubmit}
         enableReinitialize
      >
         {({ handleReset, values, setFieldValue }) => (
            <form onSubmit={() => handleSubmit(values)}>
               <Stack>
                  <Box>
                     <QuestionName
                        editing={inputMode}
                        value={values.name}
                        setValue={(value) => setFieldValue(`name`, value)}
                     />
                     {!inputMode && (
                        <Button onClick={(prev) => setInputMode(true)}>
                           <Edit2 />
                        </Button>
                     )}
                  </Box>
                  {Object.values(values.options).map(
                     (option: GroupQuestionOption, cardinal) => (
                        <QuestionOption
                           cardinal={cardinal}
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
                  <Button
                     sx={styles.addOptionButton}
                     onClick={() => handleAddOption(values, setFieldValue)}
                  >
                     <PlusCircle />
                     <Typography variant="button">Add an option</Typography>
                  </Button>
                  <Button
                     onClick={() =>
                        deleteQuestion({ groupQuestionId: values.id })
                     }
                  >
                     remove question
                  </Button>
                  <Button onClick={() => handleSubmit(values)}>Save</Button>
               </Stack>
            </form>
         )}
      </Formik>
   )
}

export default RegistrationQuestion
