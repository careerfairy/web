import {
   Button,
   Dialog,
   DialogContent,
   DialogTitle,
   Typography,
} from "@mui/material"
import Groups from "./Groups"
import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import { sxStyles } from "../../../../types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"
import useIsMobile from "../../../custom-hook/useIsMobile"

const styles = sxStyles({
   header: {
      backgroundColor: "white",
      boxShadow: "none",
      borderBottom: "1px solid #EDE7FD",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
   },
   closeBtn: {
      position: "absolute",
      top: "11px",
      right: "5px",
   },
})

type Props = {
   open: boolean
   hideCloseDisabled?: boolean
   handleClose?: () => void
}
const ManageCompaniesDialog = ({
   open,
   hideCloseDisabled,
   handleClose,
}: Props) => {
   const { userData } = useAuth()
   const isMobile = useIsMobile()

   return (
      <Dialog open={open} fullWidth maxWidth="lg">
         <DialogTitle sx={styles.header}>
            <Typography variant={"h4"} fontWeight={"600"} color="black">
               Your Managed Companies
            </Typography>
         </DialogTitle>
         {hideCloseDisabled ? null : (
            <IconButton
               onClick={handleClose}
               sx={styles.closeBtn}
               color={"default"}
            >
               <CloseIcon fontSize="large" />
            </IconButton>
         )}
         {userData?.isAdmin && hideCloseDisabled ? (
            <Button
               sx={styles.closeBtn}
               color="primary"
               variant="contained"
               size="small"
               onClick={handleClose}
            >
               {isMobile ? "Portal" : "Go to Portal"}
            </Button>
         ) : null}
         <DialogContent>
            <Groups isOnDialog={true} />
         </DialogContent>
      </Dialog>
   )
}

export default ManageCompaniesDialog
