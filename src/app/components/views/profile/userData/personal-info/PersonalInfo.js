import React, {useEffect, useState} from 'react';
import {Formik} from 'formik';

import {withFirebase} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Box,
    Container,
    Collapse,
    FormHelperText, FormControl
} from "@material-ui/core";
import UniversityCountrySelector from "components/views/universitySelect/UniversityCountrySelector";
import UniversitySelector from "components/views/universitySelect/UniversitySelector";
import {GENERAL_ERROR, URL_REGEX} from "components/util/constants";
import {useDispatch, useSelector} from "react-redux";
import * as actions from 'store/actions'
import {useSnackbar} from "notistack";


const useStyles = makeStyles((theme) => ({
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        marginBottom: 0
    },
    title:{
        color: theme.palette.text.secondary,
        textTransform: "uppercase",
        fontSize: "1.8rem",
        marginBottom: 30
    },
    subtitle:{
        textTransform: "uppercase",
        fontSize: "0.8rem",
        fontWeight: "bold",
        marginBottom: 20
    }
}));

const PersonalInfo = ({firebase, userData}) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const {enqueueSnackbar} = useSnackbar()
    const dispatch = useDispatch()
    const {loading, error} = useSelector(state => state.auth.profileEdit)

    useEffect(() => {
        if (loading === false && error === false) {
            enqueueSnackbar("Your profile has been updated!", {
                variant: "success",
                preventDuplicate: true,
            })
        } else if (error) {
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true
            })
        }

        return () => dispatch(actions.clean())
    }, [loading, error])

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleUpdate = async (values) => {
        await dispatch(actions.editUserProfile(values))
    }

    
    return (
        <Formik
            initialValues={{
                firstName: userData?.firstName || '',
                lastName: userData?.lastName || '',
                linkedinUrl: userData?.linkedinUrl || '' ? userData.linkedinUrl : '',
                university: userData?.university,
                universityCountryCode: userData?.universityCountryCode || ''
            }}
            enableReinitialize
            validate={values => {
                let errors = {};
                if (!values.firstName) {
                    errors.firstName = 'Required';
                } else if (!/^\D+$/i.test(values.firstName)) {
                    errors.firstName = 'Please enter a valid first name';
                } else if (values.firstName.length > 50) {
                    errors.firstName = 'Cannot be longer than 50 characters';
                }
                if (!values.lastName) {
                    errors.lastName = 'Required';
                } else if (!/^\D+$/i.test(values.lastName)) {
                    errors.lastName = 'Please enter a valid last name';
                } else if (values.lastName.length > 50) {
                    errors.lastName = 'Cannot be longer than 50 characters';
                }
                if (values.linkedinUrl.length > 0 && !values.linkedinUrl.match(URL_REGEX)) {
                    errors.linkedinUrl = 'Please enter a valid URL';
                }
                if (!values.universityCountryCode) {
                    errors.universityCountryCode = 'Please chose a country code';
                }
                return errors;
            }}
            onSubmit={handleUpdate}
        >
            {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  dirty,
                  setFieldValue,
                  isSubmitting,
                  /* and other goodies */
              }) => userData ? (
                <form onSubmit={handleSubmit}>
                    <>
                        <Typography className={classes.title}  variant="h4">Personal Info</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    disabled
                                    value={userData.id}
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        autoComplete="fname"
                                        name="firstName"
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        autoFocus
                                        disabled={isSubmitting}
                                        onBlur={handleBlur}
                                        value={values.firstName}
                                        error={Boolean(errors.firstName && touched.firstName && errors.firstName)}
                                        onChange={handleChange}
                                    />
                                    <Collapse
                                        in={Boolean(errors.firstName && touched.firstName && errors.firstName)}>
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
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        autoComplete="lname"
                                        disabled={isSubmitting}
                                        onBlur={handleBlur}
                                        value={values.lastName}
                                        error={Boolean(errors.lastName && touched.lastName && errors.lastName)}
                                        onChange={handleChange}
                                    />
                                    <Collapse
                                        in={Boolean(errors.lastName && touched.lastName && errors.lastName)}>
                                        <FormHelperText error>
                                            {errors.lastName}
                                        </FormHelperText>
                                    </Collapse>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                    <Typography className={classes.subtitle}  variant="h5">University</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <UniversityCountrySelector value={values.universityCountryCode}
                                                            handleClose={handleClose}
                                                            submitting={isSubmitting}
                                                            setFieldValue={setFieldValue}
                                                            error={errors.universityCountryCode && touched.universityCountryCode && errors.universityCountryCode}
                                                            handleBlur={handleBlur}
                                                            handleOpen={handleOpen}
                                                            open={open}/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <UniversitySelector handleBlur={handleBlur}
                                                    error={errors.university && touched.university && errors.university}
                                                    universityCountryCode={values.universityCountryCode}
                                                    values={values}
                                                    submitting={isSubmitting}
                                                    setFieldValue={setFieldValue}/>
                            </Grid>
                            <Grid item xs={12}>
                                    <Typography className={classes.subtitle}  variant="h5">Social</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="linkedinUrl"
                                        label="LinkedIn (optional)"
                                        name="linkedinUrl"
                                        autoComplete="lname"
                                        placeholder="https://www.linkedin.com/in/username/"
                                        disabled={isSubmitting}
                                        onBlur={handleBlur}
                                        value={values.linkedinUrl}
                                        error={Boolean(errors.linkedinUrl && touched.linkedinUrl && errors.linkedinUrl)}
                                        onChange={handleChange}
                                    />
                                    <Collapse
                                        in={Boolean(errors.linkedinUrl && touched.linkedinUrl && errors.linkedinUrl)}>
                                        <FormHelperText error>
                                            {errors.linkedinUrl}
                                        </FormHelperText>
                                    </Collapse>
                                </FormControl>
                            </Grid>
                            
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || !dirty}
                            startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                            className={classes.submit}
                        >
                            {isSubmitting ? "Updating" : "Update"}
                        </Button>
                    </>
                </form>
            ) : null}
        </Formik>
    );
};

export default withFirebase(PersonalInfo);