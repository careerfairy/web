import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   List,
   ListItem,
   Typography,
} from "@mui/material"
import { Fragment } from "react"
import { useRegisteredUsersPhoneNumbers } from "./useRegisteredUsersPhoneNumbers"

type Props = {
   stream: LivestreamEvent
   onClose: () => void
   open: boolean
}

export const PhoneNumbersDialog = ({ stream, onClose, open }: Props) => {
   const { phoneNumbers, loading, error } = useRegisteredUsersPhoneNumbers(
      stream.id
   )

   const handleCopyToClipboard = () => {
      const numbers = phoneNumbers.join("\n")
      navigator.clipboard.writeText(numbers)
   }

   return (
      <Fragment>
         <Dialog open={open} onClose={onClose}>
            <DialogTitle>Phone numbers ({phoneNumbers.length})</DialogTitle>
            <DialogContent>
               {error ? (
                  <Typography>
                     Error fetching phone numbers. Please contact engineering
                     through Slack.
                  </Typography>
               ) : loading ? (
                  <Typography>Loading...</Typography>
               ) : phoneNumbers.length === 0 ? (
                  <Typography>
                     No phone numbers associated with this live stream.
                  </Typography>
               ) : (
                  <>
                     <Typography>
                        Here you can view the phone numbers of users that
                        registered to this live stream:
                     </Typography>
                     <List
                        sx={{
                           maxHeight: "400px",
                           overflow: "auto",
                        }}
                     >
                        {phoneNumbers.map((number) => (
                           <ListItem key={number}>{number}</ListItem>
                        ))}
                     </List>
                  </>
               )}
            </DialogContent>
            <DialogActions>
               <Button color="grey" onClick={onClose}>
                  Close
               </Button>
               {phoneNumbers.length > 0 && (
                  <Button color="secondary" onClick={handleCopyToClipboard}>
                     Copy to clipboard
                  </Button>
               )}
               {phoneNumbers.length > 0 && (
                  <Button
                     color="secondary"
                     onClick={() => {
                        const csvContent =
                           "data:text/csv;charset=utf-8," +
                           phoneNumbers.join("\n")
                        const encodedUri = encodeURI(csvContent)
                        const link = document.createElement("a")
                        link.setAttribute("href", encodedUri)
                        link.setAttribute(
                           "download",
                           `${stream.id}-${stream.company}-${stream.start
                              .toDate()
                              .toLocaleDateString()}-${stream.start
                              .toDate()
                              .toLocaleTimeString()}-phone_numbers.csv`
                        )
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                     }}
                  >
                     Download CSV
                  </Button>
               )}
            </DialogActions>
         </Dialog>
      </Fragment>
   )
}
