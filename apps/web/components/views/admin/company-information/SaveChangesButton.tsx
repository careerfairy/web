import React, { ReactElement } from "react"
import { Box, Button, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Icon } from "react-feather"

const styles = sxStyles({
   active: {
      display: "flex",
      height: "34px",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-end",
      gap: "8px",
      borderRadius: "53px",
      background: "#6749EA",
      ".MuiTypography-button": {
         textTransform: "none",
      },
      ":hover": {
         svg: {
            stroke: "#6749EA",
         },
         ".MuiTypography-button": {
            color: "#6749EA",
         },
      },
   },
   inactive: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-end",
      gap: "10px",
      borderRadius: "32px",
      background: "#EDEDED",
      ".MuiTypography-button": {
         textTransform: "none",
      },
      ":hover": {
         background: "#EDEDED",
         cursor: "not-allowed",
      },
   },
   textActive: {
      color: "#FFF",
      leadingTrim: "both",
      textEdge: "cap",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.154px",
   },
   textInactive: {
      color: "#BBB",
      leadingTrim: "both",
      textEdge: "cap",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.154px",
   },
})

type Props = {
   children?: string
   icon?: Icon | Element | ReactElement<any, any>
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
         <Typography
            variant="button"
            sx={active ? styles.textActive : styles.textInactive}
         >
            {children}
         </Typography>
         {Boolean(icon) && (
            <Box sx={{ width: "16px", height: "24px", alignSelf: "center" }}>
               {icon}
            </Box>
         )}
      </Button>
   )
}
export default SaveChangesButton
