import React, {Fragment, useState} from 'react';
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
    makeStyles
} from '@material-ui/core';
import {validateStreamForm} from "../../../../helperFunctions/streamFormFunctions";
import {useSnackbar} from "notistack";
import {GENERAL_ERROR} from "../../../../util/constants";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import CategoryElement from "../settings/Category/CategoryElement";
import CategoryEdit from "../settings/Category/CategoryEdit";

const states = [
    {
        value: 'alabama',
        label: 'Alabama'
    },
    {
        value: 'new-york',
        label: 'New York'
    },
    {
        value: 'san-francisco',
        label: 'San Francisco'
    }
];

const useStyles = makeStyles(() => ({
    root: {}
}));

const ProfileCategories = ({group, firebase, className, ...rest}) => {
        const classes = useStyles();
        const {enqueueSnackbar} = useSnackbar()
        const [createMode, setCreateMode] = useState(false);

        const handleSubmitForm = async (values, {setStatus}) => {
            try {
                await firebase.updateCareerCenter(group.id, {
                    description: values.description,
                    universityName: values.universityName,
                });
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

        return (

            <Card>
                <CardHeader
                    subheader="The information can be edited"
                    title="Categories"
                />
                <Divider/>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        {group.categories?.map((category) => {
                            return (
                                <Grid
                                    key={category.id}
                                    item
                                    md={12}
                                    xs={12}
                                >
                                    <CategoryElement group={group} category={category}/>
                                </Grid>
                            );
                        })}
                        {createMode &&
                        <Grid
                            item
                            md={12}
                            xs={12}
                        >
                            <CategoryEdit
                                group={group}
                                category={{}}
                                options={[]}
                                newCategory={true}
                                setEditMode={setCreateMode}/>
                        </Grid>
                        }
                    </Grid>
                </CardContent>
                <Divider/>
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    p={2}
                >
                    <Button variant="contained"
                            color="primary"
                            size="medium"
                            onClick={() => setCreateMode(true)}
                            disabled={createMode}
                            endIcon={<AddIcon/>}>
                        Add Category
                    </Button>
                </Box>
            </Card>
        );
    }
;

ProfileCategories.propTypes =
    {
        className: PropTypes.string
    }
;

export default ProfileCategories;
