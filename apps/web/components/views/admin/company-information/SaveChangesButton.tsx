import React from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Icon } from "react-feather"

const styles = sxStyles({
   active: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      borderRadius: "32px",
      background: "#6749EA",
   },
   inactive: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      borderRadius: "32px",
      background: "#EDEDED",
      color: "#BBB",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "20px",
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
   children?: string
   icon?: Icon
   type?: "submit" | "button" | "reset" | undefined
   active?: boolean
   onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const SaveChangesButton = ({
   icon,
   children = "Save changes",
   type = "button",
   active = false,
   onClick,
}: Props) => {
   return (
      <Button
         sx={active ? styles.active : styles.inactive}
         type={type ? type : "button"}
         onClick={onClick}
      >
         <Typography>{children}</Typography>
         {Boolean(icon) ? icon : <></>}
      </Button>
   )
}
export default SaveChangesButton
