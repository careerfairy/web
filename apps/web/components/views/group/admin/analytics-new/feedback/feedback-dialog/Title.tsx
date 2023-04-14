import { FC, ReactNode } from "react"
import IconButton from "@mui/material/IconButton"
import DialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle"
import CloseIcon from "@mui/icons-material/Close"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      py: {
         mobile: 4,
      },
      px: {
         mobile: 4.75,
      },
   },
   iconButton: {
      position: "absolute",
      right: 8,
      top: 8,
      color: "text.primary",
   },
})

type Props = {
   id: string
   children?: ReactNode
   onClose: () => void
} & DialogTitleProps

const Title: FC<Props> = ({ children, onClose, ...rest }) => {
   return (
      <DialogTitle sx={styles.root} {...rest}>
         {children}
         {onClose ? (
            <IconButton
               aria-label="close"
               onClick={onClose}
               sx={styles.iconButton}
            >
               <CloseIcon />
            </IconButton>
         ) : null}
      </DialogTitle>
   )
}

export default Title
