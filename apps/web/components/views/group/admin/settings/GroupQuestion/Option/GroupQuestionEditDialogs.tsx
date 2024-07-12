import {
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/groups"
import Warning from "@mui/icons-material/Warning"
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormHelperText,
   TextField,
   Typography,
} from "@mui/material"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { UpdateMode } from "../GroupQuestionEdit"

const requiredTxt = "Please fill this field"
const duplicateTxt = "Cannot be a duplicate"

interface AddGroupQuestionProps {
   updateMode: UpdateMode
   handleAdd: (optionData: { name: string; id: string }) => void
   resetUpdateMode: () => void
   open: boolean
}
const maxOptionLength = 40
export const AddGroupQuestion = ({
   handleAdd,
   updateMode,
   resetUpdateMode,
   open,
}: AddGroupQuestionProps) => {
   const [newOptionName, setNewOptionName] = useState("")
   const [optionNames, setOptionNames] = useState(
      getOptionNames(updateMode.options)
   )
   const [touched, setTouched] = useState(false)
   const [error, setError] = useState(null)

   useEffect(() => {
      if (!newOptionName.length) {
         setError(requiredTxt)
      }
   }, [touched, newOptionName.length])

   useEffect(() => {
      setOptionNames(getOptionNames(updateMode.options))
   }, [updateMode.options])

   useEffect(() => {
      if (newOptionName.length && optionNames.includes(newOptionName.trim())) {
         setError(duplicateTxt)
         setTouched(true)
      } else {
         setError(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [newOptionName])

   const handleAddModal = (e) => {
      e.preventDefault()
      if (!newOptionName.length) {
         setTouched(true)
         return setError(requiredTxt)
      }
      if (error) return
      const tempId = uuidv4()
      handleAdd({ name: newOptionName, id: tempId })
      setNewOptionName("")
      resetUpdateMode()
   }

   return (
      <Dialog onClose={resetUpdateMode} fullWidth maxWidth="xs" open={open}>
         <form onSubmit={handleAddModal}>
            <DialogContent>
               <TextField
                  autoFocus
                  label="Add an option"
                  inputProps={{
                     maxLength: maxOptionLength,
                  }}
                  fullWidth
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  error={Boolean(touched && error.length > 0)}
                  onBlur={() => setTouched(true)}
                  helperText={Boolean(touched && error)}
                  name="option-name"
               />
            </DialogContent>
            <DialogActions>
               <Button color="grey" onClick={resetUpdateMode}>
                  Cancel
               </Button>
               <Button variant="contained" type="submit" color="primary">
                  Confirm
               </Button>
            </DialogActions>
         </form>
      </Dialog>
   )
}
interface DeleteGroupQuestionProps {
   resetUpdateMode: () => void
   groupQuestionName: string
   handleDeleteGroupQuestion: () => void
   open: boolean
}
export const DeleteGroupQuestion = ({
   resetUpdateMode,
   groupQuestionName,
   handleDeleteGroupQuestion,
   open,
}: DeleteGroupQuestionProps) => {
   return (
      <Dialog onClose={resetUpdateMode} fullWidth maxWidth="md" open={open}>
         <DialogTitle>
            Delete the question <span>{groupQuestionName}</span>
         </DialogTitle>
         <DialogContent>
            <Typography>
               By deleting this question, all the user answers to this question
               will be deleted.
            </Typography>
            <Box display="flex" alignItems="center">
               <Warning color="error" />
               <FormHelperText error>
                  This operation cannot be reverted!
               </FormHelperText>
               <Warning color="error" />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button color="grey" onClick={resetUpdateMode}>
               Cancel
            </Button>
            <Button
               onClick={handleDeleteGroupQuestion}
               color="primary"
               variant="contained"
            >
               Permanently Delete the Question {groupQuestionName}
            </Button>
         </DialogActions>
      </Dialog>
   )
}

interface RenameOptionProps {
   updateMode: UpdateMode
   handleRename: (option: GroupQuestionOption) => void
   resetUpdateMode: () => void
   open: boolean
}

const getOptionNames = (options?: GroupQuestion["options"]) => {
   if (!options) return []
   return Object.keys(options).map((el) => {
      return options[el].name.trim()
   })
}
export const RenameOption = ({
   updateMode,
   handleRename,
   open,
   resetUpdateMode,
}: RenameOptionProps) => {
   const [newOptionName, setNewOptionName] = useState("")
   const [names, setNames] = useState([])
   const [touched, setTouched] = useState(false)
   const [error, setError] = useState(null)

   useEffect(() => {
      const allOptionNames = getOptionNames(updateMode.options)
      const otherNames = allOptionNames.filter(
         (name) => name !== updateMode.option.name
      )
      setNames(otherNames)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [updateMode.options])

   useEffect(() => {
      if (!newOptionName.length) {
         setError(requiredTxt)
      }
   }, [touched, newOptionName.length])

   useEffect(() => {
      if (newOptionName.trim().length && names.includes(newOptionName)) {
         setError(duplicateTxt)
         setTouched(true)
      } else {
         setError(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [newOptionName])

   const handleRenameModal = (e) => {
      e.preventDefault()
      if (!newOptionName.length) {
         setTouched(true)
         return setError(requiredTxt)
      }
      if (error) return
      handleRename({ id: updateMode.option.id, name: newOptionName })
      resetUpdateMode()
   }

   return (
      <Dialog open={open} onClose={resetUpdateMode} fullWidth maxWidth="md">
         <form onSubmit={handleRenameModal}>
            <DialogContent>
               <TextField
                  label={`Rename the option ${updateMode.option.name} to:`}
                  autoFocus
                  fullWidth
                  inputProps={{
                     maxLength: maxOptionLength,
                  }}
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  error={Boolean(touched && error.length > 0)}
                  onBlur={() => setTouched(true)}
                  helperText={Boolean(touched) && error}
                  name="option-name"
               />
               <Typography>
                  All your members who are currently classified under{" "}
                  <strong>{updateMode.option.name}</strong> will now be
                  classified under <strong>{newOptionName}</strong>.
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button color="grey" onClick={resetUpdateMode}>
                  Cancel
               </Button>
               <Button type="submit" color="primary" variant="contained">
                  Confirm
               </Button>
            </DialogActions>
         </form>
      </Dialog>
   )
}

interface DeleteOptionProps {
   updateMode: UpdateMode
   handleDelete: (option: UpdateMode["option"]) => void
   resetUpdateMode: () => void
   open: boolean
}
export const DeleteOption = ({
   updateMode,
   handleDelete,
   resetUpdateMode,
   open,
}: DeleteOptionProps) => {
   return (
      <Dialog open={open} onClose={resetUpdateMode} fullWidth maxWidth="md">
         <DialogTitle className="action">
            Delete option <strong>{updateMode.option?.name}</strong>
         </DialogTitle>
         <DialogContent>
            <Typography className="explanation">
               All your members who are currently classified under the{" "}
               <strong>{updateMode.option?.name}</strong> question option will
               not anymore belong to any classification until they manually
               update their question answer.
            </Typography>
            <Box display="flex" alignItems="center">
               <Warning color="error" />
               <FormHelperText error>
                  This operation cannot be reverted!
               </FormHelperText>
               <Warning color="error" />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button color="grey" onClick={resetUpdateMode}>
               Cancel
            </Button>
            <Button
               color="primary"
               onClick={() => handleDelete(updateMode.option)}
               variant="contained"
            >
               Permanently Delete the Question option {updateMode.option.name}
            </Button>
         </DialogActions>
      </Dialog>
   )
}
