import { Box, Dialog, Drawer, Stack, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
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
      textAlign: "center",
      width: {
         xs: "100%",
         md: "441px",
      },
      padding: {
         xs: "16px 20px 24px 20px",
         md: "24px",
      },
   },
})

export const PromptingForPermissionsDialog = () => {
   const isMobile = useIsMobile()
   const { isPromptingForPermissions, hasAcceptedPermissions } =
      useMediaPermissions()

   const [
      promptingForPermissionsOpen,
      setPromptingForPermissionsOpen,
      closePromptingForPermissions,
   ] = useDialogStateHandler()

   if (isPromptingForPermissions && !promptingForPermissionsOpen) {
      setPromptingForPermissionsOpen()
   } else if (!isPromptingForPermissions && promptingForPermissionsOpen) {
      closePromptingForPermissions()
   }

   if (hasAcceptedPermissions) {
      return null
   }

   if (isMobile) {
      return (
         <Drawer
            open={promptingForPermissionsOpen}
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
      <Dialog open={promptingForPermissionsOpen} maxWidth="desktop">
         <Content />
      </Dialog>
   )
}

const Content = () => {
   return (
      <Stack sx={styles.container} gap="16px">
         <Box>
            <Image
               src="/livestream/mic-camera-tilted-icons.png"
               alt="mic and camera tilted icons"
               width={140}
               height={89}
               style={{ marginBottom: "-16px" }}
            />
         </Box>
         <Typography variant="brandedH4" fontWeight={600} color="neutral.900">
            Click{" "}
            <span style={{ color: "#2ABAA5", fontWeight: 700 }}>allow</span>
         </Typography>
         <Typography variant="brandedBody" color="neutral.700">
            We need your permission so everyone can hear and see you. Don’t
            worry, you’re in control and can turn off your devices at any time.
         </Typography>
      </Stack>
   )
}
