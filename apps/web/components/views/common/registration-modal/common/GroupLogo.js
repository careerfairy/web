import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { CardMedia } from "@mui/material"
import Image from "next/image"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"

const useStyles = makeStyles((theme) => ({
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: 150,
      maxWidth: 350,
      alignSelf: "center",
      margin: "0 auto",
   },
   image: {
      objectFit: "contain",
      maxWidth: "80%",
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      background: theme.palette.common.white,
   },
}))
const GroupLogo = ({ logoUrl, alt = "" }) => {
   const classes = useStyles()
   return (
      <CardMedia className={classes.media}>
         <Image
            src={getResizedUrl(logoUrl, "md")}
            width={350}
            height={150}
            className={classes.image}
            alt={alt}
         />
      </CardMedia>
   )
}

export default GroupLogo
