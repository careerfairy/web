import { Fragment, useState, useEffect } from 'react';
import { Grid, Image, Button, Icon, Modal, Dropdown, Input, Header } from "semantic-ui-react";

import { useRouter } from 'next/router';
import { withFirebase } from "data/firebase";
import CategoryElement from './CategoryElement';
import CategoryEditOption from './CategoryEditOption';


function CategoryEditModal(props) {

    const [categoryName, setCategoryName] = useState('');

    const [editableOptions, setEditableOptions] = useState([]);

    const [selectedOption, setSelectedOption] = useState(null);
    const [updateMode, setUpdateMode] = useState({});



    useEffect(() => {
        if (props.category && props.category.name) {
            setCategoryName(props.category.name);
        }
    }, [props.category.name]);

    useEffect(() => {
        if (props.options && props.options.length > 0) {
            setEditableOptions(props.options);
        }
    }, [props.options]);

    useEffect(() => {
        setUpdateMode({});
    }, [editableOptions]);

    // const handleBlur = (field) => (evt) => {    this.setState({      touched: { ...this.state.touched, [field]: true },    });  }

    function handleDelete(removedOption) {
        let newList = [];
        if (removedOption.id) {
            newList = editableOptions.filter(option => option.id !== removedOption.id);
        } else {
            newList = editableOptions.filter(option => option.id || option.name !== removedOption.name);
        }
        setEditableOptions(newList);
    }

    function handleDeleteCategory(){
        props.firebase.deleteGroupCategoryWithElements(props.groupId, props.category.id, editableOptions)
            .then(props.setEditMode(false))
    }

    function handleAdd(newOption) {
        const newList = [...editableOptions, newOption];
        setEditableOptions(newList);
    }

    function handleRename(newOption) {
        const newList = editableOptions.map( option => {
            if (option.id === newOption.id) {
                return newOption;
            } else {
                return option;
            }
        })
        setEditableOptions(newList);
    }

    function saveChanges() {
        if( props.newCategory ) {
            props.firebase.addGroupCategoryWithElements(props.groupId, categoryName, editableOptions).then(() => {
                props.setEditMode(false);
            })
        } else {
            let optionsToDelete = props.options.filter( option => {
                return !editableOptions.find( editableOption => editableOption.id === option.id);
            })
            props.firebase.updateGroupCategoryElements(props.groupId, props.category.id, categoryName, editableOptions, optionsToDelete).then(() => {
                props.setEditMode(false);
            });
        }
    }

    const optionElements = editableOptions.map((option, index) => {
        return (
            <Fragment key={index}>
                <div className={'option-container animated fadeIn'} style={{ zIndex: selectedOption === option ? '10' : '0'}}>
                    <div className='option-name'>
                        { option.name }
                    </div>
                    <Dropdown icon={{ name: 'edit', onClick: () => setSelectedOption(option) }} direction='right' style={{ margin: '0 0 0 5px'}}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                text='Rename'
                                onClick={() => setUpdateMode({ mode: 'rename', option: option })}
                            />
                            <Dropdown.Item
                                text='Delete'
                                onClick={() => setUpdateMode({ mode: 'delete', option: option })}
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
        
    return(
        <Fragment>
            <div className='white-box'>
                <Grid>
                    <Grid.Column width={5}>
                        <div className='white-box-label'>Category Name</div>
                        <div className='white-box-title'>
                            <Input error={!categoryName.length} type='text' value={categoryName} onChange={(event, data) => setCategoryName(data.value)} fluid/>
                        </div>
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <div className='white-box-label'>Category Options</div>
                       { optionElements } 
                       <Button icon='add' size='mini' circular primary onClick={() => setUpdateMode({ mode: 'add' })} style={{ margin: '0 0 0 2px', boxShadow: '0 0 2px grey'}}/>
                    </Grid.Column>
                </Grid>  
                <CategoryEditOption categoryName={categoryName} handleDeleteCategory={handleDeleteCategory} updateMode={updateMode} setUpdateMode={setUpdateMode} handleAdd={handleAdd} handleDelete={handleDelete} handleRename={handleRename}/>
                <div className='separator'></div>
                <div className="button-wrapper">
                    <div>
                        <Button content='Save' onClick={() => saveChanges()} primary/>
                        <Button content='Cancel' onClick={() => props.setEditMode(false)}/>
                    </div>
                    {!props.newCategory && <Button onClick={() => setUpdateMode({ mode: 'deleteCategory', option: {name: categoryName} })} inverted color='red' className="red-delete-btn" content='Delete'/>}
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
            `}</style>
        </Fragment>
    );
}

export default withFirebase(CategoryEditModal);