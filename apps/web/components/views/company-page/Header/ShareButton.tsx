import React from "react"
import Button from "@mui/material/Button"
import { useCompanyPage } from "../"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import ShareCompanyPageDialog from "../../common/ShareCompanyPageDialog"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"

const ShareButton = () => {
   const { group, editMode } = useCompanyPage()

   const [
      shareCompanyDialogOpen,
      handleOpenShareCompanyDialog,
      handleCloseShareCompanyDialog,
   ] = useDialogStateHandler()

   return (
      <>
         <Button
            onClick={handleOpenShareCompanyDialog}
            variant={"outlined"}
            size={"small"}
            sx={{
               fontSize: {
                  xs: "0.75rem",
                  md: "0.875rem",
               },
            }}
            color={"primary"}
            startIcon={<ShareIcon />}
         >
            Share
         </Button>
         {shareCompanyDialogOpen ? (
            <ShareCompanyPageDialog
               group={group}
               handleClose={handleCloseShareCompanyDialog}
               isGroupAdmin={editMode}
            />
         ) : null}
      </>
   )
}

export default ShareButton
