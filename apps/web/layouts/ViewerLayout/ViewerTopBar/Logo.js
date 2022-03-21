import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Avatar } from "@mui/material"

const useStyles = makeStyles((theme) => ({
   logo: {
      padding: theme.spacing(0.5),
      margin: theme.spacing(0, 1),
      background: theme.palette.common.white,
      width: 70,
      boxShadow: theme.shadows[1],
      "& img": {
         objectFit: "contain",
      },
   },
}))

const Logo = ({ src }) => {
   const classes = useStyles()
   return <Avatar className={classes.logo} src={src} variant="rounded" />
}

export default Logo
