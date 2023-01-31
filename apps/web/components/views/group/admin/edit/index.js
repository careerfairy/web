import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Container, Grid } from "@mui/material"
import Profile from "./Profile"
import ProfileDetails from "./ProfileDetails"
import ProfileCategories from "./ProfileCategories"
import ProfilePrivacyPolicy from "./ProfilePrivacyPolicy"
import { withFirebase } from "../../../../../context/firebase/FirebaseServiceContext"
import ProfileBanner from "./ProfileBanner"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
   },
}))

const EditOverview = ({ firebase }) => {
   const { group } = useGroup()
   const classes = useStyles()

   return (
      <Container className={classes.root} maxWidth="lg">
         <Grid container spacing={3}>
            <Grid item lg={5} md={6} xs={12}>
               <Grid container spacing={3}>
                  <Grid xs={12} item>
                     <Profile firebase={firebase} group={group} />
                  </Grid>
                  <Grid xs={12} item>
                     <ProfileBanner group={group} />
                  </Grid>
               </Grid>
            </Grid>
            <Grid item lg={7} md={6} xs={12}>
               <Grid spacing={3} container>
                  <Grid item lg={12} md={12} xs={12}>
                     <ProfileDetails firebase={firebase} group={group} />
                  </Grid>
                  <Grid item lg={12} md={12} xs={12}>
                     <ProfileCategories />
                  </Grid>
                  <Grid item lg={12} md={12} xs={12}>
                     <ProfilePrivacyPolicy firebase={firebase} group={group} />
                  </Grid>
               </Grid>
            </Grid>
         </Grid>
      </Container>
   )
}

EditOverview.propTypes = {
   firebase: PropTypes.object,
   group: PropTypes.object,
}

export default withFirebase(EditOverview)
