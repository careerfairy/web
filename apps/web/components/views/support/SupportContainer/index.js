import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Container, Grid, Hidden } from "@mui/material"
import SupportNav from "../SupportNav"

const useStyles = makeStyles((theme) => ({
   root: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
}))

const SupportContainer = ({ withNav, children }) => {
   const classes = useStyles()

   return (
      <Container className={classes.root}>
         <Grid container spacing={4}>
            <Hidden mdDown>
               <Grid md={3} item>
                  <SupportNav />
               </Grid>
            </Hidden>
            <Grid xs={12} sm={12} md={7} item>
               {children}
            </Grid>
         </Grid>
      </Container>
   )
}

export default SupportContainer

SupportContainer.propTypes = {
   children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node),
   ]).isRequired,
   withNav: PropTypes.bool,
}
