import {
   Box,
   Collapse,
   FormControl,
   FormHelperText,
   Grid,
   TextField,
   Typography,
} from "@mui/material"
import ImageSelect from "../../draftStreamForm/ImageSelect/ImageSelect"
import { getDownloadUrl } from "../../../helperFunctions/streamFormFunctions"
import { FieldOfStudySelector } from "../../signup/userInformation/FieldOfStudySelector"
import React from "react"
import { FormikErrors, FormikValues, FormikHelpers } from "formik"
import { FormikTouched } from "formik/dist/types"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"

type Props = {
   handleChange: (event) => void
   values: FormikValues
   handleBlur: (event) => void
   errors: FormikErrors<FormikValues>
   touched: FormikTouched<FormikValues>
   isSubmitting: boolean
   setFieldValue?: FormikHelpers<FieldOfStudy>["setFieldValue"]
   imagePathId: string
}

const PersonalInfo = ({
   isSubmitting,
   handleChange,
   handleBlur,
   setFieldValue,
   imagePathId,
   values,
   errors,
   touched,
}: Props) => {
   return (
      <Box>
         <Typography variant={"h5"} fontWeight={600}>
            Personal Information
         </Typography>

         <Grid container mt={4} alignItems={"end"}>
            <Grid item xs={12} md={3}>
               <ImageSelect
                  path={imagePathId}
                  getDownloadUrl={getDownloadUrl}
                  formName={`avatar`}
                  label="Avatar"
                  error={Boolean(errors.avatar)}
                  isSubmitting={isSubmitting}
                  value={values.avatar}
                  isAvatar
                  setFieldValue={setFieldValue}
                  showIconButton={false}
                  isButtonOutlined={true}
                  buttonCentered={true}
               />
            </Grid>
            <Grid item xs={12} md={9} mt={{ xs: 4, md: 0 }}>
               <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                     <FormControl fullWidth>
                        <TextField
                           autoComplete="fname"
                           name="firstName"
                           variant="outlined"
                           fullWidth
                           id="firstName"
                           label="First Name"
                           disabled={isSubmitting}
                           onBlur={handleBlur}
                           value={values.firstName}
                           error={Boolean(
                              errors.firstName &&
                                 touched.firstName &&
                                 errors.firstName
                           )}
                           onChange={handleChange}
                        />
                        <Collapse
                           in={Boolean(
                              errors.firstName &&
                                 touched.firstName &&
                                 errors.firstName
                           )}
                        >
                           <FormHelperText error>
                              {errors.firstName}
                           </FormHelperText>
                        </Collapse>
                     </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormControl fullWidth>
                        <TextField
                           variant="outlined"
                           fullWidth
                           id="lastName"
                           label="Last Name"
                           name="lastName"
                           autoComplete="lname"
                           disabled={isSubmitting}
                           onBlur={handleBlur}
                           value={values.lastName}
                           error={Boolean(
                              errors.lastName &&
                                 touched.lastName &&
                                 errors.lastName
                           )}
                           onChange={handleChange}
                        />
                        <Collapse
                           in={Boolean(
                              errors.lastName &&
                                 touched.lastName &&
                                 errors.lastName
                           )}
                        >
                           <FormHelperText error>
                              {errors.lastName}
                           </FormHelperText>
                        </Collapse>
                     </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FormControl fullWidth>
                        <TextField
                           variant="outlined"
                           fullWidth
                           id="position"
                           label="Position"
                           name="position"
                           disabled={isSubmitting}
                           onBlur={handleBlur}
                           value={values.position}
                           error={Boolean(
                              errors.position &&
                                 touched.position &&
                                 errors.position
                           )}
                           onChange={handleChange}
                        />
                        <Collapse
                           in={Boolean(
                              errors.position &&
                                 touched.position &&
                                 errors.position
                           )}
                        >
                           <FormHelperText error>
                              {errors.position}
                           </FormHelperText>
                        </Collapse>
                     </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <FieldOfStudySelector
                        setFieldValue={setFieldValue}
                        value={values.fieldOfStudy}
                        disabled={isSubmitting}
                        error={
                           errors.fieldOfStudy &&
                           touched.fieldOfStudy &&
                           errors.fieldOfStudy
                        }
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField
                        variant="outlined"
                        disabled
                        value={values.email}
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                     />
                  </Grid>
               </Grid>
            </Grid>
         </Grid>
      </Box>
   )
}

export default PersonalInfo
