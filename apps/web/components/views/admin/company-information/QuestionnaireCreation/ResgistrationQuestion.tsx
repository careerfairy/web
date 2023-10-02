import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { LoadingButton } from "@mui/lab"
import { Box, Button, IconButton, Stack, Typography } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik, FormikHelpers } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, ReactElement, useEffect, useState } from "react"
import { Trash2 as DeleteIcon, Edit2, PlusCircle, Save } from "react-feather"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import { BrandedTextFieldField } from "../../../common/inputs/BrandedTextField"
import QuestionOption from "./QuestionOption"
import { createAGroupQuestionOption } from "./QuestionaireCreationUtils"

const styles = sxStyles({
   form: {
      width: "100%",
   },
   stack: {
      borderRadius: 2.5,
      border: "1px solid #EBEBEB",
      background: "white",
      position: "relative",
   },
   addOptionButton: {
      textTransform: "none",
      mx: 2,
   },
   actionButtons: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      p: 2,
   },
   btn: {
      textTransform: "none",
   },
   deleteBtn: {
      mr: "auto",
   },
   options: {
      color: "#212020",
      fontWeight: 600,
      fontSize: "18px",
   },
   editIcon: {
      position: "absolute",
      p: 1,
      top: 0,
      right: 0,
   },
})

type Props = {
   initialValues?: GroupQuestion
   inputMode: boolean
   setInputMode: (value: boolean) => void
   onRemove: (questionId: string) => void
   onCreated: (tempId: string, newQuestion: GroupQuestion) => void
}

const RegistrationQuestion: FC<Props> = ({
   initialValues,
   inputMode,
   setInputMode,
   onRemove,
   onCreated,
}): ReactElement => {
   const { group } = useGroup()
   const [isNew, setIsNew] = useState(true)
   const [isDeleting, setIsDeleting] = useState(false)

   const { successNotification, errorNotification } = useSnackbarNotifications()

   useEffect(() => {
      if (
         initialValues &&
         Boolean(initialValues.name) &&
         initialValues.name !== ""
      ) {
         setIsNew(false)
      }
   }, [initialValues])

   const handleRemoveQuestion = async (groupQuestionId: string) => {
      if (!isNew) {
         try {
            setIsDeleting(true)
            await groupRepo.deleteGroupQuestion(group.id, groupQuestionId)
            successNotification("Question removed")
         } catch (e) {
            errorNotification(e, "An error has occured")
         } finally {
            setIsDeleting(false)
         }
      }
      onRemove(groupQuestionId)
   }

   const onSubmit = async (
      values: FormValues,
      { resetForm }: FormikHelpers<FormValues>
   ): Promise<void> => {
      try {
         if (isNew) {
            const newQuestion = await groupRepo.addNewGroupQuestion(
               group.id,
               values
            )
            resetForm({ values: newQuestion }) // Reset the form values
            onCreated(initialValues.id, newQuestion)
            successNotification("New Question added")
         } else {
            await groupRepo.updateGroupQuestion(group.id, values)
            resetForm({ values }) // Reset the form values
            successNotification("Question updated")
         }

         setIsNew(false)
         setInputMode(false)
      } catch (e) {
         errorNotification(e, "An error has occured")
      }
   }

   const handleAddOption = (
      question: GroupQuestion,
      setFieldValue: FormikHelpers<FormValues>["setFieldValue"]
   ) => {
      const newOption = createAGroupQuestionOption()
      const newOptions = { ...question.options }
      newOptions[newOption.id] = newOption
      setFieldValue("options", newOptions)
   }

   return (
      <Formik<FormValues>
         initialValues={initialValues}
         onSubmit={onSubmit}
         validationSchema={validationSchema}
         enableReinitialize
      >
         {({ values, setFieldValue, dirty, isSubmitting, handleSubmit }) => {
            return (
               <Form style={styles.form}>
                  <Stack sx={styles.stack}>
                     <Box p={2} pb={0.75}>
                        {inputMode ? (
                           <BrandedTextFieldField
                              label="Question"
                              placeholder="Insert your question here"
                              name={"name"}
                              fullWidth
                           />
                        ) : (
                           <>
                              <Typography sx={styles.options}>
                                 {values.name}
                              </Typography>
                              <Box sx={styles.editIcon}>
                                 <IconButton
                                    size="small"
                                    onClick={() => setInputMode(true)}
                                 >
                                    <Edit2 size="1rem" color="#A0A0A0" />
                                 </IconButton>
                              </Box>
                           </>
                        )}
                     </Box>
                     {Object.values(values.options).map((option, index) => (
                        <QuestionOption
                           key={`${values.id}${index}`}
                           cardinal={index + 1}
                           name={`options.${option.id}.name`}
                           editing={inputMode}
                           value={option.name}
                           lastItem={
                              Object.keys(values.options).length === index + 1
                           }
                           canDelete={index > 1}
                           onDelete={() => {
                              const canDelete = index > 1

                              if (canDelete) {
                                 const newOptions = { ...values.options }
                                 delete newOptions[option.id]
                                 setFieldValue("options", newOptions)
                              }
                           }}
                        />
                     ))}

                     {inputMode ? (
                        <Stack mt={1} width="100%">
                           <Button
                              sx={styles.addOptionButton}
                              startIcon={<PlusCircle />}
                              color="secondary"
                              variant="outlined"
                              onClick={() =>
                                 handleAddOption(values, setFieldValue)
                              }
                           >
                              Add an option
                           </Button>
                           <Box sx={styles.actionButtons}>
                              <LoadingButton
                                 endIcon={<DeleteIcon />}
                                 color="error"
                                 variant="outlined"
                                 size="small"
                                 loading={isDeleting}
                                 sx={[styles.btn, styles.deleteBtn]}
                                 onClick={() => handleRemoveQuestion(values.id)}
                              >
                                 Remove question
                              </LoadingButton>
                              <LoadingButton
                                 endIcon={<Save />}
                                 loading={isSubmitting}
                                 disabled={!dirty || isSubmitting}
                                 onClick={() => handleSubmit()}
                                 size="small"
                                 variant="contained"
                                 color="secondary"
                                 sx={styles.btn}
                              >
                                 Save
                              </LoadingButton>
                           </Box>
                        </Stack>
                     ) : null}
                  </Stack>
               </Form>
            )
         }}
      </Formik>
   )
}

type FormValues = GroupQuestion

const groupQuestionOptionSchema = Yup.object().shape({
   id: Yup.string().required(),
   name: Yup.string().required("Question option name is required"),
})

const validationSchema: Yup.SchemaOf<FormValues> = Yup.object().shape({
   id: Yup.string().required(),
   name: Yup.string().required("Question name is required"),
   hidden: Yup.boolean(),
   questionType: Yup.mixed<GroupQuestion["questionType"]>().oneOf([
      "levelOfStudy",
      "fieldOfStudy",
      "custom",
   ]),
   options: Yup.lazy((value) =>
      Yup.object(
         Object.keys(value).reduce((shape: any, key: string) => {
            shape[key] = groupQuestionOptionSchema
            return shape
         }, {})
      )
   ),
})

export default RegistrationQuestion
