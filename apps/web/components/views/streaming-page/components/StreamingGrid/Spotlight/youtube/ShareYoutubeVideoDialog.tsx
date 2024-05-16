import { Dialog, SwipeableDrawer } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { Youtube } from "react-feather"
import { setShareYoutubeVideoDialogOpen } from "store/reducers/streamingAppReducer"
import { useShareYoutubeVideoDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { SidePanelView } from "../../../SidePanel/SidePanelView"
import { ShareYoutubeVideoForm } from "./ShareYoutubeVideoForm"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 589,
         maxWidth: 589,
         p: 4,
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
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

export const ShareYoutubeVideoDialog = () => {
   const isMobile = useStreamIsMobile()

   const open = useShareYoutubeVideoDialogOpen()

   const dispatch = useAppDispatch()

   const closeMenu = () => {
      dispatch(setShareYoutubeVideoDialogOpen(false))
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
            <SidePanelView
               contentWrapperStyles={styles.drawerContent}
               id="share-youtube-drawer"
               title="Share video"
               icon={<Youtube />}
            >
               <ShareYoutubeVideoForm isMobile={isMobile} onClose={closeMenu} />
            </SidePanelView>
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
         <ShareYoutubeVideoForm isMobile={isMobile} onClose={closeMenu} />
      </Dialog>
   )
}
