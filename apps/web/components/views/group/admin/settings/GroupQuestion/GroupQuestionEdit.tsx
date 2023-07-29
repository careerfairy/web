import React, { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
   AddGroupQuestion,
   DeleteGroupQuestion,
   DeleteOption,
   RenameOption,
} from "./Option/GroupQuestionEditDialogs"
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
   Tooltip,
   Zoom,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import { sxStyles } from "../../../../../../types/commonTypes"
import {
   Group,
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/dist/groups"
import { v4 as uuidv4 } from "uuid"
import { groupRepo } from "../../../../../../data/RepositoryInstances"

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
   groupQuestion?: GroupQuestion
   handleDeleteLocalGroupQuestion?: (groupQuestionId: string) => void
   handleUpdateGroupQuestion?: (groupQuestion: GroupQuestion) => void
   newGroupQuestion?: boolean
   setEditMode: (editMode: boolean) => void
   handleAddTempGroupQuestion?: (groupQuestion: GroupQuestion) => void
   isLocal?: boolean
   group?: Group
}

export interface UpdateMode {
   mode?: "add" | "rename" | "deleteGroupQuestion" | "delete"
   option?: Partial<GroupQuestionOption>
   options?: GroupQuestion["options"]
}

const getInitialGroupQuestion = (
   groupQuestion?: GroupQuestion
): GroupQuestion => {
   if (groupQuestion) {
      return {
         ...groupQuestion,
      }
   }
   return {
      id: uuidv4(),
      name: "",
      options: {},
      hidden: false,
      questionType: "custom",
   }
}
const GroupQuestionEdit = ({
   groupQuestion,
   handleDeleteLocalGroupQuestion,
   handleUpdateGroupQuestion,
   newGroupQuestion,
   setEditMode,
   handleAddTempGroupQuestion,
   isLocal,
   group,
}: Props) => {
   const isFieldOrLevelOfStudyQuestion =
      groupQuestion?.questionType === "fieldOfStudy" ||
      groupQuestion?.questionType === "levelOfStudy"
   const [localGroupQuestion, setLocalGroupQuestion] = useState<GroupQuestion>(
      getInitialGroupQuestion
   )

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
         localGroupQuestion.options &&
         Object.keys(localGroupQuestion.options).length >= 2
      ) {
         setErrorObj({ ...errorObj, optionError: false })
      }
   }, [Object.keys(localGroupQuestion.options).length])

   useEffect(() => {
      if (groupQuestion) {
         setLocalGroupQuestion({ ...groupQuestion })
      }
   }, [groupQuestion])

   function handleDelete(removedOption: GroupQuestionOption) {
      setLocalGroupQuestion((prevGroupQuestion) => {
         const newOptions = { ...prevGroupQuestion.options }
         delete newOptions[removedOption.id]
         return { ...prevGroupQuestion, options: newOptions }
      })
      resetUpdateMode()
   }

   async function handleDeleteGroupQuestion() {
      if (isLocal) {
         handleDeleteLocalGroupQuestion(groupQuestion.id)
         return setEditMode(false)
      }
      await groupRepo.deleteGroupQuestion(group.id, groupQuestion.id)
      setEditMode(false)
   }

   function handleAdd(newOption: GroupQuestionOption) {
      setLocalGroupQuestion((prevGroupQuestion) => {
         const newOptions = { ...prevGroupQuestion.options }
         newOptions[newOption.id] = newOption
         return { ...prevGroupQuestion, options: newOptions }
      })
   }

   function handleBlur() {
      setTouched(true)
   }

   function handleRename(newOption: GroupQuestionOption) {
      setLocalGroupQuestion((prevGroupQuestion) => {
         const newOptions = { ...prevGroupQuestion.options }
         newOptions[newOption.id] = {
            ...newOptions[newOption.id],
            name: newOption.name,
         }
         return { ...prevGroupQuestion, options: newOptions }
      })
   }

   function handleErrors() {
      const errors = {
         inputError: localGroupQuestion.name.length < 1,
         optionError: Object.keys(localGroupQuestion.options).length < 2,
      }
      setErrorObj(errors)
      setTouched(localGroupQuestion.name.trim().length <= 0)
      return errors.inputError || errors.optionError
   }

   const saveChanges = async () => {
      if (handleErrors()) return
      if (isLocal) {
         if (newGroupQuestion) {
            //Add a newly created temp group question Obj
            handleAddTempGroupQuestion({ ...localGroupQuestion })
         } else {
            //update an already created temp group question obj
            handleUpdateGroupQuestion({ ...localGroupQuestion })
         }
         return setEditMode(false)
      }
      if (newGroupQuestion && !isLocal) {
         await groupRepo.addNewGroupQuestion(group.id, {
            ...localGroupQuestion,
         })
      } else {
         await groupRepo.updateGroupQuestion(group.id, localGroupQuestion)
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
         options: localGroupQuestion.options,
      })
   }

   const handleOpenDropDown = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const toggleGroupQuestionHidden = async (event) => {
      const isHidden = event.currentTarget.checked
      setLocalGroupQuestion((prevGroupQuestion) => {
         return { ...prevGroupQuestion, hidden: isHidden }
      })
   }

   const resetUpdateMode = () => setUpdateMode({})

   const optionElements = Object.keys(localGroupQuestion?.options).map(
      (key) => {
         const option = localGroupQuestion.options[key]
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
      }
   )

   const handleChange = (event) => {
      setLocalGroupQuestion((prevGroupQuestion) => ({
         ...prevGroupQuestion,
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
               disabled={isFieldOrLevelOfStudyQuestion}
               label={"Question Name"}
               inputProps={{ maxLength: 40 }}
               error={Boolean(
                  touched && !localGroupQuestion.name?.trim().length
               )}
               onBlur={handleBlur}
               value={localGroupQuestion.name}
               onChange={handleChange}
            />
            <FormHelperText sx={styles.nameError} error>
               {touched && !localGroupQuestion.name?.length && "Required"}
            </FormHelperText>
            <Card>
               <CardHeader subheader="Question Options" />
               <Divider />
               <CardActions>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                     {optionElements}
                     <IconButton
                        size="small"
                        onClick={() =>
                           setUpdateMode({
                              mode: "add",
                              options: localGroupQuestion.options,
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
               justifyContent={newGroupQuestion ? "flex-end" : "space-between"}
            >
               {!newGroupQuestion && (
                  <Tooltip
                     title={
                        isFieldOrLevelOfStudyQuestion
                           ? "Cannot delete a field or level of study question"
                           : ""
                     }
                  >
                     <span>
                        <Button
                           onClick={() =>
                              setUpdateMode({
                                 mode: "deleteGroupQuestion",
                                 option: { name: localGroupQuestion.name },
                              })
                           }
                           disabled={isFieldOrLevelOfStudyQuestion}
                           color={"error"}
                           size="small"
                        >
                           Delete
                        </Button>
                     </span>
                  </Tooltip>
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
                     {newGroupQuestion ? "Create" : "Update"}
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
               <AddGroupQuestion
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
            {updateMode.mode === "deleteGroupQuestion" && (
               <DeleteGroupQuestion
                  open={updateMode.mode === "deleteGroupQuestion"}
                  handleDeleteGroupQuestion={handleDeleteGroupQuestion}
                  groupQuestionName={localGroupQuestion.name}
                  resetUpdateMode={resetUpdateMode}
               />
            )}
         </CardContent>
      </Card>
   )
}

export default GroupQuestionEdit
