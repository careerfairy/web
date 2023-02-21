import { Box, Button, Stack, TextField } from "@mui/material"
import CompanyMetadata from "../../group/create/CompanyMetadata"
import { Formik, FormikErrors, FormikValues } from "formik"
import React, { useCallback, useMemo } from "react"
import { useCompanyPage } from "../index"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "components/util/constants"

type Props = {
   handleClose: () => void
}

const AboutDialog = ({ handleClose }: Props) => {
   const { group, changeIsSaving } = useCompanyPage()
   const firebaseService = useFirebaseService()
   const { enqueueSnackbar } = useSnackbar()

   const initialValues = useMemo(
      () => ({
         description: group.description || "",
         companySize: group.companySize || "",
         companyIndustry: group.companyIndustry || null,
         companyCountry: group.companyCountry || null,
      }),
      [
         group.companyCountry,
         group.companyIndustry,
         group.companySize,
         group.description,
      ]
   )

   const handleSubmitForm = useCallback(
      async (values) => {
         try {
            await firebaseService.updateCareerCenter(group.id, {
               description: values.description,
               companyCountry: values.companyCountry,
               companyIndustry: values.companyIndustry,
               companySize: values.companySize,
            })
            changeIsSaving()
            handleClose()
         } catch (e) {
            console.log("error", e)
            enqueueSnackbar(GENERAL_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         }
      },
      [changeIsSaving, enqueueSnackbar, firebaseService, group.id, handleClose]
   )

   return (
      <Box>
         <Formik
            initialValues={initialValues}
            validate={handleValidation}
            onSubmit={handleSubmitForm}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               isSubmitting,
            }) => (
               <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                     <Box display={"flex"} justifyContent={"space-between"}>
                        <CompanyMetadata
                           handleChange={handleChange}
                           values={values}
                           handleBlur={handleBlur}
                           errors={errors}
                           touched={touched}
                           isSubmitting={isSubmitting}
                           inputsRequired={true}
                           horizontalDirection={true}
                        />
                     </Box>

                     <TextField
                        fullWidth
                        multiline
                        helperText={errors.description}
                        label="About"
                        name="description"
                        disabled={isSubmitting}
                        onChange={handleChange}
                        required
                        error={Boolean(errors.description)}
                        value={values.description}
                        variant="outlined"
                        sx={{ minHeight: "110px" }}
                        className="multiLineInput"
                     />
                  </Stack>
                  <Box display="flex" justifyContent="end" mt={4}>
                     <Button
                        type={"submit"}
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting}
                     >
                        Save & Close
                     </Button>
                  </Box>
               </form>
            )}
         </Formik>
      </Box>
   )
}

const handleValidation = (values: FormikValues) => {
   let errors = {} as FormikErrors<FormikValues>
   const minDescCharLength = 10

   if (!values.description) {
      errors.description = "Please fill"
   } else if (values.description.length < minDescCharLength) {
      errors.description = `Must be at least ${minDescCharLength} characters`
   }

   if (!values.companySize) {
      errors.companySize = "Please add the company size"
   }
   if (!values.companyIndustry) {
      errors.companyIndustry = "Please add the company sector"
   }
   if (!values.companyCountry) {
      errors.companyCountry = "Please add the company location"
   }

   return errors
}

export default AboutDialog
