import React from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Icon } from "react-feather"

const styles = sxStyles({
   root: {
      display: "flex",
      height: "34px",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      borderRadius: "53px",
      background: "#EDEDED",
      border: "none",
      minWidth: "130px",
   },
   caption: {
      color: "#BBB",
      leadingTrim: "both",
      textEdge: "cap",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.154px",
   },
})

type Props = {
   label?: string
   icon?: Icon
   type?: "submit" | "button" | "reset" | undefined
   onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const SaveChangesButton = ({
   icon,
   label = "Save changes",
   type = "button",
   onClick,
}: Props) => {
   return (
      <Button sx={styles.root} type={type ? type : "button"} onClick={onClick}>
         <Typography variant="caption" sx={styles.caption}>
            {label}
         </Typography>
         {Boolean(icon) ? icon : <></>}
      </Button>
   )
}
export default SaveChangesButton
