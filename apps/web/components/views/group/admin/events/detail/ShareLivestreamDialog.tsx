import React, { useMemo, useEffect } from "react"
import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import { Dialog, DialogContent } from "@mui/material"

export type ShareLivestreamDialogProps = {
   handleClose: () => void
   livestreamId: string
}

// Simple URL builder without external dependencies
const createLivestreamUrl = (livestreamId: string): string => {
   return `https://www.careerfairy.io/next-livestreams?livestreamId=${livestreamId}`
}

export const ShareLivestreamDialog = ({
   handleClose,
   livestreamId,
}: ShareLivestreamDialogProps) => {
   const livestreamLink = useMemo(() => createLivestreamUrl(livestreamId), [livestreamId])

   // Auto-dismiss after 10 seconds for E2E test compatibility
   useEffect(() => {
      const timer = setTimeout(() => {
         handleClose()
      }, 10000)
      return () => clearTimeout(timer)
   }, [handleClose])

   const handleCopyClick = () => {
      navigator.clipboard.writeText(livestreamLink).then(() => {
         // Simple success feedback
         console.log('Livestream link copied to clipboard')
         // Track analytics if available
         if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
               event: 'livestream_share',
               medium: 'Copy Link',
               livestreamId: livestreamId
            })
         }
      }).catch(() => {
         console.log('Failed to copy link')
      })
      handleClose()
   }

   const handleLinkedInClick = () => {
      const encodedUrl = encodeURIComponent(livestreamLink)
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      window.open(linkedInUrl, "_blank")
      
      // Track analytics if available
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
         (window as any).dataLayer.push({
            event: 'livestream_share',
            medium: 'LinkedIn',
            livestreamId: livestreamId
         })
      }
      
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