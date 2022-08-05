import { Typography } from "@mui/material"
import React from "react"
import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   header: {
      marginTop: 4,
      fontFamily: "Poppins",
      textAlign: "center",
   },
   title: {
      fontWeight: 400,
      fontSize: "46px",
      lineHeight: "63px",
      letterSpacing: "-0.02em",
   },
   subtitle: {
      fontSize: "1.1rem",
      fontWeight: 400,
      lineHeight: "29px",
      letterSpacing: "-0.02em",
      marginTop: 3,
   },
})

type Props = {
   title: string
   subTitle: string
}

const Header = ({ title, subTitle }: Props) => {
   return (
      <Box sx={styles.header}>
         <Typography sx={styles.title}>{title}</Typography>
         <Typography sx={styles.subtitle}>{subTitle}</Typography>
      </Box>
   )
}

export default Header
