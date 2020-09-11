import React, {Fragment, useState, useEffect} from 'react';
import {Grid, Dropdown, Input} from "semantic-ui-react";
import AddIcon from '@material-ui/icons/Add';

import {withFirebase} from "data/firebase";
import CategoryEditOption from './CategoryEditOption';
import {Box, Button, IconButton, Paper, Typography} from "@material-ui/core";
import {v4 as uuidv4} from 'uuid'
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    option: {
        display: "inline-block",
        border: "1px solid black",
        borderRadius: "20px",
        padding: "5px 10px",
        margin: "2px",
    },
    whiteBox: {
        backgroundColor: "white",
        padding: "20px",
        margin: "10px 0",
        display: "flex",
        flexDirection: "column",
    },
    label: {
        fontSize: "0.8em",
        fontWeight: "700",
        color: "rgb(160,160,160)",
        margin: "0 0 5px 0",
    },
    title: {
        fontSize: "1.2em",
        fontWeight: "700",
        color: "rgb(80,80,80)",
    },
    chip: {
        margin: theme.spacing(0.5),
        border: "1px solid black"
    }
}));

function CategoryEditModal({category, handleDeleteLocalCategory, handleUpdateCategory, newCategory, firebase, setEditMode, handleAddTempCategory, group, groupId, isLocal}) {
    const classes = useStyles()

    const [categoryName, setCategoryName] = useState('');

    const [editableOptions, setEditableOptions] = useState([]);


    const [selectedOption, setSelectedOption] = useState(null);
    const [updateMode, setUpdateMode] = useState({});

    const [touched, setTouched] = useState(false)
    const [errorObj, setErrorObj] = useState({inputError: false, optionError: false})


    useEffect(() => {
        if (editableOptions && editableOptions.length >= 2) {
            setErrorObj({...errorObj, optionError: false})
        }
    }, [editableOptions.length]);


    useEffect(() => {
        if (category && category.name) {
            setCategoryName(category.name);
        }
    }, [category.name]);

    useEffect(() => {
        if (category.options && category.options.length > 0) {
            setEditableOptions(category.options);
        }
    }, [category.options]);

    useEffect(() => {
        setUpdateMode({});
    }, [editableOptions]);

    function handleDelete(removedOption) {
        let newList = [];
        if (removedOption.id) {
            newList = editableOptions.filter(optionEl => optionEl.id !== removedOption.id);
        } else {
            newList = editableOptions.filter(optionEl => optionEl.id || optionEl.name !== removedOption.name);
        }
        setEditableOptions(newList);
    }

    function handleDeleteCategory() {
        if (isLocal) {
            handleDeleteLocalCategory(category.id)
            return setEditMode(false)
        }
        const existingCategories = [...group.categories]
        const newCategories = existingCategories.filter(el => el.id !== category.id)
        firebase.updateGroupCategoryElements(group.id, newCategories).then(() => {
            setEditMode(false);
        })
    }

    function handleAdd(newOption) {
        const newList = [...editableOptions, newOption];
        setEditableOptions(newList);
    }

    function handleBlur() {
        setTouched(true)
    }

    function handleRename(newOption) {
        const newList = editableOptions.map(optionEl => {
            if (optionEl.id === newOption.id) {
                return newOption;
            } else {
                return optionEl;
            }
        })
        setEditableOptions(newList);
    }

    function buildCategory() {
        const newId = uuidv4()
        return {
            name: categoryName,
            options: editableOptions,
            id: newId
        }
    }

    function handleErrors() {
        const errors = {
            inputError: categoryName.length < 1,
            optionError: editableOptions.length < 2
        }
        setErrorObj(errors)
        setTouched(!categoryName.length > 0)
        return (errors.inputError || errors.optionError)
    }

    function saveChanges() {
        if (handleErrors()) return
        if (isLocal) {
            if (newCategory) {
                //Add a newly created temp category Obj
                handleAddTempCategory(buildCategory())
            } else {
                //update an already created temp category obj
                category.name = categoryName
                category.options = editableOptions
                handleUpdateCategory(category)
            }
            return setEditMode(false)
        }
        if (newCategory && !isLocal) {
            firebase.addGroupCategoryWithElements(group.id, buildCategory()).then(() => {
                setEditMode(false);
            })
        } else {
            const newCategories = [...group.categories]
            const index = newCategories.findIndex(el => el.id === category.id)
            newCategories[index].name = categoryName
            newCategories[index].options = editableOptions
            firebase.updateGroupCategoryElements(group.id, newCategories).then(() => {
                setEditMode(false);
            })
        }

    }

    const optionElements = editableOptions.map((optionEl, index) => {
        return (
            <Fragment key={index}>
                <div className={'option-container animated fadeIn'}
                     style={{zIndex: selectedOption === optionEl ? '10' : '0'}}>
                    <div className='option-name'>
                        {optionEl.name}
                    </div>
                    <Dropdown icon={{name: 'edit', onClick: () => setSelectedOption(optionEl)}} direction='right'
                              style={{margin: '0 0 0 5px'}}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                text='Rename'
                                onClick={() => setUpdateMode({
                                    mode: 'rename',
                                    option: optionEl,
                                    options: editableOptions
                                })}
                            />
                            <Dropdown.Item
                                text='Delete'
                                onClick={() => setUpdateMode({mode: 'delete', option: optionEl})}
                            />
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <style jsx>{`
                    .hidden {
                        display: none
                    }

                    .option-container {
                        position: relative;
                        display: inline-block;
                        border: 1px solid rgb(52,73,102);
                        background-color: white;
                        border-radius: 20px;
                        padding: 5px 10px;
                        margin: 2px;
                        color: rgb(52,73,102);
                        box-shadow: 0 0 2px grey;
                    }

                    .option-name {
                        display: inline-block;
                    }

                    .update {
                        background-color: rgb(52,73,102);
                        color: white;
                    }
                `}</style>
            </Fragment>
        );
    });

    return (
        <Fragment>
            <Paper className={classes.whiteBox}>
                <Grid>
                    <Box flex="0.3">
                        <Typography align="left" className={classes.label}>Category Name</Typography>
                        <div className='white-box-title'>
                            <Input autoFocus maxLength="40" error={touched && !categoryName.length} onBlur={handleBlur}
                                   type='text' value={categoryName}
                                   onChange={(event, data) => setCategoryName(data.value)} fluid/>
                            {touched && !categoryName.length && <p className="error-field">Required</p>}
                        </div>
                    </Box>
                    <Box flex="0.7">
                        <Typography align="left" className={classes.label}>Category Options</Typography>
                        {optionElements}
                        <IconButton size="small" onClick={() => setUpdateMode({mode: 'add', options: editableOptions})}>
                            <AddIcon fontSize="large" color="primary"/>
                        </IconButton>
                        {errorObj.optionError && <p className="error-field">You must add at least 2 options</p>}
                    </Box>
                </Grid>
                <CategoryEditOption categoryName={categoryName} handleDeleteCategory={handleDeleteCategory}
                                    updateMode={updateMode} setUpdateMode={setUpdateMode} handleAdd={handleAdd}
                                    handleDelete={handleDelete} handleRename={handleRename} groupId={groupId}/>
                <div className='separator'/>
                <div className="button-wrapper">
                    <div>
                        <Button onClick={() => saveChanges()}
                                color="primary"
                                style={{marginRight: 10}}
                                variant="contained">
                            {newCategory ? 'Create' : 'Update'}
                        </Button>
                        <Button onClick={() => setEditMode(false)}
                                variant="contained">
                            Cancel
                        </Button>
                    </div>
                    {!newCategory &&
                    <Button onClick={() => setUpdateMode({mode: 'deleteCategory', option: {name: categoryName}})}
                            color="secondary"
                            variant="outlined">
                        Delete
                    </Button>
                    }
                </div>
            </Paper>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .separator {
                    width: 100%;
                    height: 1px;
                    background-color: rgb(230,230,230);
                    margin: 20px 0;
                }
                
                .button-wrapper {
                    display: flex;
                    justify-content: space-between;
                }
                
                .white-box {
                    position: relative;
                    background-color: white;
                    box-shadow: 0 0 5px rgb(190,190,190);
                    border-radius: 5px;
                    padding: 20px;
                    margin: 10px 0;
                    text-align: left;
                    overflow: hidden;
                }

                .white-box-label {
                    font-size: 0.8em;
                    font-weight: 700;
                    color: rgb(160,160,160);
                    margin: 20px 0 10px 0; 
                }

                .white-box-title {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: rgb(80,80,80);
                    margin: 10px 0 20px 0;
                }

                .secondary-input {
                    margin: 20px 0 30px 0;
                }

                .option-container {
                    display: inline-block;
                    border: 1px solid rgb(52,73,102);
                    background-color: rgb(52,73,102);
                    border-radius: 20px;
                    padding: 9px 15px;
                    margin: 20px 0;
                    color: white;
                    box-shadow: 0 0 2px grey;
                    font-size: 1.2em;
                }
                .error-field{
                  position: absolute;
                  font-size: 1rem;
                  font-weight: lighter;
                  margin-top: 5px;
                  color: red;
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(CategoryEditModal);