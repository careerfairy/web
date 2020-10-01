import React, {useState} from 'react';
import {Formik} from 'formik';
import {useRouter} from 'next/router';

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
import UniversityCountrySelector from "../../universitySelect/UniversityCountrySelector";
import UniversitySelector from "../../universitySelect/UniversitySelector";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    box: {
        width: '100%', // Fix IE 11 issue.
        backgroundColor: "white",
        // marginTop: theme.spacing(3),
        borderRadius: 5
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const PersonalInfo = ({firebase, userData}) => {
    const classes = useStyles()
    const {push} = useRouter()
    const [open, setOpen] = useState(false);

    function logout() {
        setLoading(true);
        firebase.doSignOut().then(() => {
            router.replace('/login');
        });
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <Formik
            initialValues={userData && userData.firstName ? {
                firstName: userData.firstName,
                lastName: userData.lastName,
                universityObj: typeof userData?.university === 'string' ? {name: userData.university} : userData?.university || {},
                countryCode: ""
            } : {
                firstName: '',
                lastName: '',
                universityObj: null,
                countryCode: ""
            }}
            enableReinitialize={true}
            validate={values => {
                let errors = {};
                if (!values.firstName) {
                    errors.firstName = 'Required';
                } else if (!/^\D+$/i.test(values.firstName)) {
                    errors.firstName = 'Please enter a valid first name';
                }
                if (!values.lastName) {
                    errors.lastName = 'Required';
                } else if (!/^\D+$/i.test(values.lastName)) {
                    errors.lastName = 'Please enter a valid last name';
                }
                if (!values.universityObj) {
                    errors.universityObj = 'Select a university or type "other"';
                }
                return errors;
            }}
            onSubmit={(values, {setSubmitting}) => {
                setSubmitting(true);
                firebase.setUserData(userData.id, values.firstName, values.lastName, values.universityObj)
                    .then(() => {
                        // return push('/next-livestreams');
                        setSubmitting(false);
                    }).catch(error => {
                    setSubmitting(false);
                    console.log(error);
                });
            }}
        >
            {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                  /* and other goodies */
              }) => userData ? (
                <form onSubmit={handleSubmit}>
                    <Container component="main" maxWidth="sm">
                        <Box boxShadow={1} p={4} className={classes.box}>
                            <Typography style={{color: 'rgb(160,160,160)', marginBottom: 20}} variant="h4">Personal
                                Info</Typography>
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
                                <Grid item xs={12} sm={6}>
                                    <UniversityCountrySelector value={values.countryCode}
                                                               handleClose={handleClose}
                                                               submitting={isSubmitting}
                                                               handleChange={handleChange}
                                                               handleOpen={handleOpen}
                                                               open={open}/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <UniversitySelector handleBlur={handleBlur}
                                                        error={errors.universityObj && touched.universityObj && errors.universityObj}
                                                        countryCode={values.countryCode}
                                                        values={values}
                                                        submitting={isSubmitting}
                                                        setFieldValue={setFieldValue}/>
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                                endIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                                className={classes.submit}
                            >
                                {isSubmitting ? "Updating" : "Update"}
                            </Button>
                        </Box>
                    </Container>
                </form>
            ) : null}
        </Formik>
    );
};

export default withFirebase(PersonalInfo);