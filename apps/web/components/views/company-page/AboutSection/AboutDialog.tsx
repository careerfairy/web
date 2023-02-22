import {
   Box,
   Button,
   Collapse,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import CompanyMetadata from "../../group/create/CompanyMetadata"
import { Formik, FormikErrors, FormikValues } from "formik"
import React, { useCallback, useMemo } from "react"
import { useCompanyPage } from "../index"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "components/util/constants"
import useIsMobile from "../../../custom-hook/useIsMobile"

type Props = {
   handleClose: () => void
}

const AboutDialog = ({ handleClose }: Props) => {
   const { group, updateGroup } = useCompanyPage()
   const firebaseService = useFirebaseService()
   const { enqueueSnackbar } = useSnackbar()
   const isMobile = useIsMobile()

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
            updateGroup()
            handleClose()
         } catch (e) {
            console.log("error", e)
            enqueueSnackbar(GENERAL_ERROR, {
               variant: "error",
               preventDuplicate: true,
            })
         }
      },
      [updateGroup, enqueueSnackbar, firebaseService, group.id, handleClose]
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
                     <Typography variant="body2" color="textSecondary">
                        * Indicates Required
                     </Typography>

                     {isMobile ? (
                        <CompanyMetadata
                           handleChange={handleChange}
                           values={values}
                           handleBlur={handleBlur}
                           errors={errors}
                           touched={touched}
                           isSubmitting={isSubmitting}
                           inputsRequired={true}
                        />
                     ) : (
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
                     )}

                     <Box>
                        <TextField
                           fullWidth
                           multiline
                           label="About"
                           name="description"
                           disabled={isSubmitting}
                           onChange={handleChange}
                           required
                           error={Boolean(errors.description)}
                           value={values.description}
                           variant="outlined"
                           sx={{ minHeight: "100px" }}
                           className="multiLineInput"
                        />
                        <Collapse
                           in={Boolean(errors.description)}
                           style={{ color: "red" }}
                        >
                           {errors.description}
                        </Collapse>
                     </Box>
                  </Stack>
                  <Box display="flex" justifyContent="end" mt={4}>
                     <Button
                        type={"submit"}
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting}
                        size={isMobile ? "small" : "large"}
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
