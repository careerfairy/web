import React from "react"
import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import { Dialog, DialogContent } from "@mui/material"

export type ShareLivestreamDialogProps = {
   handleClose: () => void
   livestreamId: string
}

export const ShareLivestreamDialog = ({
   handleClose,
   livestreamId,
}: ShareLivestreamDialogProps) => {
   const livestreamLink = `https://www.careerfairy.io/livestream/${livestreamId}`

   const handleCopyClick = () => {
      navigator.clipboard.writeText(livestreamLink)
      handleClose()
   }

   const handleLinkedInClick = () => {
      const encodedUrl = encodeURIComponent(livestreamLink)
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      window.open(linkedInUrl, "_blank")
      handleClose()
   }

   return (
      <Dialog 
         open={true} 
         onClose={handleClose}
         maxWidth="sm"
         fullWidth
      >
         <DialogContent
            sx={{
               p: 4,
               textAlign: "center",
               minHeight: "400px",
               display: "flex",
               flexDirection: "column",
               justifyContent: "center",
            }}
         >
            <Stack spacing={3} alignItems="center">
               <Typography 
                  variant="h5" 
                  fontWeight="bold"
                  sx={{ color: "#3D3D47" }}
               >
                  Share it with your audience!
               </Typography>

               <Typography 
                  variant="body1"
                  sx={{ color: "#5C5C6A" }}
               >
                  Use this link to share your stream with your talent community!
               </Typography>

               <TextField
                  label="Live stream link"
                  value={livestreamLink}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mt: 2 }}
               />

               <Box 
                  sx={{ 
                     display: "flex", 
                     gap: 1.5, 
                     mt: 3,
                     justifyContent: "center"
                  }}
               >
                  <Button
                     variant="outlined"
                     onClick={handleClose}
                     sx={{ width: "140px", height: "40px" }}
                  >
                     Skip
                  </Button>

                  <Button
                     variant="outlined"
                     onClick={handleCopyClick}
                     sx={{ width: "140px", height: "40px" }}
                  >
                     Copy
                  </Button>

                  <Button
                     variant="contained"
                     onClick={handleLinkedInClick}
                     sx={{ 
                        width: "140px", 
                        height: "40px",
                        backgroundColor: "#0077B5",
                        "&:hover": { backgroundColor: "#005885" }
                     }}
                  >
                     LinkedIn
                  </Button>
               </Box>
            </Stack>
         </DialogContent>
      </Dialog>
   )
}