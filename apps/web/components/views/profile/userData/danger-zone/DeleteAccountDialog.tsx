import GenericDialog from "../../../common/GenericDialog"
import { Formik } from "formik"
import {
   Box,
   Button,
   CircularProgress,
   Grid,
   Link,
   TextField,
   Typography,
} from "@mui/material"
import React from "react"

const formValidator = ({ confirmationTxt }) => {
   const errors: any = {}
   if (confirmationTxt !== "delete") {
      errors.confirmationTxt = "invalid"
   }
   return errors
}

type Props = {
   userEmail: string
   onAccountDeletion: () => Promise<void>
   onClose: (isOpen: boolean) => void
}

const DeleteAccountDialog = ({
   onAccountDeletion,
   onClose,
   userEmail,
}: Props): JSX.Element => {
   return (
      <GenericDialog
         title={`You're about to delete your account`}
         onClose={() => onClose(false)}
         showCloseBtn={false}
      >
         <Formik
            initialValues={{ confirmationTxt: "" }}
            enableReinitialize
            validate={formValidator}
            onSubmit={onAccountDeletion}
         >
            {({
               values,
               errors,
               handleChange,
               handleBlur,
               handleSubmit,
               dirty,
               isSubmitting,
            }) => (
               <form onSubmit={handleSubmit}>
                  <Grid item sm={12}>
                     <Typography variant="body2" my={1}>
                        This action{" "}
                        <Box fontWeight={"bold"} display={"inline"}>
                           CANNOT{" "}
                        </Box>
                        be undone. This will permanently delete the {userEmail}{" "}
                        account.
                     </Typography>
                     <Typography variant="body2" my={1}>
                        Are you sure you want to delete your account? If you do,
                        all your data will be removed within the period defined
                        in our{" "}
                        <Link href="/terms" underline="always">
                           Terms and Conditions.
                        </Link>
                     </Typography>
                  </Grid>
                  <Grid item sm={12} mt={3}>
                     <Grid item xs={12}>
                        <Typography variant="body2" my={1}>
                           To verify, type{" "}
                           <Box
                              fontStyle={"italic"}
                              display={"inline"}
                              fontWeight={"bold"}
                           >
                              delete{" "}
                           </Box>{" "}
                           below:
                        </Typography>
                     </Grid>
                     <Grid item xs={12}>
                        <Grid container spacing={2}>
                           <Grid item lg={5} sm={6} xs={12}>
                              <TextField
                                 name="confirmationTxt"
                                 variant="outlined"
                                 required
                                 color="secondary"
                                 fullWidth
                                 id="deleteAccountConfirmationText"
                                 autoFocus
                                 onBlur={handleBlur}
                                 value={values.confirmationTxt}
                                 onChange={handleChange}
                              />
                           </Grid>
                           <Grid item lg={3} sm={4} xs={12}>
                              <Button
                                 type="submit"
                                 fullWidth
                                 variant="contained"
                                 color="secondary"
                                 data-testid={
                                    "delete-account-confirmation-button"
                                 }
                                 disabled={
                                    !!errors.confirmationTxt ||
                                    !dirty ||
                                    isSubmitting
                                 }
                                 startIcon={
                                    isSubmitting && (
                                       <CircularProgress
                                          size={20}
                                          color="inherit"
                                       />
                                    )
                                 }
                              >
                                 {isSubmitting ? "Confirming" : "Confirm"}
                              </Button>
                           </Grid>
                        </Grid>
                     </Grid>
                  </Grid>
               </form>
            )}
         </Formik>
      </GenericDialog>
   )
}

export default DeleteAccountDialog
