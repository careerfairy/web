import React from "react";
import {
    Box,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField, useMediaQuery,
} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import {Formik} from "formik";
import FormControl from "@material-ui/core/FormControl";
import {withFirebase} from "../../../../../../../context/firebase";
import {useTheme} from "@material-ui/core/styles";

const FeedbackModal = ({
                           state: {open, data},
                           handleClose,
                           firebase,
                           currentStream,
                       }) => {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down("xs"))
    return (
        <Formik
            autoComplete="off"
            initialValues={{
                question: data.question || "",
                appearAfter: data.appearAfter || 15,
                hasText: data.hasText || false,
                isForEnd: data.isForEnd || false
            }}
            enableReinitialize
            validate={(values) => {
                let errors = {};
                const minQuestionLength = 5;
                if (!values.question) {
                    errors.question = "Required";
                } else if (values.question.length < minQuestionLength) {
                    errors.question = `Must be at least ${minQuestionLength} characters`;
                }
                return errors;
            }}
            onSubmit={async (values, {setFieldError}) => {
                try {
                    const {id: feedbackId} = data;
                    const {id: livestreamId} = currentStream;
                    if (feedbackId && livestreamId) {
                        await firebase.updateFeedbackQuestion(
                            livestreamId,
                            feedbackId,
                            values
                        );
                    } else if (livestreamId) {
                        await firebase.createFeedbackQuestion(livestreamId, values);
                    }
                    handleClose();
                } catch (e) {
                    setFieldError("appearAfter", e);
                }
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
                  dirty,
                  /* and other goodies */
              }) => {
                return (
                    <Dialog
                        TransitionComponent={Slide}
                        open={open}
                        fullWidth
                        fullScreen={fullScreen}
                        maxWidth="sm"
                    >
                        <DialogTitle>{currentStream?.company}</DialogTitle>
                        <DialogContent>
                            <Box marginY={2}>
                                <TextField
                                    fullWidth
                                    helperText={errors.question}
                                    label="Question"
                                    disabled={isSubmitting}
                                    name="question"
                                    onChange={handleChange}
                                    required
                                    error={Boolean(errors.question)}
                                    value={values.question}
                                    variant="outlined"
                                />
                            </Box>
                            <Box marginY={2}>
                                <FormControl
                                    error={Boolean(errors.appearAfter)}
                                    variant="outlined"
                                    fullWidth
                                    required
                                >
                                    <InputLabel htmlFor="appearAfter" shrink component="legend">
                                        This Question will automatically appear in the stream after:
                                    </InputLabel>
                                    <Select
                                        label="This Question will automatically appear in the stream after:"
                                        name="appearAfter"
                                        id="appearAfter"
                                        onChange={(e) => handleChange(e)}
                                        value={values.appearAfter}
                                    >
                                        <MenuItem value={5} label="10 minutes">
                                            5 minutes
                                        </MenuItem>
                                        <MenuItem value={10} label="10 minutes">
                                            10 minutes
                                        </MenuItem>
                                        <MenuItem value={15} label="15 minutes">
                                            15 minutes
                                        </MenuItem>
                                        <MenuItem value={20} label="20 minutes">
                                            20 minutes
                                        </MenuItem>
                                        <MenuItem value={25} label="25 minutes">
                                            25 minutes
                                        </MenuItem>
                                        <MenuItem value={30} label="30 minutes">
                                            30 minutes
                                        </MenuItem>
                                        <MenuItem value={35} label="35 minutes">
                                            35 minutes
                                        </MenuItem>
                                        <MenuItem value={40} label="40 minutes">
                                            40 minutes
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.appearAfter}</FormHelperText>
                                </FormControl>
                            </Box>
                            <Box marginY={2}>
                                <FormControl variant="outlined" fullWidth required>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                onChange={(e) => handleChange(e)}
                                                checked={Boolean(values.hasText)}
                                                name="hasText"
                                                color="primary"
                                            />
                                        }
                                        label="Enable Written Reviews"
                                    />
                                </FormControl>
                            </Box>
                            <Box marginY={2}>
                                <FormControl variant="outlined" fullWidth required>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                onChange={(e) => handleChange(e)}
                                                checked={Boolean(values.isForEnd)}
                                                name="isForEnd"
                                                color="primary"
                                            />
                                        }
                                        label="Prompt Question When Stream Ends"
                                    />
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button
                                variant="contained"
                                endIcon={
                                    isSubmitting && <CircularProgress size={20} color="inherit"/>
                                }
                                disabled={!dirty || isSubmitting}
                                onClick={handleSubmit}
                                color="primary"
                            >
                                {!isSubmitting && "Confirm"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            }}
        </Formik>
    );
};

export default withFirebase(FeedbackModal);
