import {
   Box,
   Button,
   Collapse,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import CompanyMetadata from "../../group/create/CompanyMetadata"
import { Formik } from "formik"
import React, { useCallback, useMemo } from "react"
import { useCompanyPage } from "../index"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { groupRepo } from "../../../../data/RepositoryInstances"
import * as yup from "yup"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"

type Props = {
   handleClose: () => void
}

const AboutDialog = ({ handleClose }: Props) => {
   const { group } = useCompanyPage()
   const { errorNotification } = useSnackbarNotifications()
   const isMobile = useIsMobile()

   const initialValues = useMemo(
      () => ({
         extraInfo: group.extraInfo || "",
         companySize: group.companySize || "",
         companyIndustries: group.companyIndustries || [],
         companyCountry: group.companyCountry || null,
      }),
      [
         group.companyCountry,
         group.companyIndustries,
         group.companySize,
         group.extraInfo,
      ]
   )

   const handleSubmitForm = useCallback(
      async (values) => {
         try {
            await groupRepo.updateGroupMetadata(group.id, {
               extraInfo: values.extraInfo,
               companyCountry: values.companyCountry,
               companyIndustries: values.companyIndustries,
               companySize: values.companySize,
            })
            handleClose()
         } catch (e) {
            errorNotification(e)
         }
      },
      [errorNotification, group.id, handleClose]
   )

   return (
      <Box>
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
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
                           name="extraInfo"
                           disabled={isSubmitting}
                           onChange={handleChange}
                           required
                           error={Boolean(errors.extraInfo)}
                           value={values.extraInfo}
                           variant="outlined"
                           minRows={4}
                           className="multiLineInput"
                        />
                        <Collapse
                           in={Boolean(errors.extraInfo)}
                           style={{ color: "red" }}
                        >
                           {/* @ts-ignore */}
                           {errors.extraInfo}
                        </Collapse>
                     </Box>
                  </Stack>
                  <Box display="flex" justifyContent="end" mt={4}>
                     <Button
                        data-testid={"about-section-save-button"}
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

const schema = yup.object().shape({
   extraInfo: yup
      .string()
      .required("Please describe your company")
      .min(
         GROUP_CONSTANTS.MIN_EXTRA_INFO_LENGTH,
         `Must be at least ${GROUP_CONSTANTS.MIN_EXTRA_INFO_LENGTH} characters`
      )
      .max(
         GROUP_CONSTANTS.MAX_EXTRA_INFO_LENGTH,
         `Must be less than ${GROUP_CONSTANTS.MAX_EXTRA_INFO_LENGTH} characters`
      ),
   companySize: yup.string().required("Please add the company size"),
   companyIndustries: yup
      .array()
      .of(
         yup.object().nullable().shape({
            id: yup.string(),
            name: yup.string(),
         })
      )
      .required("Please add the company industry"),
   companyCountry: yup
      .object()
      .nullable()
      .shape({
         name: yup.string(),
      })
      .required("Please add the company location"),
})

export default AboutDialog
