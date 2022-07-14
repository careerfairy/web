import React, { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
   AddCategory,
   DeleteCategory,
   DeleteOption,
   RenameOption,
} from "./Option/CategoryEditOption"
import {
   Box,
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   FormControlLabel,
   FormHelperText,
   IconButton,
   Menu,
   MenuItem,
   Switch,
   TextField,
   Tooltip,
   Zoom,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import { sxStyles } from "../../../../../../types/commonTypes"
import {
   CustomCategory,
   CustomCategoryOption,
   Group,
} from "@careerfairy/shared-lib/dist/groups"
import groupRepo from "../../../../../../data/firebase/GroupRepository"
import { v4 as uuidv4 } from "uuid"

const styles = sxStyles({
   errorButton: {
      color: "error.main",
   },
   nameError: {
      height: (theme) => theme.spacing(2),
      margin: (theme) => theme.spacing(1),
   },
})

interface Props {
   category?: CustomCategory
   handleDeleteLocalCategory?: (categoryId: string) => void
   handleUpdateCategory?: (category: CustomCategory) => void
   newCategory?: boolean
   setEditMode: (editMode: boolean) => void
   handleAddTempCategory?: (category: CustomCategory) => void
   isLocal?: boolean
   group?: Group
}

export interface UpdateMode {
   mode?: "add" | "rename" | "deleteCategory" | "delete"
   option?: Partial<CustomCategoryOption>
   options?: CustomCategory["options"]
}

const getInitialCategory = (category?: CustomCategory): CustomCategory => {
   if (category) {
      return {
         ...category,
      }
   }
   return {
      id: uuidv4(),
      name: "",
      options: {},
      hidden: false,
      categoryType: "custom",
   }
}
const CategoryEditModal = ({
   category,
   handleDeleteLocalCategory,
   handleUpdateCategory,
   newCategory,
   setEditMode,
   handleAddTempCategory,
   isLocal,
   group,
}: Props) => {
   const [localCategory, setLocalCategory] =
      useState<CustomCategory>(getInitialCategory)

   const [selectedOption, setSelectedOption] = useState(null)
   const [updateMode, setUpdateMode] = useState<UpdateMode>({})

   const [touched, setTouched] = useState(false)
   const [anchorEl, setAnchorEl] = useState(null)
   const [errorObj, setErrorObj] = useState({
      inputError: false,
      optionError: false,
   })

   useEffect(() => {
      if (
         localCategory.options &&
         Object.keys(localCategory.options).length >= 2
      ) {
         setErrorObj({ ...errorObj, optionError: false })
      }
   }, [Object.keys(localCategory.options).length])

   useEffect(() => {
      if (category) {
         setLocalCategory({ ...category })
      }
   }, [category])

   function handleDelete(removedOption: CustomCategoryOption) {
      setLocalCategory((prevCategory) => {
         const newOptions = { ...prevCategory.options }
         delete newOptions[removedOption.id]
         return { ...prevCategory, options: newOptions }
      })
      resetUpdateMode()
   }

   async function handleDeleteCategory() {
      if (isLocal) {
         handleDeleteLocalCategory(category.id)
         return setEditMode(false)
      }
      await groupRepo.deleteCustomCategory(group.id, category.id)
      setEditMode(false)
   }

   function handleAdd(newOption: CustomCategoryOption) {
      setLocalCategory((prevCategory) => {
         const newOptions = { ...prevCategory.options }
         newOptions[newOption.id] = newOption
         return { ...prevCategory, options: newOptions }
      })
   }

   function handleBlur() {
      setTouched(true)
   }

   function handleRename(newOption: CustomCategoryOption) {
      setLocalCategory((prevCategory) => {
         const newOptions = { ...prevCategory.options }
         newOptions[newOption.id] = {
            ...newOptions[newOption.id],
            name: newOption.name,
         }
         return { ...prevCategory, options: newOptions }
      })
   }

   function handleErrors() {
      const errors = {
         inputError: localCategory.name.length < 1,
         optionError: Object.keys(localCategory.options).length < 2,
      }
      setErrorObj(errors)
      setTouched(localCategory.name.trim().length <= 0)
      return errors.inputError || errors.optionError
   }

   const saveChanges = async () => {
      if (handleErrors()) return
      if (isLocal) {
         if (newCategory) {
            //Add a newly created temp category Obj
            handleAddTempCategory({ ...localCategory })
         } else {
            //update an already created temp category obj
            handleUpdateCategory({ ...localCategory })
         }
         return setEditMode(false)
      }
      if (newCategory && !isLocal) {
         await groupRepo.addNewCustomCategory(group.id, { ...localCategory })
      } else {
         await groupRepo.updateCustomCategory(group.id, localCategory)
      }
      setEditMode(false)
   }

   const handleDropDownDel = () => {
      setAnchorEl(null)
      setUpdateMode({ mode: "delete", option: selectedOption })
   }
   const handleDropDownRename = () => {
      setAnchorEl(null)
      setUpdateMode({
         mode: "rename",
         option: selectedOption,
         options: localCategory.options,
      })
   }

   const handleOpenDropDown = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const dynamicSort = (property) => {
      let sortOrder = 1
      if (property[0] === "-") {
         sortOrder = -1
         property = property.substr(1)
      }
      return function (a, b) {
         /* next line works with strings and numbers,
          * and you may want to customize it to your needs
          */
         const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
         return result * sortOrder
      }
   }

   const toggleCategoryHidden = async (event) => {
      const isHidden = event.currentTarget.checked
      setLocalCategory((prevCategory) => {
         return { ...prevCategory, hidden: isHidden }
      })
   }

   const resetUpdateMode = () => setUpdateMode({})

   const optionElements = Object.keys(localCategory?.options).map((key) => {
      const option = localCategory.options[key]
      return (
         <Zoom key={option.id} in={Boolean(option.id)}>
            <Chip
               label={option.name}
               variant="outlined"
               deleteIcon={<EditIcon />}
               className={"stacked"}
               onDelete={(e) => {
                  setSelectedOption(option)
                  handleOpenDropDown(e)
               }}
            />
         </Zoom>
      )
   })

   const handleChange = (event) => {
      setLocalCategory((prevCategory) => ({
         ...prevCategory,
         name: event.target.value,
      }))
   }

   return (
      <Card elevation={3}>
         <CardContent>
            <TextField
               autoFocus
               variant="outlined"
               fullWidth
               label={"Category Name"}
               inputProps={{ maxLength: 40 }}
               error={Boolean(touched && !localCategory.name?.trim().length)}
               onBlur={handleBlur}
               value={localCategory.name}
               onChange={handleChange}
            />
            <FormHelperText sx={styles.nameError} error>
               {touched && !localCategory.name?.length && "Required"}
            </FormHelperText>
            <Card>
               <CardHeader
                  action={
                     <Tooltip
                        title={
                           localCategory.hidden
                              ? "Re-enable this category so that users will be prompted to fill it in when registering for your events."
                              : "Don’t ask this category when users register to your events."
                        }
                     >
                        <FormControlLabel
                           control={
                              <Switch
                                 checked={Boolean(localCategory.hidden)}
                                 onChange={toggleCategoryHidden}
                                 name="category-visibility-toggle"
                                 color="primary"
                              />
                           }
                           label={
                              localCategory.hidden ? "Hidden" : "Hide Category"
                           }
                        />
                     </Tooltip>
                  }
                  subheader="Category Options"
               />
               <Divider />
               <CardActions>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                     {optionElements}
                     <IconButton
                        size="small"
                        onClick={() =>
                           setUpdateMode({
                              mode: "add",
                              options: localCategory.options,
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
                           option: { name: localCategory.name },
                        })
                     }
                     color={"error"}
                     size="small"
                  >
                     Delete
                  </Button>
               )}
               <div>
                  <Button
                     onClick={() => setEditMode(false)}
                     size="small"
                     color="grey"
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
                  resetUpdateMode={resetUpdateMode}
               />
            }
            {updateMode.mode === "delete" && (
               <DeleteOption
                  open={updateMode.mode === "delete"}
                  handleDelete={handleDelete}
                  resetUpdateMode={resetUpdateMode}
                  updateMode={updateMode}
               />
            )}
            {updateMode.mode === "rename" && (
               <RenameOption
                  open={updateMode.mode === "rename"}
                  handleRename={handleRename}
                  updateMode={updateMode}
                  resetUpdateMode={resetUpdateMode}
               />
            )}
            {updateMode.mode === "deleteCategory" && (
               <DeleteCategory
                  open={updateMode.mode === "deleteCategory"}
                  handleDeleteCategory={handleDeleteCategory}
                  categoryName={localCategory.name}
                  updateMode={updateMode}
                  resetUpdateMode={resetUpdateMode}
               />
            )}
         </CardContent>
      </Card>
   )
}

export default CategoryEditModal
