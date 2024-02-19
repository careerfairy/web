import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   IconButton,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import React, { Fragment } from "react"
import { X as CloseIcon, Settings } from "react-feather"
import { toggleSettingsMenu } from "store/reducers/streamingAppReducer"
import { useSettingsMenuOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { MicVolume } from "./MicVolume"
import { SettingsMenuProvider, useSettingsMenu } from "./SettingsMenuContext"
import { TempCameraSetup } from "./TempCameraSetup"
import { TempCameraSelect, TempMicrophoneSelect } from "./temp-device-select"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 571,
         maxWidth: 571,
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
   actions: {
      py: 1.5,
      px: 2,
   },
   actionsSticky: {
      position: "sticky",
      bottom: 0,
      backgroundColor: (theme) => theme.brand.white[200],
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
   },
   icon: {
      color: "neutral.900",
   },
   title: {
      p: 2,
      pt: 2.375,
   },
   titleText: {
      color: "neutral.800",
   },
   closeButton: {
      m: (theme) => `-${theme.spacing(1)} !important`,
   },
   heading: {
      fontWeight: 600,
      color: "neutral.900",
   },
   dialogContent: {
      p: 2,
   },
   closeBtn: {
      color: "neutral.500",
   },
})

export const SettingsMenu = () => {
   const isMobile = useStreamIsMobile(650)

   const settingsMenuOpen = useSettingsMenuOpen()

   const dispatch = useAppDispatch()

   const toggleMenu = () => {
      dispatch(toggleSettingsMenu())
   }

   if (isMobile) {
      return (
         <SwipeableDrawer
            open={settingsMenuOpen}
            sx={styles.drawer}
            anchor="bottom"
            onClose={toggleMenu}
            onOpen={toggleMenu}
         >
            <Box>
               <Content onClose={toggleMenu} isMobile={isMobile} />
            </Box>
         </SwipeableDrawer>
      )
   }
   return (
      <Dialog
         maxWidth={false}
         sx={styles.dialog}
         onClose={toggleMenu}
         open={settingsMenuOpen}
         TransitionProps={{ unmountOnExit: true }}
      >
         <Content onClose={toggleMenu} isMobile={isMobile} />
      </Dialog>
   )
}

type ContentProps = {
   onClose: () => void
   isMobile: boolean
}

const Content = ({ onClose, isMobile }: ContentProps) => {
   return (
      <SettingsMenuProvider onClose={onClose}>
         <DialogTitle sx={styles.title}>
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
               <IconButton sx={styles.closeButton} onClick={onClose}>
                  <Box sx={styles.icon} component={CloseIcon} />
               </IconButton>
            </Stack>
         </DialogTitle>
         <DialogContent sx={styles.dialogContent} dividers>
            <Stack spacing={3}>
               <Box>
                  <MenuHeading>Voice settings</MenuHeading>
                  <Box pb={2} />
                  <TempMicrophoneSelect />
                  <Box pb={1.5} />
                  <MicVolume />
               </Box>
               <Box>
                  <MenuHeading>Video settings</MenuHeading>
                  <Box pb={2} />
                  <TempCameraSelect />
                  <Box pb={1.5} />
                  <TempCameraSetup />
               </Box>
            </Stack>
         </DialogContent>
         <DialogActions sx={[styles.actions, isMobile && styles.actionsSticky]}>
            <Actions />
         </DialogActions>
      </SettingsMenuProvider>
   )
}

const Actions = () => {
   const { handleSaveAndClose, handleClose } = useSettingsMenu()

   return (
      <Fragment>
         <Button
            sx={styles.closeBtn}
            variant="outlined"
            color="grey"
            onClick={handleClose}
         >
            Close
         </Button>
         <Button variant="contained" onClick={handleSaveAndClose}>
            Save and close
         </Button>
      </Fragment>
   )
}

type MenuHeadingProps = {
   children: React.ReactNode
}

const MenuHeading = ({ children }: MenuHeadingProps) => {
   return (
      <Typography variant="brandedH4" sx={styles.heading}>
         {children}
      </Typography>
   )
}
