import { Box, DialogTitle, IconButton, Stack, Typography } from "@mui/material"
import { X as CloseIcon, Settings } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   icon: {
      color: "neutral.900",
   },
   title: {
      p: 2,
      pt: 2.375,
      borderBottom: (theme) => `1px solid ${theme.brand.black[300]}`,
   },
   titleSticky: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: "white",
   },
   titleText: {
      color: "neutral.800",
   },
   closeButton: {
      m: (theme) => `-${theme.spacing(1)} !important`,
   },
})

type Props = {
   handleClose: () => void
   isMobile: boolean
}

export const Title = ({ handleClose, isMobile }: Props) => {
   return (
      <DialogTitle sx={[styles.title, isMobile && styles.titleSticky]}>
         <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
         >
            <Stack alignItems="center" spacing={1} direction="row">
               <Box sx={styles.icon} component={Settings} />
               <Typography sx={styles.titleText} variant="medium">
                  Settings
               </Typography>
            </Stack>
            <IconButton sx={styles.closeButton} onClick={handleClose}>
               <Box sx={styles.icon} component={CloseIcon} />
            </IconButton>
         </Stack>
      </DialogTitle>
   )
}
