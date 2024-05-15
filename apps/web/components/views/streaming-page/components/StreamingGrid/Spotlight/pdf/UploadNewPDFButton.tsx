import { Button, IconButton } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { RefreshCcw } from "react-feather"
import { setUploadPDFPresentationDialogOpen } from "store/reducers/streamingAppReducer"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      backgroundColor: (theme) => theme.brand.white[200],
      position: "absolute",
      top: 16,
      right: 16,
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[200],
      },
   },
   iconButton: {
      backgroundColor: (theme) => theme.brand.white[200],
      position: "absolute",
      right: 8,
      top: 8,
      border: (theme) => `1px solid ${theme.palette.primary.main}`,
      "& svg": {
         color: "primary.main",
         width: 16,
         height: 16,
      },
   },
})

export const UploadNewPDFButton = () => {
   const dispatch = useAppDispatch()
   const isMobile = useStreamIsMobile()

   const handleOpenUploadDialog = () => {
      dispatch(setUploadPDFPresentationDialogOpen(true))
   }

   if (isMobile) {
      return (
         <IconButton sx={styles.iconButton} onClick={handleOpenUploadDialog}>
            <RefreshCcw />
         </IconButton>
      )
   }

   return (
      <Button
         color="primary"
         variant="outlined"
         sx={styles.root}
         onClick={handleOpenUploadDialog}
      >
         Upload New PDF
      </Button>
   )
}
