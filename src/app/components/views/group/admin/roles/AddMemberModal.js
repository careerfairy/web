import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../materialUI/GlobalModals";
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    TextField
} from "@material-ui/core";
import {Formik} from "formik";
import {EMAIL_REGEX} from "../../../../util/constants";

const useStyles = makeStyles(theme => ({}));

const AddMemberModal = ({open = false, onClose}) => {


        const classes = useStyles()

        const handleClose = (resetCallback) => {
            onClose()
            if (resetCallback) {
                resetCallback()
            }
        }

        const handleSubmit = (values, {resetForm}) => {

            resetForm()
        }


        return (
            <Formik
                autoComplete="off"
                initialValues={{email: ""}}
                enableReinitialize
                validate={(values) => {
                    let errors = {};
                    if (!values.email) {
                        errors.email = "Required";
                    } else if (!EMAIL_REGEX.test(values.email)) {
                        errors.email = "Please enter a valid email";
                    }
                    console.log("-> errors", errors);
                    return errors;
                }}
                onSubmit={handleSubmit}
            >
                {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting,
                      resetForm,
                      dirty,
                      setFieldValue
                      /* and other goodies */
                  }) => (
                    <GlassDialog TransitionComponent={Slide} onClose={() => handleClose(resetForm)} open={open}>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogContent>
                            <Box marginY={2}>
                                <TextField
                                    fullWidth
                                    helperText={errors.email}
                                    label="Email"
                                    autoComplete="email"
                                    disabled={isSubmitting}
                                    name="email"
                                    onChange={handleChange}
                                    required
                                    error={Boolean(errors.email)}
                                    value={values.email}
                                    variant="outlined"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => handleClose(resetForm)}>Cancel</Button>
                            <Button
                                variant="contained"
                                endIcon={
                                    isSubmitting && <CircularProgress size={20} color="inherit"/>
                                }
                                disabled={!dirty || isSubmitting}
                                onClick={handleSubmit}
                                color="primary"
                            >
                                {!isSubmitting && "Send"}
                            </Button>
                        </DialogActions>
                    </GlassDialog>
                )}
            </Formik>
        );
    }
;

export default AddMemberModal;
