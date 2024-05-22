import { Dialog, SwipeableDrawer } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { setShareVideoDialogOpen } from "store/reducers/streamingAppReducer"
import { useShareVideoDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { ShareVideoForm } from "./ShareVideoForm"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 589,
         maxWidth: 589,
         p: 4,
         borderRadius: "12px",
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         p: 2.5,
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
         maxHeight: "calc(100vh - 40px)",
      },
   },
   drawerContent: {
      p: 2,
      pt: 2.5,
   },
})

export const ShareVideoDialog = () => {
   const isMobile = useStreamIsMobile()

   const open = useShareVideoDialogOpen()

   const dispatch = useAppDispatch()

   const closeMenu = () => {
      dispatch(setShareVideoDialogOpen(false))
   }

   if (isMobile) {
      return (
         <SwipeableDrawer
            open={open}
            sx={styles.drawer}
            anchor="bottom"
            onClose={closeMenu}
            onOpen={closeMenu}
         >
            <ShareVideoForm onClose={closeMenu} />
         </SwipeableDrawer>
      )
   }

   return (
      <Dialog
         maxWidth={false}
         sx={styles.dialog}
         onClose={closeMenu}
         open={open}
         TransitionProps={{ unmountOnExit: true }}
      >
         <ShareVideoForm onClose={closeMenu} />
      </Dialog>
   )
}
