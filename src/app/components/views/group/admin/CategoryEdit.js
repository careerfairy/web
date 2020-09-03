import {Fragment, useState, useEffect} from 'react';
import {Grid, Image, Button, Icon, Modal, Dropdown, Input, Header} from "semantic-ui-react";

import {withFirebase} from "data/firebase";
import CategoryEditOption from './CategoryEditOption';


function CategoryEditModal({category, options, handleUpdateCategory, groupId, newCategory, firebase, setEditMode, handleAddTempCategory}) {
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
        if (options && options.length > 0) {
            setEditableOptions(options);
        }
    }, [options]);

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
        firebase.deleteGroupCategoryWithElements(groupId, category.id, editableOptions)
            .then(setEditMode(false))
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

    function saveChanges() {
        const errors = {
            inputError: categoryName.length < 1,
            optionError: editableOptions.length < 2
        }
        setErrorObj(errors)
        setTouched(!categoryName.length > 0)
        if (errors.inputError || errors.optionError) return
        if (groupId === "temp") {
            if (newCategory) {
                //Add a newly created temp category Obj
                const tempId = Math.random().toString(36).substr(2, 5)
                const tempCategoryObj = {
                    name: categoryName,
                    options: editableOptions,
                    id: tempId
                }
                handleAddTempCategory(tempCategoryObj)
            } else {
                //update an already created temp category obj
                console.log("editableOptions", editableOptions)
                category.name = categoryName
                category.options = editableOptions
                handleUpdateCategory(category)
            }
            return setEditMode(false)
        }
        if (newCategory) {
            firebase.addGroupCategoryWithElements(groupId, categoryName, editableOptions).then(() => {
                setEditMode(false);
            })
        } else {
            let optionsToDelete = options.filter(optionEl => {
                return !editableOptions.find(editableOption => editableOption.id === optionEl.id);
            })
            firebase.updateGroupCategoryElements(groupId, category.id, categoryName, editableOptions, optionsToDelete).then(() => {
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
                                onClick={() => setUpdateMode({mode: 'rename', option: optionEl})}
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
            <div className='white-box'>
                <Grid>
                    <Grid.Column width={5}>
                        <div className='white-box-label'>Category Name</div>
                        <div className='white-box-title'>
                            <Input maxLength="40" error={touched && !categoryName.length} onBlur={handleBlur}
                                   type='text' value={categoryName}
                                   onChange={(event, data) => setCategoryName(data.value)} fluid/>
                            {touched && !categoryName.length && <p className="error-field">Required</p>}
                        </div>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <div className='white-box-label'>Category Options</div>
                        {optionElements}
                        <Button icon='add' size='mini' circular primary onClick={() => setUpdateMode({mode: 'add'})}
                                style={{margin: '0 0 0 2px', boxShadow: '0 0 2px grey'}}/>
                        {errorObj.optionError && <p className="error-field">You must add at least 2 options</p>}
                    </Grid.Column>
                </Grid>
                <CategoryEditOption categoryName={categoryName} handleDeleteCategory={handleDeleteCategory}
                                    updateMode={updateMode} setUpdateMode={setUpdateMode} handleAdd={handleAdd}
                                    handleDelete={handleDelete} handleRename={handleRename} groupId={groupId}/>
                <div className='separator'></div>
                <div className="button-wrapper">
                    <div>
                        <Button content={newCategory ? 'Create' : 'Update'} onClick={() => saveChanges()} primary/> :
                        <Button content='Cancel' onClick={() => setEditMode(false)}/>
                    </div>
                    {!newCategory &&
                    <Button onClick={() => setUpdateMode({mode: 'deleteCategory', option: {name: categoryName}})}
                            inverted color='red' className="red-delete-btn" content='Delete'/>}
                </div>
            </div>
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