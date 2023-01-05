import { Box, Container } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import React from "react"
import clsx from "clsx"

const useStyles = makeStyles((theme) => ({
   categoryContainerCenteredStyle: {
      display: "grid",
      placeItems: "center",
      width: "100%",
      height: "100%",
   },
   categoryContainerTopAlignedStyles: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      height: "100%",
   },
   questionContainerHeaderStyle: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      justifyContent: "space-evenly",
      boxShadow: theme.shadows[2],
      zIndex: 9000,
      backgroundColor: theme.palette.background.paper,
      "& > *:nth-last-child(n+2)": {
         marginBottom: theme.spacing(2),
      },
      // padding: theme.spacing(2),
      // height: 130,
   },
   questionContainerTitleStyle: {
      width: "100%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      fontSize: "1.6em",
      fontWeight: 500,
      color: theme.palette.text.secondary,
      textAlign: "center",
      margin: theme.spacing(2, 0),
   },
   categoryContainerContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      "& > *:nth-last-child(n+2)": {
         marginBottom: theme.spacing(2),
      },
   },
}))

export const CategoryContainerCentered = ({ ...props }) => {
   const classes = useStyles()
   return <Box className={classes.categoryContainerCenteredStyle} {...props} />
}
export const CategoryContainerContent = ({ ...props }) => {
   const classes = useStyles()
   return <Box className={classes.categoryContainerContent} {...props} />
}

export const CategoryContainerTopAligned = ({
   className = undefined,
   ...props
}) => {
   const classes = useStyles()
   return (
      <Box
         className={clsx(classes.categoryContainerTopAlignedStyles, className)}
         {...props}
      />
   )
}

export const QuestionContainerHeader = ({
   className = undefined,
   ...props
}) => {
   const classes = useStyles()
   return (
      <Box
         className={clsx(classes.questionContainerHeaderStyle, className)}
         {...props}
      />
   )
}

export const QuestionContainerTitle = ({ ...props }) => {
   const classes = useStyles()
   return <Box className={classes.questionContainerTitleStyle} {...props} />
}

export const ResponsiveContainer = ({ children, ...props }) => {
   return (
      <Container maxWidth="lg" {...props}>
         {children}
      </Container>
   )
}
