import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Box, Card, CardHeader, Collapse, Typography } from "@mui/material"
import useScrollTrigger from "@mui/material/useScrollTrigger"

const useStyles = makeStyles((theme) => ({
   root: {
      boxShadow: "none",
      background: "none",
   },
   title: {
      // fontWeight: 400
      marginRight: theme.spacing(1.5),
   },
   header: {
      paddingLeft: theme.spacing(3),
   },
   titleButton: {},
   menuItem: {
      "&:focus": {
         backgroundColor: theme.palette.primary.main,
         "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: theme.palette.common.white,
         },
      },
   },
}))

const Header = ({ isDraft }) => {
   const classes = useStyles()
   const isScrolling = useScrollTrigger({ disableHysteresis: true })

   return (
      <Collapse in={!isScrolling}>
         <Card className={classes.root}>
            <CardHeader
               className={classes.header}
               title={
                  <Box display="flex" flexWrap="wrap" alignItems="center">
                     <Typography className={classes.title} variant="h4">
                        {isDraft ? "Drafts" : "Events"}
                     </Typography>
                  </Box>
               }
               subheader={
                  isDraft
                     ? "Manage and approve your drafts"
                     : "Manage your upcoming and past events"
               }
            />
         </Card>
      </Collapse>
   )
}

export default Header
