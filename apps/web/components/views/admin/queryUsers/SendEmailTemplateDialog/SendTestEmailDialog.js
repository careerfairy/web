import React, { useState } from "react"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   TextField,
} from "@mui/material"
import * as PropTypes from "prop-types"
import Autocomplete from "@mui/material/Autocomplete"

const Content = ({
   handleClose,
   loading,
   handleConfirmSendTestEmail,
   setTestEmails,
   testEmails,
}) => {
   const [options] = useState([])

   return (
      <>
         <DialogContent>
            <Autocomplete
               value={testEmails}
               multiple
               onChange={(event, newValue) => setTestEmails(newValue)}
               selectOnFocus
               id="multiple-email-select"
               options={options}
               renderOption={(props, option) => option}
               freeSolo
               renderInput={(params) => (
                  <TextField
                     {...params}
                     label="Add emails"
                     variant="outlined"
                  />
               )}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button
               color="primary"
               disabled={loading}
               onClick={handleConfirmSendTestEmail}
               variant="contained"
            >
               Send Test Emails
            </Button>
         </DialogActions>
      </>
   )
}

Content.propTypes = { handleClose: PropTypes.func }
const SendTestEmailDialog = ({
   open,
   onClose,
   handleConfirmSendTestEmail,
   setTestEmails,
   loading,
   testEmails,
}) => {
   const handleClose = () => {
      onClose()
   }
   return (
      <Dialog maxWidth="sm" fullWidth onClose={handleClose} open={open}>
         <Content
            testEmails={testEmails}
            loading={loading}
            handleConfirmSendTestEmail={handleConfirmSendTestEmail}
            setTestEmails={setTestEmails}
            handleClose={handleClose}
         />
      </Dialog>
   )
}

export default SendTestEmailDialog
