import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import Image from "next/image"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setDeniedPermissionsDialogOpen } from "store/reducers/streamingAppReducer"
import { useDeniedPermissionsDialogOpen } from "store/selectors/streamingAppSelectors"
import { useMediaPermissions } from "./useMediaPermissions"

export const DeniedPermissionsDialog = () => {
   const { hasDeniedPermissions, hasAcceptedPermissions } =
      useMediaPermissions()

   const deniedPermissionsDialogOpen = useDeniedPermissionsDialogOpen()

   const dispatch = useDispatch()

   const handleClose = () => {
      dispatch(setDeniedPermissionsDialogOpen(false))
   }

   useEffect(() => {
      if (hasDeniedPermissions && !deniedPermissionsDialogOpen) {
         dispatch(setDeniedPermissionsDialogOpen(true))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasDeniedPermissions])

   if (hasAcceptedPermissions) {
      return null
   }

   return (
      <Dialog open={deniedPermissionsDialogOpen} maxWidth="desktop">
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
