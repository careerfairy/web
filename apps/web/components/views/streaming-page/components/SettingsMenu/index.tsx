import { Box, Dialog, SwipeableDrawer } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import React from "react"
import { toggleSettingsMenu } from "store/reducers/streamingAppReducer"
import { useSettingsMenuOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { SettingsMenuProvider } from "./SettingsMenuContext"
import { Title } from "./Title"
import { Actions } from "./Actions"
import { Body } from "./Body"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 571,
         maxWidth: 571,
         maxHeight: 571,
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
         maxHeight: "calc(100vh - 88px)",
      },
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
      <SettingsMenuProvider isMobile={isMobile} onClose={onClose}>
         <Title />
         <Body />
         <Actions />
      </SettingsMenuProvider>
   )
}
