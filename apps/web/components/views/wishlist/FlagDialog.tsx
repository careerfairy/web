import React from "react"
import {
   Button,
   Chip,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormHelperText,
   TextField,
} from "@mui/material"
import { FlagReason } from "@careerfairy/shared-lib/dist/wishes"
import * as yup from "yup"
import { Formik } from "formik"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import { StylesProps } from "../../../types/commonTypes"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import Typography from "@mui/material/Typography"

interface Props {
   handleFlag: (reasons: FlagReason[], message: string) => Promise<void>
   open: boolean
   onClose: () => void
}

const maxMessageLength = 140
const schema = yup.object().shape({
   reasons: yup
      .array()
      .of(yup.string().required("Please select at least one reason"))
      .min(1, "Please select at least one reason")
      .required("Please select at least one reason"),
   flagMessage: yup
      .string()
      .max(
         maxMessageLength,
         `Message must be less than ${maxMessageLength} characters`
      ),
})

type FormikValues = {
   reasons: FlagReason[]
   flagMessage: string
}
const initialValues: FormikValues = {
   reasons: [],
   flagMessage: "",
}

const styles: StylesProps = {
   interestChip: {
      borderRadius: 1,
   },
   content: {
      borderBottom: "none",
   },
}
const FlagDialog = ({ onClose, handleFlag, open }: Props) => {
   const dispatch = useDispatch()
   const flagOptions: FlagReason[] = [
      "other",
      "spam",
      "duplicate",
      "inappropriate",
      "unrelated",
   ]

   const handleSubmit = async (values: FormikValues) => {
      try {
         await handleFlag(values.reasons, values.flagMessage)
         dispatch(actions.sendSuccessMessage("Thanks for reporting"))
      } catch (error) {
         dispatch(actions.sendGeneralError(error))
      }
      onClose()
   }

   const isSelected = (reason: FlagReason, selectedReasons: FlagReason[]) => {
      return selectedReasons.includes(reason)
   }

   const handleChipClick = (
      reason: FlagReason,
      selectedReasons: FlagReason[],
      setFieldValue: (name: string, value: any) => void
   ) => {
      if (isSelected(reason, selectedReasons)) {
         setFieldValue(
            "reasons",
            selectedReasons.filter((r) => r !== reason)
         )
      } else {
         setFieldValue("reasons", [...selectedReasons, reason])
      }
   }
   return (
      <Dialog
         open={open}
         onClose={onClose}
         aria-labelledby="flag-wish-dialog-title"
         aria-describedby="flag-wish-dialog-description"
         maxWidth="xs"
         fullWidth
      >
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
         >
            {({
               isSubmitting,
               values,
               touched,
               handleBlur,
               setFieldValue,
               handleChange,
               errors,
               handleSubmit,
            }) => (
               <form id={"flag-wish-form"}>
                  <DialogTitle id="flag-wish-dialog-title">
                     Flag Wish
                  </DialogTitle>
                  <DialogContent dividers sx={styles.content}>
                     <Stack spacing={2}>
                        <Box>
                           <Typography variant="h6">
                              Select reasons for flagging this wish:
                           </Typography>
                           {flagOptions.map((reason) => (
                              <Chip
                                 sx={styles.interestChip}
                                 onClick={() =>
                                    handleChipClick(
                                       reason,
                                       values.reasons,
                                       setFieldValue
                                    )
                                 }
                                 onBlur={() => handleBlur("reasons")}
                                 disabled={isSubmitting}
                                 color={
                                    isSelected(reason, values.reasons)
                                       ? "primary"
                                       : "default"
                                 }
                                 /*
                                    // @ts-ignore */
                                 variant={
                                    isSelected(reason, values.reasons)
                                       ? "contained"
                                       : "outlined"
                                 }
                                 stacked
                                 label={reason}
                                 key={reason}
                              />
                           ))}
                           {errors.reasons &&
                              touched.reasons &&
                              errors.reasons && (
                                 <FormHelperText error>
                                    {errors.reasons &&
                                       touched.reasons &&
                                       errors.reasons}
                                 </FormHelperText>
                              )}
                        </Box>
                        <TextField
                           autoFocus
                           margin="dense"
                           id="flagMessage"
                           name="flagMessage"
                           onChange={handleChange}
                           onBlur={handleBlur}
                           value={values.flagMessage}
                           helperText={
                              errors.flagMessage &&
                              touched.flagMessage &&
                              errors.flagMessage
                           }
                           maxRows={6}
                           minRows={4}
                           error={Boolean(
                              errors.flagMessage && touched.flagMessage
                           )}
                           disabled={isSubmitting}
                           label="Reason for flagging"
                           type="text"
                           multiline
                           fullWidth
                        />
                     </Stack>
                  </DialogContent>
                  <DialogActions>
                     <Button
                        color={"grey"}
                        disabled={isSubmitting}
                        onClick={onClose}
                        size={"small"}
                     >
                        Cancel
                     </Button>
                     <Button
                        color={"secondary"}
                        onClick={(e) => {
                           e.preventDefault()
                           handleSubmit()
                        }}
                        size={"small"}
                        type={"submit"}
                        disabled={isSubmitting}
                        variant={"contained"}
                     >
                        {isSubmitting ? (
                           <CircularProgress size={10} color={"inherit"} />
                        ) : (
                           "Submit"
                        )}
                     </Button>
                  </DialogActions>
               </form>
            )}
         </Formik>
      </Dialog>
   )
}

export default FlagDialog
