import React, {Fragment, useState, useEffect} from 'react';
import {withFirebase} from 'data/firebase';
import CategoryElement from 'components/views/group/admin/CategoryElement';
import CategoryEdit from "../CategoryEdit";
import CircularProgress from '@material-ui/core/CircularProgress';
import EditIcon from '@material-ui/icons/Edit';
import {Button, Typography} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import TextField from "@material-ui/core/TextField";


const Settings = ({groupId, group, firebase, getCareerCenter}) => {

    const [categories, setCategories] = useState([]);
    const [createMode, setCreateMode] = useState(false)
    const [description, setDescription] = useState("")
    const [descriptionError, setDescriptionError] = useState(null)
    const [editDescription, setEditDescription] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (groupId) {
            firebase.listenToGroupCategories(groupId, querySnapshot => {
                let categories = [];
                querySnapshot.forEach(doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    categories.push(category);
                });
                setCategories(categories);
            })
        }
    }, [groupId]);

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
            await getCareerCenter()
            setEditDescription(false)
            setSubmitting(false)
        } catch (e) {
            console.log("error in save desc", e)
        }

    }


    const categoryElements = categories.map((category, index) => {
        return (
            <div key={index}>
                <CategoryElement groupId={groupId} category={category}/>
            </div>
        );
    })

    return (
        <Fragment>
            <div className="about-wrapper">
                <div className="btn-title-wrapper">
                    <h3 className='sublabel'>About</h3>
                    <div>
                        {editDescription ?
                            <Button variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleSaveDesc}
                                    endIcon={submitting && <CircularProgress size={20} color="inherit"/>}>
                                Save
                            </Button> :
                            <Button variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() => setEditDescription(true)}
                                    endIcon={<EditIcon/>}>
                                Edit
                            </Button>}
                        {editDescription &&
                        <Button variant="contained"
                                style={{marginLeft: 10}}
                                size="large"
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
            <div style={{marginTop: 10}} className="btn-title-wrapper">
                <h3 className='sublabel'>Settings</h3>
                <Button variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => setCreateMode(true)}
                        disabled={createMode}
                        endIcon={<AddIcon/>}>
                    Add Category
                </Button>
            </div>
            {createMode ?
                <CategoryEdit groupId={groupId} category={{}} options={[]} newCategory={true}
                              setEditMode={setCreateMode}/> : null
            }
            {categoryElements}
            <style jsx>{`
                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0 0 0;
                    color: rgb(80,80,80);
                }
                
                .btn-title-wrapper{
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  width: 100%;
                  text-align: left;
                  margin: 0 0 20px 0;
                }
                
                .about-wrapper {
                  display: flex;
                  flex-direction: column;
                }
                
  
            `}</style>
        </Fragment>
    );
}

export default withFirebase(Settings);