import React, { useMemo } from "react"
import clsx from "clsx"
import { Formik } from "formik"
import PropTypes from "prop-types"
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Collapse,
   Divider,
   FormControl,
   FormControlLabel,
   FormHelperText,
   Grid,
   Switch,
   TextField,
   CircularProgress,
} from "@mui/material"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR, URL_REGEX } from "../../../../util/constants"
import makeStyles from "@mui/styles/makeStyles"
import { useRouter } from "next/router"
import usePulseStyles from "../../../../../materialUI/Misc/pulse"

const useStyles = makeStyles(() => ({
   root: {},
   centeredGrid: {
      display: "grid",
      placeItems: "center",
   },
}))

const privacyPolicySectionID = "privacy-policy"
const ProfilePrivacyPolicy = ({ group, firebase, className, ...rest }) => {
   const classes = useStyles()
   const { enqueueSnackbar } = useSnackbar()
   const pulseClasses = usePulseStyles()
   const { asPath } = useRouter()
   const isActive = useMemo(
      () => asPath?.includes(`#${privacyPolicySectionID}`),
      [privacyPolicySectionID, asPath]
   )
   const handleSubmitForm = async (values, { setStatus }) => {
      try {
         await firebase.updateCareerCenter(group, {
            privacyPolicyUrl: values.privacyPolicyUrl,
            privacyPolicyActive: values.privacyPolicyActive,
         })
         enqueueSnackbar("Your privacy policy has been updated!", {
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
   return (
      <Formik
         autoComplete="off"
         initialValues={{
            privacyPolicyActive: group.privacyPolicyActive || false,
            privacyPolicyUrl: group.privacyPolicyUrl || "",
         }}
         enableReinitialize
         validate={(values) => {
            let errors = {}
            if (
               values.privacyPolicyActive === true &&
               (!values.privacyPolicyUrl ||
                  !values.privacyPolicyUrl.match(URL_REGEX))
            ) {
               errors.privacyPolicyUrl = "Please enter a valid URL"
            }
            return errors
         }}
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
            setFieldValue,
            setValues,
            isValid,
            dirty,
            validateForm,
            /* and other goodies */
         }) => {
            return (
               <form className={isActive ? pulseClasses.pulseAnimate : ""}>
                  <Card>
                     <CardHeader
                        subheader="Choose weather or not you want registrants to agree to your privacy policy"
                        title="Privacy Policy"
                        id={privacyPolicySectionID}
                     />
                     <Divider />
                     <CardContent>
                        <Grid container spacing={3}>
                           <Grid item lg={10} md={9} sm={9} xs={12}>
                              <FormControl fullWidth>
                                 <TextField
                                    variant="outlined"
                                    fullWidth
                                    onBlur={handleBlur}
                                    id="privacyPolicyUrl"
                                    label="Link to privacy Policy"
                                    name="privacyPolicyUrl"
                                    placeholder="Privacy Policy Url"
                                    disabled={isSubmitting}
                                    value={values.privacyPolicyUrl}
                                    error={Boolean(errors.privacyPolicyUrl)}
                                    onChange={handleChange}
                                 />
                                 <Collapse
                                    in={Boolean(
                                       errors.privacyPolicyUrl &&
                                          touched.privacyPolicyUrl &&
                                          errors.privacyPolicyUrl
                                    )}
                                 >
                                    <FormHelperText error>
                                       {errors.privacyPolicyUrl}
                                    </FormHelperText>
                                 </Collapse>
                              </FormControl>
                           </Grid>
                           <Grid
                              item
                              lg={2}
                              md={3}
                              sm={3}
                              xs={12}
                              className={classes.centeredGrid}
                           >
                              <FormControl
                                 disabled={isSubmitting}
                                 error={Boolean(errors.privacyPolicyActive)}
                              >
                                 <FormControlLabel
                                    label="Activate"
                                    control={
                                       <Switch
                                          checked={values.privacyPolicyActive}
                                          onChange={handleChange}
                                          color="primary"
                                          name="privacyPolicyActive"
                                       />
                                    }
                                 />
                                 <Collapse
                                    in={Boolean(errors.privacyPolicyActive)}
                                 >
                                    <FormHelperText>
                                       {errors.privacyPolicyActive}
                                    </FormHelperText>
                                 </Collapse>
                              </FormControl>
                           </Grid>
                        </Grid>
                     </CardContent>
                     <Divider />
                     <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                           disabled={!dirty || isSubmitting || !isValid}
                           onClick={handleSubmit}
                           color="primary"
                           variant="contained"
                           endIcon={
                              isSubmitting && (
                                 <CircularProgress size={20} color="inherit" />
                              )
                           }
                        >
                           {isSubmitting ? "Updating" : "Update Policy"}
                        </Button>
                     </Box>
                  </Card>
               </form>
            )
         }}
      </Formik>
   )
}
ProfilePrivacyPolicy.propTypes = {
   className: PropTypes.string,
   firebase: PropTypes.any,
   group: PropTypes.any,
}

export default ProfilePrivacyPolicy
