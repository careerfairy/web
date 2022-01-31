import {useRouter} from "next/router";
import React, {Fragment, useState} from "react";
import {Formik} from "formik";
import {
  Button,
  Checkbox, CircularProgress,
  Collapse,
  FormControl, FormControlLabel,
  FormHelperText,
  Grid,
  TextField, Typography
} from "@material-ui/core";
import UniversityCountrySelector
  from "../universitySelect/UniversityCountrySelector";
import UniversitySelector from "../universitySelect/UniversitySelector";
import Link from "next/link";
import {makeStyles} from "@material-ui/core/styles";
import {createStyles} from "@material-ui/styles";
import {useFirebaseService} from "context/firebase/FirebaseServiceContext";
import * as yup from 'yup'

const useStyles = makeStyles((theme) => createStyles({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  resetEmail: {
    margin: "20px auto 0 auto",
    textAlign: "center",
  },
}));

const schema = yup.object().shape({
  email: yup.string()
    .required('Your email is required')
    .email('Please enter a valid email address'),
  firstName: yup.string()
    .required('Your first name is required')
    .max(50, 'Cannot be longer than 50 characters')
    .matches(/^\D+$/i, 'Please enter a valid first name'),
  lastName: yup.string()
    .required('Your last name is required')
    .max(50, 'Cannot be longer than 50 characters')
    .matches(/^\D+$/i, 'Please enter a valid last name'),
  universityCountryCode: yup.string().required('Please chose a country code'),
  password: yup.string()
    .required('A password is required')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, 'Your password needs to be at least 6 characters long and contain at least one uppercase character, one lowercase character and one number'),
  confirmPassword: yup.string()
    .required('You need to confirm your password')
    .oneOf([yup.ref('password')], 'Your password was not confirmed correctly'),
  agreeTerm: yup.boolean().oneOf([true], 'Please agree to our T&C and our Privacy Policy')
})

function SignUpUserForm({setActiveStep}) {
  const firebase = useFirebaseService();
  const classes = useStyles();
  const {
    query: {absolutePath},
    push
  } = useRouter();

  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [open, setOpen] = React.useState(false);

  const submitting = (isSubmitting) => {
    return isSubmitting || emailSent || generalLoading;
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = (values, {setSubmitting}) => {
    setErrorMessage(null);
    setEmailSent(false);
    setGeneralLoading(true);

    firebase
      .createUserInAuthAndFirebase(values)
      .then(() => {
        firebase
          .signInWithEmailAndPassword(
            values.email,
            values.password
          )
          .then(() => {
            setSubmitting(false);
            setGeneralLoading(false);
            setActiveStep(1);
          })
          .catch((e) => {
            console.error(e)
            void push("/login");
          });
      })
      .catch((error) => {
        setErrorMessage(error);
        setGeneralLoading(false);
        setSubmitting(false);
      });
  }

  return (
    <Fragment>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeTerm: false,
          subscribed: false,
          university: {code: "other", name: "Other"},
          universityCountryCode: "",
        }}
        validationSchema={schema}
        onSubmit={handleSubmit}
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
          }) => (
          <form id="signUpForm" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    inputProps={{maxLength: 50}}
                    onBlur={handleBlur}
                    value={values.firstName}
                    disabled={submitting(isSubmitting)}
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
                    inputProps={{maxLength: 50}}
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                    onBlur={handleBlur}
                    disabled={submitting(isSubmitting)}
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <TextField
                    variant="outlined"
                    fullWidth
                    error={Boolean(errors.email && touched.email)}
                    autoComplete="email"
                    id="emailInput"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    disabled={submitting(isSubmitting)}
                    label="Email Address"
                  />
                  <Collapse
                    in={Boolean(
                      errors.email && touched.email && errors.email
                    )}
                  >
                    <FormHelperText error>
                      {errors.email}
                    </FormHelperText>
                  </Collapse>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <UniversityCountrySelector
                  value={values.universityCountryCode}
                  handleClose={handleClose}
                  submitting={submitting(isSubmitting)}
                  setFieldValue={setFieldValue}
                  error={
                    errors.universityCountryCode &&
                    touched.universityCountryCode &&
                    errors.universityCountryCode
                  }
                  handleOpen={handleOpen}
                  handleBlur={handleBlur}
                  open={open}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <UniversitySelector
                  handleBlur={handleBlur}
                  error={
                    errors.university &&
                    touched.university &&
                    errors.university
                  }
                  universityCountryCode={values.universityCountryCode}
                  values={values}
                  submitting={submitting(isSubmitting)}
                  setFieldValue={setFieldValue}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Password"
                    id="password"
                    autoComplete="current-password"
                    type="password"
                    name="password"
                    error={Boolean(
                      errors.password &&
                      touched.password &&
                      errors.password
                    )}
                    placeholder="Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    disabled={submitting(isSubmitting)}
                  />
                  <Collapse
                    in={Boolean(
                      errors.password &&
                      touched.password &&
                      errors.password
                    )}
                  >
                    <FormHelperText error>
                      {errors.password}
                    </FormHelperText>
                  </Collapse>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Confirm Password"
                    autoComplete="current-password"
                    id="confirmPasswordInput"
                    type="password"
                    error={Boolean(
                      errors.confirmPassword &&
                      touched.confirmPassword &&
                      errors.confirmPassword
                    )}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmPassword}
                    disabled={submitting(isSubmitting)}
                  />
                  <Collapse
                    in={Boolean(
                      errors.confirmPassword &&
                      touched.confirmPassword &&
                      errors.confirmPassword
                    )}
                  >
                    <FormHelperText error>
                      {errors.confirmPassword}
                    </FormHelperText>
                  </Collapse>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeTerm"
                      placeholder="Confirm Password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      checked={values.agreeTerm}
                      disabled={submitting(isSubmitting)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography style={{fontSize: 12}}>
                      I agree to the{" "}
                      <Link href="/terms">
                        <a>Terms & Conditions</a>
                      </Link>{" "}
                      and I have taken note of the{" "}
                      <Link href="/privacy">
                        <a>Data Protection Notice</a>
                      </Link>
                    </Typography>
                  }
                />
                <Collapse in={Boolean(errors.agreeTerm && touched.agreeTerm)}>
                  <FormHelperText error>
                    {errors.agreeTerm}
                  </FormHelperText>
                </Collapse>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="subscribed"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      checked={values.subscribed}
                      disabled={submitting(isSubmitting)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography style={{fontSize: 12}}>
                      I don’t want to miss out on events from
                      exciting companies and would like to receive
                      occasional email announcements from
                      CareerFairy. 🚀
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              disabled={isSubmitting || emailSent}
              endIcon={
                (isSubmitting || generalLoading) && (
                  <CircularProgress size={20} color="inherit"/>
                )
              }
              className={classes.submit}
            >
              Sign up
            </Button>
            <div className={classes.resetEmail}>
              <div style={{marginBottom: "5px"}}>
                Already part of the family?
              </div>
              <Link
                href={
                  absolutePath
                    ? {
                      pathname: "/login",
                      query: {absolutePath},
                    }
                    : "/login"
                }
              >
                <a href="#">Log in</a>
              </Link>
            </div>
            <div className={classes.resetEmail}>
              <div style={{marginBottom: "5px"}}>
                Having issues signing up?
                <a
                  style={{marginLeft: "5px"}}
                  href="mailto:maximilian@careerfairy.io"
                >
                  Let us know
                </a>
              </div>
            </div>
            <FormHelperText error hidden={!errorMessage}>
              {errorMessage?.message}
            </FormHelperText>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}

export default SignUpUserForm
