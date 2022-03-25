import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Grid, Typography } from "@mui/material"
import SupportSectionCard from "./SupportSectionCard"
import { supportSections } from "../../dumyData"

const useStyles = makeStyles((theme) => ({
   sectionGridItem: {
      display: "grid",
   },
}))

const Support = () => {
   const classes = useStyles()

   return (
      <React.Fragment>
         <Grid spacing={3} container>
            {supportSections.map((section) => (
               <Grid
                  className={classes.sectionGridItem}
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={section.title}
               >
                  <SupportSectionCard section={section} />
               </Grid>
            ))}
         </Grid>
      </React.Fragment>
   )
}

export default Support

Support.propTypes = {
   title: PropTypes.string,
}
