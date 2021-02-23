import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import CategoryElement from 'components/views/group/admin/settings/Category/CategoryElement';
import CategoryEdit from "./Category/CategoryEdit";
import EditIcon from '@material-ui/icons/Edit';
import { Button, Typography, CircularProgress, TextField } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    buttonTitle: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        margin: "0 0 20px 0",
        width: "100%"
    }
}));

const Settings = ({group, firebase}) => {
    const classes = useStyles()

    const [createMode, setCreateMode] = useState(false)
    const [description, setDescription] = useState("")
    const [descriptionError, setDescriptionError] = useState(null)
    const [editDescription, setEditDescription] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (group) {
            setDescription(group.description)
        }
    }, [group])

    useEffect(() => {
        if (descriptionError && description.length > 1) {
            setDescriptionError(null)
        }
    }, [description, descriptionError])

    const handleSaveDesc = async () => {
        if (!description.length) return setDescriptionError("Cannot be empty")
        try {
            setSubmitting(true)
            await firebase.updateCareerCenter(group.id, {description: description})
            setEditDescription(false)
            setSubmitting(false)
        } catch (e) {
            console.log("error in save desc", e)
        }

    }


    const categoryElements = group.categories?.map((category, index) => {
        return (
            <div key={index}>
                <CategoryElement group={group} category={category}/>
            </div>
        );
    })

    return (
        <Fragment>
            <div style={{marginBottom: 10}}>
                <div className={classes.buttonTitle}>
                    <Typography  variant="h5">About</Typography>
                    <div>
                        {editDescription ?
                            <Button variant="contained"
                                    color="primary"
                                    size="medium"
                                    onClick={handleSaveDesc}
                                    endIcon={submitting && <CircularProgress size={20} color="inherit"/>}>
                                Save
                            </Button> :
                            <Button variant="contained"
                                    color="primary"
                                    size="medium"
                                    onClick={() => setEditDescription(true)}
                                    endIcon={<EditIcon/>}>
                                Edit
                            </Button>}
                        {editDescription &&
                        <Button variant="contained"
                                style={{marginLeft: 10}}
                                size="medium"
                                onClick={() => {
                                    setEditDescription(false)
                                    setDescription(group.description)
                                }}>
                            Cancel
                        </Button>}
                    </div>
                </div>
                {editDescription ? <TextField
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    error={descriptionError}
                    value={description}
                    placeholder="Please describe the purpose of your group"
                    style={{marginBottom: 30}}
                    helperText={descriptionError}
                    disabled={submitting}
                    rowsMax={10}
                    name="description"
                    multiline
                    fullWidth
                /> : <Typography align="left">
                    {group.description}
                </Typography>}
            </div>
            <div className={classes.buttonTitle}>
                <Typography variant="h5">Categories</Typography>
                <Button variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => setCreateMode(true)}
                        disabled={createMode}
                        endIcon={<AddIcon/>}>
                    Add Category
                </Button>
            </div>
            {createMode ?
                <CategoryEdit group={group} category={{}} options={[]} newCategory={true}
                              setEditMode={setCreateMode}/> : null
            }
            {categoryElements}
        </Fragment>
    );
}

export default withFirebase(Settings);