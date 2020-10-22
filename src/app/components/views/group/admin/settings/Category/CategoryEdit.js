import React, {useState, useEffect} from 'react';
import AddIcon from '@material-ui/icons/Add';
import {withFirebase} from "context/firebase";
import {AddCategory, DeleteCategory, DeleteOption, RenameOption} from './Option/CategoryEditOption';
import {
    Zoom,
    Box,
    Button,
    FormHelperText,
    IconButton,
    Paper,
    Typography,
    TextField,
    Menu, MenuItem, Chip
} from "@material-ui/core";
import {v4 as uuidv4} from 'uuid'
import {makeStyles} from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "20px",
        margin: "10px 0",
        display: "flex",
        flexDirection: "column"
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
    },
    error: {
        position: "absolute",
        fontSize: "1rem",
        fontWeight: "lighter",
        marginTop: "5px",
        color: "red",
    },
    separate: {
        width: "100%",
        height: "1px",
        backgroundColor: "rgb(230,230,230)",
        margin: "20px 0",
    },
    errorButton:{
        background: theme.palette.error.main,
        color: theme.palette.error.contrastText
    }
}));


function CategoryEditModal({category, handleDeleteLocalCategory, handleUpdateCategory, newCategory, firebase, setEditMode, handleAddTempCategory, group, groupId, isLocal}) {
    const classes = useStyles()

    const [categoryName, setCategoryName] = useState('');

    const [editableOptions, setEditableOptions] = useState([]);

    const [selectedOption, setSelectedOption] = useState(null);
    const [updateMode, setUpdateMode] = useState({});

    const [touched, setTouched] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
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
            let sortedOptions = [...category.options]
            sortedOptions.sort(dynamicSort("name"))
            setEditableOptions(sortedOptions);
        }
    }, [category.options]);

    function handleDelete(removedOption) {
        let newList = [];
        if (removedOption.id) {
            newList = editableOptions.filter(optionEl => optionEl.id !== removedOption.id);
        } else {
            newList = editableOptions.filter(optionEl => optionEl.id || optionEl.name !== removedOption.name);
        }
        setEditableOptions(newList);
        setUpdateMode({})
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

    const handleDropDownDel = () => {
        setAnchorEl(null)
        setUpdateMode({mode: 'delete', option: selectedOption})
    }
    const handleDropDownRename = () => {
        setAnchorEl(null)
        setUpdateMode({
            mode: 'rename',
            option: selectedOption,
            options: editableOptions
        })
    }

    const handleOpenDropDown = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const dynamicSort = (property) => {
        let sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            /* next line works with strings and numbers,
             * and you may want to customize it to your needs
             */
            const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }


    const optionElements = editableOptions.map(el => {
        return (
            <Zoom in={el.id}>
                <Chip label={el.name}
                      variant="outlined"
                      deleteIcon={<EditIcon/>}
                      onDelete={(e) => {
                          setSelectedOption(el)
                          handleOpenDropDown(e)
                      }}/>
            </Zoom>
        )
    })

    return (
        <Paper className={classes.root}>
            <Box display="flex" flexDirection="column">
                <TextField autoFocus
                           style={{marginBottom: "10px"}}
                           label={<Typography align="left" className={classes.label}>Category Name</Typography>}
                           inputProps={{maxLength: 40}}
                           error={Boolean(touched && !categoryName.length)}
                           onBlur={handleBlur}
                           helperText={touched && !categoryName.length && "Required"}
                           value={categoryName}
                           onChange={(e) => setCategoryName(e.currentTarget.value)}/>
                <Box>
                    <Typography align="left" className={classes.label}>Category Options</Typography>
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                        {optionElements}
                        <IconButton size="small"
                                    onClick={() => setUpdateMode({mode: 'add', options: editableOptions})}>
                            <AddIcon fontSize="large" color="primary"/>
                        </IconButton>
                    </div>
                    <FormHelperText
                        error>{errorObj.optionError && "You must add at least 2 options"}</FormHelperText>
                </Box>
            </Box>
            <div className={classes.separate}/>
            <Box display="flex" justifyContent="space-between">
                <div>
                    <Button onClick={() => saveChanges()}
                            color="primary"
                            size="small"
                            style={{marginRight: 10}}
                            variant="contained">
                        {newCategory ? 'Create' : 'Update'}
                    </Button>
                    <Button onClick={() => setEditMode(false)}
                            size="small"
                            variant="contained">
                        Cancel
                    </Button>
                </div>
                {!newCategory &&
                <Button onClick={() => setUpdateMode({mode: 'deleteCategory', option: {name: categoryName}})}
                        className={classes.errorButton}
                        size="small"
                        variant="outlined">
                    Delete
                </Button>}
            </Box>
            <Menu anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}>
                <MenuItem onClick={handleDropDownDel}>Delete</MenuItem>
                <MenuItem onClick={handleDropDownRename}>Rename</MenuItem>
            </Menu>
            {<AddCategory open={updateMode.mode === 'add'} handleAdd={handleAdd} updateMode={updateMode}
                          setUpdateMode={setUpdateMode}/>}
            {updateMode.mode === 'delete' &&
            <DeleteOption open={updateMode.mode === 'delete'} handleDelete={handleDelete} setUpdateMode={setUpdateMode}
                          updateMode={updateMode}/>}
            {updateMode.mode === "rename" &&
            <RenameOption open={updateMode.mode === "rename"} handleRename={handleRename} updateMode={updateMode}
                          setUpdateMode={setUpdateMode}/>}
            {updateMode.mode === "deleteCategory" &&
            <DeleteCategory open={updateMode.mode === "deleteCategory"}
                            handleDeleteCategory={handleDeleteCategory}
                            categoryName={categoryName}
                            updateMode={updateMode} setUpdateMode={setUpdateMode}/>}
        </Paper>
    );
}

export default withFirebase(CategoryEditModal);