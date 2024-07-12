import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import AddIcon from "@mui/icons-material/Add"
import BarChart from "@mui/icons-material/BarChart"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogTitle,
   Fab,
   Grow,
   Slide,
   TextField,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { getIn, useFormik } from "formik"
import { useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import * as yup from "yup"
import { GlassDialog } from "../../../../../../../materialUI/GlobalModals"
import { errorLogAndNotify } from "../../../../../../../util/CommonUtil"
import useStreamRef from "../../../../../../custom-hook/useStreamRef"

const validationSchema = yup.object({
   question: yup
      .string()
      .trim()
      .min(3, "Question must be at least 3 characters long")
      .required("Question is required"),
   options: yup
      .array()
      .of(
         yup.object({
            text: yup
               .string()
               .trim()
               .min(1, "Option must be at least 1 character")
               .required("Option is required"),
         })
      )
      .min(2, "At least 2 options are required")
      .max(5, "Max 5 options are allowed"),
})

/**
 * Create Empty Option.
 * @return {({id: string, text: string})} Returns a newly generated empty option.
 */
const createEmptyOption = () => ({ id: uuidv4(), text: "" })

const initialOptions = [createEmptyOption(), createEmptyOption()]

interface PollValues {
   question: string
   options: { id: string; text: string }[]
}

type PollCreationModalProps = {
   open: boolean
   handleClose: () => void
   initialPoll?: LivestreamPoll
}

const PollCreationModal = ({
   open,
   handleClose,
   initialPoll,
}: PollCreationModalProps) => {
   const streamRef = useStreamRef()
   const firebase = useFirebaseService()

   const {
      touched,
      values,
      errors,
      handleChange,
      handleBlur,
      setFieldValue,
      handleSubmit,
      isSubmitting,
      dirty,
      isValid,
      resetForm,
   } = useFormik<PollValues>({
      initialValues: {
         question: initialPoll?.question || "",
         options: initialPoll?.options || initialOptions,
      },
      validationSchema,
      onSubmit: async (pollValues) => {
         // Cast to PollValues to trim all the white-spaces.
         const validPollValues = validationSchema.cast(pollValues)

         try {
            if (initialPoll) {
               await firebase.updateLivestreamPoll(
                  streamRef,
                  initialPoll.id,
                  validPollValues.question,
                  validPollValues.options
               )
            } else {
               await firebase.createLivestreamPoll(
                  streamRef,
                  validPollValues.question,
                  validPollValues.options
               )
            }
            closePollCreationDialog()
         } catch (e) {
            errorLogAndNotify(e)
         }
      },
      enableReinitialize: true,
   })

   const closePollCreationDialog = useCallback(() => {
      resetForm()
      handleClose()
   }, [handleClose, resetForm])

   const increaseNumberOfOptions = useCallback(() => {
      setFieldValue("options", [...values.options, createEmptyOption()])
   }, [setFieldValue, values.options])

   const removeOption = useCallback(
      (optionIdToRemove: string) => {
         setFieldValue(
            "options",
            values.options.filter((option) => option.id !== optionIdToRemove)
         )
      },
      [setFieldValue, values.options]
   )

   return (
      <GlassDialog
         TransitionComponent={Slide}
         maxWidth="sm"
         fullWidth
         open={open}
         onClose={closePollCreationDialog}
      >
         <form onSubmit={handleSubmit}>
            <DialogTitle>
               <Stack
                  direction={"row"}
                  justifyContent={"center"}
                  alignItems={"flex-end"}
               >
                  <BarChart color="primary" fontSize="large" />{" "}
                  <Typography
                     color="primary"
                     fontWeight={500}
                     component={"h3"}
                     variant="h4"
                  >
                     Create a Poll
                  </Typography>
               </Stack>
            </DialogTitle>
            <DialogContent>
               <Stack spacing={2} sx={{ py: 1 }}>
                  <TextField
                     label="Your Question"
                     value={values.question}
                     fullWidth
                     name="question"
                     variant="outlined"
                     disabled={isSubmitting}
                     onChange={handleChange}
                     error={Boolean(touched.question && errors.question)}
                     helperText={Boolean(touched.question) && errors.question}
                     onBlur={handleBlur}
                     placeholder="Write down your question or poll to your audience"
                  />
                  {values.options.map(({ id }, index) => {
                     const error = getIn(errors.options, `${index}.text`),
                        isTouched = getIn(touched.options, `${index}.text`)

                     return (
                        <Grow key={id} in>
                           <TextField
                              key={id}
                              label={`Option ${index + 1}`}
                              name={`options[${index}].text`}
                              value={values.options?.[index].text}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={isSubmitting}
                              error={Boolean(isTouched && error)}
                              helperText={Boolean(isTouched) && error}
                              variant="outlined"
                              margin="dense"
                              size={"small"}
                              fullWidth
                              placeholder="Write down your option"
                              InputProps={
                                 values.options.length >= 3
                                    ? {
                                         endAdornment: (
                                            <Box p={1}>
                                               <Fab
                                                  disabled={isSubmitting}
                                                  onClick={() =>
                                                     removeOption(id)
                                                  }
                                                  size="small"
                                                  color="error"
                                                  sx={{
                                                     width: 36,
                                                     height: 36,
                                                     p: 1,
                                                  }}
                                               >
                                                  <DeleteForeverIcon />
                                               </Fab>
                                            </Box>
                                         ),
                                      }
                                    : {}
                              }
                           />
                        </Grow>
                     )
                  })}
                  <Button
                     startIcon={<AddIcon />}
                     variant="contained"
                     color="secondary"
                     onClick={increaseNumberOfOptions}
                     disabled={values.options.length > 3}
                  >
                     Add an Option
                  </Button>
               </Stack>
            </DialogContent>
            <DialogActions>
               <Button color="grey" onClick={closePollCreationDialog}>
                  Cancel
               </Button>
               <Button
                  startIcon={
                     Boolean(isSubmitting) && (
                        <CircularProgress size={20} color="inherit" />
                     )
                  }
                  disabled={isSubmitting || !dirty || !isValid}
                  color="primary"
                  type="submit"
                  variant="contained"
               >
                  {initialPoll ? "Update Poll" : "Create Poll"}
               </Button>
            </DialogActions>
         </form>
      </GlassDialog>
   )
}

export default PollCreationModal
