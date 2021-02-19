import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Slide,
    TextField
} from "@material-ui/core";
import {useFormik} from 'formik';
import {EMAIL_REGEX} from "../../util/constants";
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({}));

const EnterDetailsModal = ({open, onClose, handleSubmit, userInfo}) => {

    const formik = useFormik({
        initialValues: {
            name: `${userInfo.firstName} ${userInfo.lastName}`,
            email: '',
        },
        onSubmit: async values => {
            await handleSubmit;
        },
        validate: values => {
            let errors = {};
            if (!values.email) {
                errors.email = 'Please enter your email';
            } else if (!EMAIL_REGEX.test(values.email)) {
                errors.email = 'Please enter a valid Email';
            }
            if (!values.name) {
                errors.firstName = 'Name is required';
            }
            return errors;
        }
    });

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog TransitionComponent={Slide} onClose={handleClose} open={open}>
            <DialogTitle>
                Enter Details
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please provide details for this approval request
                    so that both you and the event organisers can receive an email confirmation
                </DialogContentText>
                <TextField
                    fullWidth
                    helperText={formik.errors.name}
                    label="Name"
                    autoComplete="name"
                    disabled={formik.isSubmitting}
                    name="name"
                    onChange={formik.handleChange}
                    required
                    error={Boolean(formik.errors.name)}
                    value={formik.values.name}
                />
                <TextField
                    fullWidth
                    helperText={formik.errors.email}
                    label="Email"
                    autoComplete="email"
                    disabled={formik.isSubmitting}
                    name="email"
                    onChange={formik.handleChange}
                    required
                    error={Boolean(formik.errors.email)}
                    value={formik.values.email}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={formik.isSubmitting || !formik.dirty || !formik.isValid}
                >
                    Submit Approval
                </Button>
            </DialogActions>

        </Dialog>
    );
};

EnterDetailsModal.prototypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
}

EnterDetailsModal.defaultProps = {
    open: false,
    onClose: () => {},
    handleSubmit: () => {},
}

export default EnterDetailsModal;
