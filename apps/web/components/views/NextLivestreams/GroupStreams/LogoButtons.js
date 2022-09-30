import React, { useContext, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { ButtonBase, Typography } from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { RegistrationContext } from "../../../../context/registration/RegistrationContext"

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      minWidth: 250,
      padding: "1rem",
      paddingTop: 0,
      width: "100%",
   },
   image: {
      position: "relative",
      background: theme.palette.common.white,
      padding: theme.spacing(4),
      borderRadius: 6,
      height: 200,
      flex: 1,
      minWidth: 200,
      margin: "0.5rem",
      [theme.breakpoints.down("sm")]: {
         padding: 0,
         width: "100% !important", // Overrides inline-style
         height: 100,
      },
      "&:hover, &$focusVisible": {
         zIndex: 1,
         // "& $imageBackdrop": {
         //    opacity: 0.15,
         // },
         "& $imageMarked": {
            opacity: 0,
         },
         "& $imageTitle": {
            border: "4px solid currentColor",
         },
      },
   },

   focusVisible: {
      opacity: 0.3,
   },
   imageSrc: {
      width: "100%",
      height: "100%",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      maxWidth: "80%",
      maxHeight: "80%",
   },
   imageTitle: {
      position: "relative",
      padding: `${theme.spacing(2)} ${theme.spacing(4)} ${
         theme.spacing(1) + 6
      }px`,
   },
   imageMarked: {
      height: 3,
      width: 18,
      backgroundColor: theme.palette.common.white,
      position: "absolute",
      bottom: -2,
      left: "calc(50% - 9px)",
      transition: theme.transitions.create("opacity"),
   },
   otherText: {
      color: theme.palette.common.black,
      fontWeight: "bold",
   },
}))

const LogoButtons = () => {
   const classes = useStyles()
   const { setGroup, groups } = useContext(RegistrationContext)

   const [hasMoreThanOneCompanyGroup, setHasMoreThanOneCompanyGroup] =
      useState(false)

   useEffect(() => {
      const numberOfCompanyGroups = groups.reduce((count, currentGroup) => {
         return !currentGroup?.universityCode ? count + 1 : count
      }, 0)
      setHasMoreThanOneCompanyGroup(numberOfCompanyGroups > 1)
   }, [groups])

   return (
      <div className={classes.root}>
         {groups.map((group) => (
            <ButtonBase
               focusRipple
               onClick={() => setGroup(group)}
               key={group.universityName}
               className={classes.image}
               focusVisibleClassName={classes.focusVisible}
            >
               {group.universityCode || hasMoreThanOneCompanyGroup ? (
                  <div
                     className={classes.imageSrc}
                     style={{
                        backgroundImage: `url("${getResizedUrl(
                           group.logoUrl,
                           "sm"
                        )}")`,
                     }}
                  />
               ) : (
                  <Typography className={classes.otherText} variant="h2">
                     OTHER
                  </Typography>
               )}
            </ButtonBase>
         ))}
      </div>
   )
}

export default LogoButtons
