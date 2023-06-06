import React, { useCallback, useMemo } from "react"
import clsx from "clsx"
import { Formik } from "formik"
import PropTypes from "prop-types"
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   TextField,
   CircularProgress,
   Stack,
} from "@mui/material"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "../../../../util/constants"
import makeStyles from "@mui/styles/makeStyles"
import CompanyMetadata from "../../create/CompanyMetadata"

const useStyles = makeStyles(() => ({
   root: {},
}))

const ProfileDetails = ({ group, firebase, className, ...rest }) => {
   const classes = useStyles()
   const { enqueueSnackbar } = useSnackbar()

   const handleSubmitForm = async (values, { setStatus }) => {
      try {
         await firebase.updateCareerCenter(group, {
            description: values.description,
            universityName: values.universityName,
            extraInfo: values.extraInfo,
            companyCountry: values.companyCountry,
            companyIndustries: values.companyIndustries,
            companySize: values.companySize,
         })
         enqueueSnackbar("Your profile has been updated!", {
            variant: "success",
            preventDuplicate: true,
            anchorOrigin: {
               vertical: "top",
               horizontal: "right",
            },
         })
      } catch (e) {
         console.log("error", e)
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
         setStatus(e)
      }
   }

   const initialValues = useMemo(
      () => ({
         universityName: group.universityName || "",
         description: group.description || "",
         extraInfo: group.extraInfo || "",
         companySize: group.companySize || "",
         companyIndustries: group.companyIndustries || [],
         companyCountry: group.companyCountry || null,
         isATSEnabled: group.isATSEnabled || false,
      }),
      [
         group.companyCountry,
         group.companyIndustries,
         group.companySize,
         group.description,
         group.extraInfo,
         group.isATSEnabled,
         group.universityName,
      ]
   )

   const handleValidate = useCallback((values) => {
      let errors = {}
      const minDescCharLength = 10
      const minGroupNameLength = 5
      const extraInfoMaxLength = 700
      const groupNameMaxLength = 60
      if (!values.description) {
         errors.description = "Please fill"
      } else if (values.description.length < minDescCharLength) {
         errors.description = `Must be at least ${minDescCharLength} characters`
      }
      if (values.extraInfo.length > extraInfoMaxLength) {
         errors.extraInfo = `Cannot be more than ${extraInfoMaxLength} characters`
      }

      if (values.universityName.length > groupNameMaxLength) {
         errors.universityName = `Cannot be more than ${groupNameMaxLength} characters`
      }

      if (!values.universityName) {
         errors.universityName = "Please fill"
      } else if (values.universityName < minGroupNameLength) {
         errors.universityName = `Must be at least ${minGroupNameLength} characters`
      }
      return errors
   }, [])

   return (
      <Formik
         autoComplete="off"
         initialValues={initialValues}
         enableReinitialize
         validate={handleValidate}
         onSubmit={handleSubmitForm}
         className={clsx(classes.root, className)}
         {...rest}
      >
         {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            dirty,
            /* and other goodies */
         }) => (
            <Card>
               <CardHeader
                  subheader="The information can be edited"
                  title="Details"
               />
               <Divider />
               <CardContent>
                  <Stack spacing={3}>
                     <TextField
                        fullWidth
                        helperText={errors.universityName}
                        label="Group Name"
                        disabled={isSubmitting}
                        name="universityName"
                        onChange={handleChange}
                        required
                        error={Boolean(errors.universityName)}
                        value={values.universityName}
                        variant="outlined"
                     />
                     <TextField
                        fullWidth
                        multiline
                        helperText={errors.description}
                        label="About The group in a couple words"
                        name="description"
                        disabled={isSubmitting}
                        onChange={handleChange}
                        required
                        error={Boolean(errors.description)}
                        value={values.description}
                        variant="outlined"
                     />
                     <TextField
                        fullWidth
                        multiline
                        helperText={errors.extraInfo}
                        label="Group Summary"
                        name="extraInfo"
                        disabled={isSubmitting}
                        onChange={handleChange}
                        required
                        error={Boolean(errors.extraInfo)}
                        value={values.extraInfo}
                        variant="outlined"
                     />
                     <CompanyMetadata
                        handleChange={handleChange}
                        values={values}
                        errors={errors}
                        handleBlur={handleBlur}
                        touched={touched}
                        isSubmitting={isSubmitting}
                     />
                  </Stack>
               </CardContent>
               <Divider />
               <Box display="flex" justifyContent="flex-end" p={2}>
                  <Button
                     data-testid={"profile-details-save-button"}
                     disabled={!dirty}
                     onClick={handleSubmit}
                     color="primary"
                     variant="contained"
                     endIcon={
                        isSubmitting ? (
                           <CircularProgress size={20} color="inherit" />
                        ) : null
                     }
                  >
                     {isSubmitting ? "Updating" : "Save details"}
                  </Button>
               </Box>
            </Card>
         )}
      </Formik>
   )
}
ProfileDetails.propTypes = {
   className: PropTypes.string,
   firebase: PropTypes.object,
   group: PropTypes.object,
}

export default ProfileDetails
