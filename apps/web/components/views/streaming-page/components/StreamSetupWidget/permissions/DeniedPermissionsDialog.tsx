import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import Image from "next/image"
import { useState } from "react"
import { PermissionType, useMediaPermissions } from "./useMediaPermissions"

export const DeniedPermissionsDialog = () => {
   const [hasInteracted, setHasInteracted] = useState(false)
   const permissions = useMediaPermissions()

   const [
      promptingForPermissionsOpen,
      setPromptingForPermissionsOpen,
      closePromptingForPermissions,
   ] = useDialogStateHandler()

   const handleClose = () => {
      setHasInteracted(true)
      closePromptingForPermissions()
   }

   const isDenied =
      permissions.microphone === PermissionType.Denied ||
      permissions.camera === PermissionType.Denied

   if (
      permissions.microphone === PermissionType.Accepted &&
      permissions.camera === PermissionType.Accepted
   ) {
      return null
   }

   if (isDenied && !promptingForPermissionsOpen && !hasInteracted) {
      setPromptingForPermissionsOpen()
   }

   return (
      <Dialog open={promptingForPermissionsOpen} maxWidth="desktop">
         <Stack
            direction="row"
            sx={{
               width: "100%",
               maxWidth: "674px",
               height: "367px",
               paddingRight: "24px",
               display: "grid",
               gridTemplateColumns: "199px 1fr",
            }}
            gap="24px"
         >
            <Box
               sx={{
                  display: "flex",
                  background:
                     "linear-gradient(0deg, #F3F3F5, #F3F3F5), linear-gradient(180deg, rgba(243, 243, 245, 0) 0%, rgba(192, 192, 194, 0.1) 100%)",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <Image
                  src="/livestream/mic-camera-frowning-face.png"
                  alt="mic and camera frowning face"
                  width={141}
                  height={168}
               />
            </Box>
            <Stack
               direction="column"
               gap="16px"
               justifyContent="center"
               width="100%"
            >
               <Stack gap={1}>
                  <Typography
                     variant="brandedH4"
                     fontWeight={600}
                     color="neutral.900"
                  >
                     We’re unable to access your camera and microphone.
                  </Typography>
                  <Typography variant="brandedBody" color="neutral.700">
                     Don’t worry! We have a simple guide to help you enable them
                     in just a few steps.
                  </Typography>
               </Stack>
               <Stack direction="row" gap="20px">
                  <Button
                     variant="contained"
                     onClick={() => {
                        window.open(
                           "https://support.careerfairy.io/en/article/camera-and-microphone-issues-1oxpag9/",
                           "_blank"
                        )
                        handleClose()
                     }}
                  >
                     Open support guide
                  </Button>
                  <Button
                     variant="text"
                     color="grey"
                     sx={{
                        padding: 0,
                        "&:hover": {
                           backgroundColor: "transparent",
                           textDecoration: "underline",
                        },
                     }}
                     onClick={handleClose}
                  >
                     No support needed
                  </Button>
               </Stack>
            </Stack>
         </Stack>
      </Dialog>
   )
}
