import { FlagReason } from "@careerfairy/shared-lib/wishes"
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
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { Formik } from "formik"
import { useDispatch } from "react-redux"
import * as yup from "yup"
import * as actions from "../../../store/actions"
import { StylesProps } from "../../../types/commonTypes"

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
               <Dialog
                  open={open}
                  onClose={onClose}
                  aria-labelledby="flag-wish-dialog-title"
                  aria-describedby="flag-wish-dialog-description"
                  maxWidth="xs"
                  fullWidth
               >
                  <DialogTitle id="flag-wish-dialog-title">
                     Flag Wish
                  </DialogTitle>
                  <DialogContent dividers sx={styles.content}>
                     <Stack spacing={3}>
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
                           {Boolean(errors.reasons && touched.reasons) && (
                              <FormHelperText error>
                                 {errors.reasons}
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
                              Boolean(
                                 errors.flagMessage && touched.flagMessage
                              ) && errors.flagMessage
                           }
                           maxRows={6}
                           minRows={4}
                           error={Boolean(
                              errors.flagMessage && touched.flagMessage
                           )}
                           disabled={isSubmitting}
                           label="Explanation (optional)"
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
                     >
                        Cancel
                     </Button>
                     <Button
                        color={"secondary"}
                        onClick={(e) => {
                           e.preventDefault()
                           handleSubmit()
                        }}
                        type={"submit"}
                        disabled={isSubmitting}
                        variant={"contained"}
                     >
                        {isSubmitting ? (
                           <CircularProgress size={15} color={"inherit"} />
                        ) : (
                           "Submit"
                        )}
                     </Button>
                  </DialogActions>
               </Dialog>
            </form>
         )}
      </Formik>
   )
}

export default FlagDialog
