import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { LoadingButton } from "@mui/lab"
import { Box, Button, IconButton, Stack, Typography } from "@mui/material"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik, FormikHelpers } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import {
   FC,
   ReactElement,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { Trash2 as DeleteIcon, Edit2, PlusCircle, Save } from "react-feather"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import { BrandedTextFieldField } from "../../../common/inputs/BrandedTextField"
import QuestionOption from "./QuestionOption"
import { createAGroupQuestionOption } from "./QuestionaireCreationUtils"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import BaseStyles from "../BaseStyles"
import useIsMobile from "components/custom-hook/useIsMobile"

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
      p: 2,
   },
   btn: {
      textTransform: "none",
   },
   cancelBtn: {
      color: "text.secondary",
      mr: 1,
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
   onUpdated: (newQuestion: GroupQuestion) => void
}

const RegistrationQuestion: FC<Props> = ({
   initialValues,
   inputMode,
   setInputMode,
   onRemove,
   onCreated,
   onUpdated,
}): ReactElement => {
   const { group } = useGroup()

   const isMounted = useRef(true)
   const isMobile = useIsMobile()

   const [
      confirmDeleteQuestionDialogOpen,
      handleOpenConfirmDeleteQuestionDialogOpen,
      handleCloseConfirmDeleteQuestionDialogOpen,
   ] = useDialogStateHandler()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const [isDeleting, setIsDeleting] = useState(false)

   const isNew = initialValues.id.startsWith("temp-")

   useEffect(() => {
      return () => {
         isMounted.current = false
      }
   }, [])

   const handleRemoveQuestion = useCallback(async () => {
      if (!isNew) {
         try {
            setIsDeleting(true)
            await groupRepo.deleteGroupQuestion(group.id, initialValues.id)
            successNotification("Question removed")
            setIsDeleting(false)
         } catch (e) {
            errorNotification(e, "An error has occured")
            setIsDeleting(false)
         }
      }
      onRemove(initialValues.id)
   }, [
      errorNotification,
      group.id,
      initialValues.id,
      isNew,
      onRemove,
      successNotification,
   ])

   const handleClickRemoveQuestion = useCallback(() => {
      if (!isNew) {
         handleOpenConfirmDeleteQuestionDialogOpen()
      } else {
         handleRemoveQuestion()
      }
   }, [handleOpenConfirmDeleteQuestionDialogOpen, handleRemoveQuestion, isNew])

   const onSubmit = useCallback(
      async (
         values: FormValues,
         { resetForm }: FormikHelpers<FormValues>
      ): Promise<void> => {
         try {
            if (isNew) {
               const newQuestion = await groupRepo.addNewGroupQuestion(
                  group.id,
                  values
               )
               resetForm({ values: newQuestion })
               onCreated(values.id, newQuestion)
               successNotification("New Question added")
            } else {
               await groupRepo.updateGroupQuestion(group.id, values)

               setInputMode(false)
               resetForm({ values, isSubmitting: false })
               onUpdated(values)
               successNotification("Question updated")
            }
         } catch (e) {
            if (isMounted.current) {
               errorNotification(e, "An error has occured")
            }
         }
      },
      [
         errorNotification,
         group.id,
         isNew,
         onCreated,
         onUpdated,
         setInputMode,
         successNotification,
      ]
   )

   const handleAddOption = useCallback(
      (
         question: GroupQuestion,
         setFieldValue: FormikHelpers<FormValues>["setFieldValue"]
      ) => {
         const newOption = createAGroupQuestionOption()
         const newOptions = { ...question.options }
         newOptions[newOption.id] = newOption
         setFieldValue("options", newOptions)
      },
      []
   )

   const disableInputMode = useCallback(() => {
      if (isNew) {
         onRemove(initialValues.id)
      } else {
         setInputMode(false)
      }
   }, [initialValues.id, isNew, onRemove, setInputMode])

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Cancel",
         callback: handleCloseConfirmDeleteQuestionDialogOpen,
         variant: "text",
         color: "grey",
      }),
      [handleCloseConfirmDeleteQuestionDialogOpen]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Delete",
         callback: handleRemoveQuestion,
         variant: "contained",
         color: "error",
      }),
      [handleRemoveQuestion]
   )

   return (
      <Formik<FormValues>
         initialValues={initialValues}
         onSubmit={onSubmit}
         validationSchema={validationSchema}
         enableReinitialize
      >
         {({
            values,
            setFieldValue,
            dirty,
            isSubmitting,
            handleSubmit,
            isValid,
            resetForm,
         }) => (
            <Form style={styles.form}>
               {confirmDeleteQuestionDialogOpen ? (
                  <ConfirmationDialog
                     open={confirmDeleteQuestionDialogOpen}
                     handleClose={handleCloseConfirmDeleteQuestionDialogOpen}
                     title={"Delete question"}
                     description={`The question "${initialValues.name}" is being used. If you delete it, it will be removed from all the associated live streams.`}
                     icon={
                        <Box sx={BaseStyles.deleteIcon}>
                           <DeleteIcon />
                        </Box>
                     }
                     primaryAction={primaryAction}
                     secondaryAction={secondaryAction}
                  />
               ) : null}
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
                  {Object.values(values.options).map((option, index, arr) => {
                     const canDelete = arr.length > 2
                     return (
                        <QuestionOption
                           key={`${values.id}${index}`}
                           cardinal={index + 1}
                           name={`options.${option.id}.name`}
                           editing={inputMode}
                           value={option.name}
                           isInUse={
                              initialValues.options[option.id] !== undefined
                           }
                           lastItem={
                              Object.keys(values.options).length === index + 1
                           }
                           canDelete={canDelete}
                           onDelete={() => {
                              if (canDelete) {
                                 const newOptions = { ...values.options }
                                 delete newOptions[option.id]
                                 setFieldValue("options", newOptions)
                              }
                           }}
                        />
                     )
                  })}

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
                        <Stack
                           direction={{
                              xs: "column-reverse",
                              md: "row",
                           }}
                           sx={styles.actionButtons}
                        >
                           {values.questionType === "custom" ? (
                              <LoadingButton
                                 endIcon={isMobile ? null : <DeleteIcon />}
                                 color="error"
                                 variant="outlined"
                                 size="small"
                                 loading={isDeleting}
                                 sx={[styles.btn, styles.deleteBtn]}
                                 onClick={handleClickRemoveQuestion}
                              >
                                 {isMobile ? "Remove" : "Remove question"}
                              </LoadingButton>
                           ) : null}
                           <Box ml="auto" display="flex">
                              <Button
                                 size="small"
                                 color="grey"
                                 sx={[styles.btn, styles.cancelBtn]}
                                 onClick={() => {
                                    resetForm()
                                    disableInputMode()
                                 }}
                              >
                                 Cancel
                              </Button>
                              <LoadingButton
                                 endIcon={<Save />}
                                 loading={isSubmitting}
                                 disabled={!dirty || !isValid}
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
                     </Stack>
                  ) : null}
               </Stack>
            </Form>
         )}
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
      ).test(
         "no-duplicates",
         "Duplicate options are not allowed",
         (options) => {
            const optionNames = Object.values(options).map(
               (option) => option.name
            )
            const duplicates = optionNames.filter(
               (name, index) => optionNames.indexOf(name) !== index
            )
            if (duplicates.length > 0) {
               const optionId = Object.keys(options).find(
                  (key) => options[key].name === duplicates[0]
               )
               const path = `options.${optionId}.name`

               throw new Yup.ValidationError(
                  "Duplicate options are not allowed",
                  null,
                  path
               )
            }
            return true
         }
      )
   ),
})

export default RegistrationQuestion
