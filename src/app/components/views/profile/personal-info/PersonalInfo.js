import React from 'react';
import {Formik} from 'formik';
import {useRouter} from 'next/router';

import {withFirebase} from 'data/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {Typography, TextField, Button, Grid, CircularProgress, Box, Container} from "@material-ui/core";

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

const PersonalInfo = (props) => {
    const classes = useStyles()
    const {push} = useRouter()

    function logout() {
        setLoading(true);
        props.firebase.doSignOut().then(() => {
            router.replace('/login');
        });
    }

    return (
        <Formik
            initialValues={props.userData.firstName ? {
                firstName: props.userData.firstName,
                lastName: props.userData.lastName
            } : {firstName: '', lastName: ''}}
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
                return errors;
            }}
            onSubmit={(values, {setSubmitting}) => {
                setSubmitting(true);
                props.firebase.setUserData(props.userData.id, values.firstName, values.lastName)
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
                  isSubmitting,
                  /* and other goodies */
              }) => (
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
                                        value={props.userData.id}
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                        helperText={errors.firstName && touched.firstName && errors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                        helperText={errors.lastName && touched.lastName && errors.lastName}
                                    />
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
            )}
        </Formik>
    );
};

export default withFirebase(PersonalInfo);