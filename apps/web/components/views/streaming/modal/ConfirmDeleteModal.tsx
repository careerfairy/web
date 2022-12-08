import React from "react"
import GenericDialog from "../../common/GenericDialog"
import Typography from "@mui/material/Typography"
import LoadingButton from "@mui/lab/LoadingButton"

type Props = {
   title: string
   description: string | React.ReactNode
   onConfirm: () => Promise<any> | any
   onClose: () => void
   loading?: boolean
}
const ConfirmDeleteModal = (props: Props) => {
   return (
      <GenericDialog
         maxWidth={"xs"}
         title={props.title}
         additionalRightButton={
            <LoadingButton
               onClick={props.onConfirm}
               loading={props.loading}
               variant={"contained"}
               color="error"
            >
               Delete
            </LoadingButton>
         }
         closeBtnText={"Cancel"}
         onClose={props.onClose}
         showCloseBtn
         titleOnCenter
      >
         <Typography align={"center"} variant="body1">
            {props.description}
         </Typography>
      </GenericDialog>
   )
}

export default ConfirmDeleteModal
