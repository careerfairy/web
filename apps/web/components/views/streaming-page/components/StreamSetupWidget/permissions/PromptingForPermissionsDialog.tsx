import { Box, Dialog, Stack, Typography } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import Image from "next/image"
import { PermissionType, useMediaPermissions } from "./useMediaPermissions"

export const PromptingForPermissionsDialog = () => {
   const permissions = useMediaPermissions()

   const [
      promptingForPermissionsOpen,
      setPromptingForPermissionsOpen,
      closePromptingForPermissions,
   ] = useDialogStateHandler()

   const isPrompting =
      permissions.microphone === PermissionType.Prompting ||
      permissions.camera === PermissionType.Prompting

   if (isPrompting && !promptingForPermissionsOpen) {
      setPromptingForPermissionsOpen()
   } else if (!isPrompting && promptingForPermissionsOpen) {
      closePromptingForPermissions()
   }

   if (
      permissions.microphone === PermissionType.Accepted ||
      permissions.camera === PermissionType.Accepted
   ) {
      return null
   }

   return (
      <Dialog open={promptingForPermissionsOpen} maxWidth="desktop">
         <Stack
            sx={{ textAlign: "center", width: "441px", padding: "24px" }}
            gap="16px"
         >
            <Box>
               <Image
                  src="/livestream/mic-camera-tilted-icons.png"
                  alt="mic and camera tilted icons"
                  width={140}
                  height={89}
                  style={{ marginBottom: "-16px" }}
               />
            </Box>
            <Typography
               variant="brandedH4"
               fontWeight={600}
               color="neutral.900"
            >
               Click{" "}
               <span style={{ color: "#2ABAA5", fontWeight: 700 }}>allow</span>
            </Typography>
            <Typography variant="brandedBody" color="neutral.700">
               We need your permission so everyone can hear and see you. Don’t
               worry, you’re in control and can turn off your devices at any
               time.
            </Typography>
         </Stack>
      </Dialog>
   )
}
