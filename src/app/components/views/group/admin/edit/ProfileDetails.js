import React from 'react';
import clsx from 'clsx';
import {Formik} from 'formik';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    TextField,
    CircularProgress,
} from '@material-ui/core';
import {useSnackbar} from "notistack";
import {CAREER_CENTER_COLLECTION, COMPANY_COLLECTION, GENERAL_ERROR} from "../../../../util/constants";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    root: {}
}));

const ProfileDetails = ({group, firebase, className, isCompany, ...rest}) => {
        const classes = useStyles();
        const {enqueueSnackbar} = useSnackbar()

        const handleSubmitForm = async (values, {setStatus}) => {
            try {
                const collection = isCompany ? COMPANY_COLLECTION : CAREER_CENTER_COLLECTION
                await firebase.updateGroup(group.id, values, collection);
                enqueueSnackbar("Your profile has been updated!", {
                    variant: "success",
                    preventDuplicate: true,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                })
            } catch (e) {
                console.log("error", e);
                enqueueSnackbar(GENERAL_ERROR, {
                    variant: "error",
                    preventDuplicate: true,
                })
                setStatus(e)
            }
        }

        const initialValues = isCompany ? {
            name: group.name || "",
            description: group.description || "",
            extraInfo: group.extraInfo || ""
        } : {
            universityName: group.universityName || "",
            description: group.description || "",
            extraInfo: group.extraInfo || ""
        }

        return (
            <Formik
                autoComplete="off"
                initialValues={initialValues}
                enableReinitialize
                validate={(values) => {
                    let errors = {}
                    const minDescCharLength = 10
                    const minGroupNameLength = 5
                    const extraInfoMaxLength = 700
                    if (!values.description) {
                        errors.description = "Please fill"
                    } else if (values.description.length < minDescCharLength) {
                        errors.description = `Must be at least ${minDescCharLength} characters`
                    }
                    if (values.extraInfo.length > extraInfoMaxLength) {
                        errors.extraInfo = `Cannot be more than ${extraInfoMaxLength} characters`
                    }

                    if (!isCompany && !values.universityName) {
                        errors.universityName = "Please fill"
                    } else if (!isCompany && values.universityName < minGroupNameLength) {
                        errors.universityName = `Must be at least ${minGroupNameLength} characters`
                    }
                    if (isCompany && !values.name) {
                        errors.name = "Please fill"
                    } else if (isCompany && values.name < minGroupNameLength) {
                        errors.name = `Must be at least ${minGroupNameLength} characters`
                    }
                    return errors
                }}
                onSubmit={handleSubmitForm}
                className={clsx(classes.root, className)}
                {...rest}
            >{({
                   values,
                   errors,
                   touched,
                   handleChange,
                   handleBlur,
                   handleSubmit,
                   isSubmitting,
                   setFieldValue,
                   setValues,
                   dirty,
                   validateForm,
                   /* and other goodies */
               }) => (
                <Card>
                    <CardHeader
                        subheader="The information can be edited"
                        title="Details"
                    />
                    <Divider/>
                    <CardContent>
                        <Grid
                            container
                            spacing={3}
                        >
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    helperText={isCompany ? errors.name : errors.universityName}
                                    label={isCompany ? "Company Name" : "Group Name"}
                                    disabled={isSubmitting}
                                    name={isCompany ? "name" : "universityName"}
                                    onChange={handleChange}
                                    required
                                    error={Boolean(isCompany ? errors.name : errors.universityName)}
                                    value={isCompany ? values.name : values.universityName}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
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
                            </Grid>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
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
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider/>
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        p={2}
                    >
                        <Button
                            disabled={!dirty}
                            onClick={handleSubmit}
                            color="primary"
                            variant="contained"
                            endIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                        >
                            {isSubmitting ? "Updating" : "Save details"}
                        </Button>
                    </Box>
                </Card>)}
            </Formik>
        );
    }
;

ProfileDetails.propTypes = {
    className: PropTypes.string,
    firebase: PropTypes.object,
    group: PropTypes.object,
    isCompany: PropTypes.bool
}

export default ProfileDetails;
