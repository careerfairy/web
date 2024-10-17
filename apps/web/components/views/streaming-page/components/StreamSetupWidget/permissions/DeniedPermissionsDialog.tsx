import { Box, Button, Dialog, Drawer, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setDeniedPermissionsDialogOpen } from "store/reducers/streamingAppReducer"
import { useDeniedPermissionsDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useMediaPermissions } from "./useMediaPermissions"

const styles = sxStyles({
   drawer: {
      "& .MuiDrawer-paper": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   container: {
      width: "100%",
      maxWidth: "674px",
      height: "367px",
      paddingRight: "24px",
      display: "grid",
      gridTemplateColumns: "199px 1fr",
      gap: "24px",
      direction: "row",
   },
   containerMobile: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      textAlign: "center",
      padding: "12px 12px 24px 12px",
   },
   imageWrapper: {
      display: "flex",
      background:
         "linear-gradient(0deg, #F3F3F5, #F3F3F5), linear-gradient(180deg, rgba(243, 243, 245, 0) 0%, rgba(192, 192, 194, 0.1) 100%)",
      alignItems: "center",
      justifyContent: "center",
   },
   contentWrapper: {
      direction: "column",
      gap: "16px",
      justifyContent: "center",
      width: "100%",
      paddingLeft: {
         xs: "20px",
         md: "0px",
      },
      paddingRight: {
         xs: "20px",
         md: "0px",
      },
   },
   actions: {
      display: "flex",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      gap: "20px",
      justifyContent: {
         xs: "center",
         md: "flex-start",
      },
   },
   noSupportButton: {
      padding: 0,
      "&:hover": {
         backgroundColor: "transparent",
         textDecoration: "underline",
      },
   },
})

export const DeniedPermissionsDialog = () => {
   const isMobile = useIsMobile()
   const { hasDeniedPermissions, hasAcceptedPermissions } =
      useMediaPermissions()

   const deniedPermissionsDialogOpen = useDeniedPermissionsDialogOpen()

   const dispatch = useDispatch()

   useEffect(() => {
      if (hasDeniedPermissions && !deniedPermissionsDialogOpen) {
         dispatch(setDeniedPermissionsDialogOpen(true))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [hasDeniedPermissions])

   if (hasAcceptedPermissions) {
      return null
   }

   if (isMobile) {
      return (
         <Drawer
            open={deniedPermissionsDialogOpen}
            sx={styles.drawer}
            anchor="bottom"
         >
            <Box>
               <Content />
            </Box>
         </Drawer>
      )
   }

   return (
      <Dialog open={deniedPermissionsDialogOpen} maxWidth="desktop">
         <Content />
      </Dialog>
   )
}

const Content = () => {
   const isMobile = useIsMobile()

   const dispatch = useDispatch()

   const handleClose = () => {
      dispatch(setDeniedPermissionsDialogOpen(false))
   }

   return (
      <Stack sx={isMobile ? styles.containerMobile : styles.container}>
         <Box sx={styles.imageWrapper}>
            <Image
               src="/livestream/mic-camera-frowning-face.png"
               alt="mic and camera frowning face"
               width={isMobile ? 99 : 141}
               height={isMobile ? 118 : 168}
            />
         </Box>
         <Stack sx={styles.contentWrapper}>
            <Stack gap={1}>
               <Typography
                  variant="brandedH4"
                  fontWeight={600}
                  color="neutral.900"
               >
                  We’re unable to access your camera and microphone.
               </Typography>
               <Typography variant="brandedBody" color="neutral.700">
                  Don’t worry! We have a simple guide to help you enable them in
                  just a few steps.
               </Typography>
            </Stack>
            <Stack sx={styles.actions}>
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
                  sx={styles.noSupportButton}
                  onClick={handleClose}
               >
                  No support needed
               </Button>
            </Stack>
         </Stack>
      </Stack>
   )
}
