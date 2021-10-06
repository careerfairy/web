import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import AddIcon from "@material-ui/icons/Add";
import { useFirebase } from "context/firebase";
import {
   AddCategory,
   DeleteCategory,
   DeleteOption,
   RenameOption,
} from "./Option/CategoryEditOption";
import {
   Box,
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   FormHelperText,
   IconButton,
   Menu,
   MenuItem,
   TextField,
   Zoom,
} from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: "white",
      borderRadius: "5px",
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
   errorButton: {
      color: theme.palette.error.main,
   },
   nameError: {
      height: theme.spacing(2),
      margin: theme.spacing(1),
   },
}));

function CategoryEditModal({
   category,
   handleDeleteLocalCategory,
   handleUpdateCategory,
   newCategory,
   setEditMode,
   handleAddTempCategory,
   group,
   groupId,
   isLocal,
}) {
   const classes = useStyles();
   const firebase = useFirebase();
   const [categoryName, setCategoryName] = useState("");

   const [editableOptions, setEditableOptions] = useState([]);

   const [selectedOption, setSelectedOption] = useState(null);
   const [updateMode, setUpdateMode] = useState({});

   const [touched, setTouched] = useState(false);
   const [anchorEl, setAnchorEl] = useState(null);
   const [errorObj, setErrorObj] = useState({
      inputError: false,
      optionError: false,
   });

   useEffect(() => {
      if (editableOptions && editableOptions.length >= 2) {
         setErrorObj({ ...errorObj, optionError: false });
      }
   }, [editableOptions.length]);

   useEffect(() => {
      if (category && category.name) {
         setCategoryName(category.name);
      }
   }, [category.name]);

   useEffect(() => {
      if (category.options && category.options.length > 0) {
         let sortedOptions = [...category.options];
         sortedOptions.sort(dynamicSort("name"));
         setEditableOptions(sortedOptions);
      }
   }, [category.options]);

   function handleDelete(removedOption) {
      let newList = [];
      if (removedOption.id) {
         newList = editableOptions.filter(
            (optionEl) => optionEl.id !== removedOption.id
         );
      } else {
         newList = editableOptions.filter(
            (optionEl) => optionEl.id || optionEl.name !== removedOption.name
         );
      }
      setEditableOptions(newList);
      setUpdateMode({});
   }

   function handleDeleteCategory() {
      if (isLocal) {
         handleDeleteLocalCategory(category.id);
         return setEditMode(false);
      }
      const existingCategories = [...group.categories];
      const newCategories = existingCategories.filter(
         (el) => el.id !== category.id
      );
      firebase.updateGroupCategoryElements(group.id, newCategories).then(() => {
         setEditMode(false);
      });
   }

   function handleAdd(newOption) {
      const newList = [...editableOptions, newOption];
      setEditableOptions(newList);
   }

   function handleBlur() {
      setTouched(true);
   }

   function handleRename(newOption) {
      const newList = editableOptions.map((optionEl) => {
         if (optionEl.id === newOption.id) {
            return newOption;
         } else {
            return optionEl;
         }
      });
      setEditableOptions(newList);
   }

   function buildCategory() {
      const newId = uuidv4();
      return {
         name: categoryName,
         options: editableOptions,
         id: newId,
      };
   }

   function handleErrors() {
      const errors = {
         inputError: categoryName.length < 1,
         optionError: editableOptions.length < 2,
      };
      setErrorObj(errors);
      setTouched(!categoryName.length > 0);
      return errors.inputError || errors.optionError;
   }

   function saveChanges() {
      if (handleErrors()) return;
      if (isLocal) {
         if (newCategory) {
            //Add a newly created temp category Obj
            handleAddTempCategory(buildCategory());
         } else {
            //update an already created temp category obj
            category.name = categoryName;
            category.options = editableOptions;
            handleUpdateCategory(category);
         }
         return setEditMode(false);
      }
      if (newCategory && !isLocal) {
         firebase
            .addGroupCategoryWithElements(group.id, buildCategory())
            .then(() => {
               setEditMode(false);
            });
      } else {
         const newCategories = group.categories.map((category) => ({
            ...category,
         }));
         const index = newCategories.findIndex((el) => el.id === category.id);
         newCategories[index].name = categoryName;
         newCategories[index].options = editableOptions;
         firebase
            .updateGroupCategoryElements(group.id, newCategories)
            .then(() => {
               setEditMode(false);
            });
      }
   }

   const handleDropDownDel = () => {
      setAnchorEl(null);
      setUpdateMode({ mode: "delete", option: selectedOption });
   };
   const handleDropDownRename = () => {
      setAnchorEl(null);
      setUpdateMode({
         mode: "rename",
         option: selectedOption,
         options: editableOptions,
      });
   };

   const handleOpenDropDown = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

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
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
         return result * sortOrder;
      };
   };

   const optionElements = editableOptions.map((el) => {
      return (
         <Zoom key={el.id} in={Boolean(el.id)}>
            <Chip
               label={el.name}
               variant="outlined"
               deleteIcon={<EditIcon />}
               onDelete={(e) => {
                  setSelectedOption(el);
                  handleOpenDropDown(e);
               }}
            />
         </Zoom>
      );
   });

   return (
      <Card elevation={3}>
         <CardContent>
            <TextField
               autoFocus
               variant="outlined"
               fullWidth
               label={"Category Name"}
               inputProps={{ maxLength: 40 }}
               error={Boolean(touched && !categoryName.length)}
               onBlur={handleBlur}
               value={categoryName}
               onChange={(e) => setCategoryName(e.currentTarget.value)}
            />
            <FormHelperText className={classes.nameError} error>
               {touched && !categoryName.length && "Required"}
            </FormHelperText>
            <Card>
               <CardHeader subheader="Category Options" />
               <Divider />
               <CardActions>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                     {optionElements}
                     <IconButton
                        size="small"
                        onClick={() =>
                           setUpdateMode({
                              mode: "add",
                              options: editableOptions,
                           })
                        }
                     >
                        <AddIcon fontSize="large" color="primary" />
                     </IconButton>
                  </div>
                  <FormHelperText error>
                     {errorObj.optionError && "You must add at least 2 options"}
                  </FormHelperText>
               </CardActions>
            </Card>
            <Divider />
            <Box
               display="flex"
               paddingTop={2}
               justifyContent={newCategory ? "flex-end" : "space-between"}
            >
               {!newCategory && (
                  <Button
                     onClick={() =>
                        setUpdateMode({
                           mode: "deleteCategory",
                           option: { name: categoryName },
                        })
                     }
                     className={classes.errorButton}
                     size="small"
                  >
                     Delete
                  </Button>
               )}
               <div>
                  <Button
                     onClick={() => setEditMode(false)}
                     size="small"
                     style={{ marginRight: 10 }}
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={() => saveChanges()}
                     color="primary"
                     size="small"
                     variant="contained"
                  >
                     {newCategory ? "Create" : "Update"}
                  </Button>
               </div>
            </Box>
            <Menu
               anchorEl={anchorEl}
               open={Boolean(anchorEl)}
               onClose={handleClose}
            >
               <MenuItem onClick={handleDropDownDel}>Delete</MenuItem>
               <MenuItem onClick={handleDropDownRename}>Rename</MenuItem>
            </Menu>
            {
               <AddCategory
                  open={updateMode.mode === "add"}
                  handleAdd={handleAdd}
                  updateMode={updateMode}
                  setUpdateMode={setUpdateMode}
               />
            }
            {updateMode.mode === "delete" && (
               <DeleteOption
                  open={updateMode.mode === "delete"}
                  handleDelete={handleDelete}
                  setUpdateMode={setUpdateMode}
                  updateMode={updateMode}
               />
            )}
            {updateMode.mode === "rename" && (
               <RenameOption
                  open={updateMode.mode === "rename"}
                  handleRename={handleRename}
                  updateMode={updateMode}
                  setUpdateMode={setUpdateMode}
               />
            )}
            {updateMode.mode === "deleteCategory" && (
               <DeleteCategory
                  open={updateMode.mode === "deleteCategory"}
                  handleDeleteCategory={handleDeleteCategory}
                  categoryName={categoryName}
                  updateMode={updateMode}
                  setUpdateMode={setUpdateMode}
               />
            )}
         </CardContent>
      </Card>
   );
}

CategoryEditModal.propTypes = {
   category: PropTypes.any,
   firebase: PropTypes.object,
   group: PropTypes.object,
   groupId: PropTypes.string,
   handleAddTempCategory: PropTypes.func,
   handleDeleteLocalCategory: PropTypes.func,
   handleUpdateCategory: PropTypes.func,
   isLocal: PropTypes.bool,
   newCategory: PropTypes.any,
   setEditMode: PropTypes.func,
};
export default CategoryEditModal;
