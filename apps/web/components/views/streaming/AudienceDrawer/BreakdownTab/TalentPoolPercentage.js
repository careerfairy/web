import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import withStyles from "@mui/styles/withStyles"
import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material"
import LinearProgress from "@mui/material/LinearProgress"

const BorderLinearProgress = withStyles((theme) => ({
   root: {
      height: 10,
      borderRadius: 5,
   },
   colorPrimary: {
      backgroundColor:
         theme.palette.grey[theme.palette.mode === "light" ? 200 : 700],
   },
   bar: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.main,
   },
}))(LinearProgress)

const useStyles = makeStyles((theme) => ({
   root: {
      background: theme.palette.background.default,
   },
   header: {
      paddingBottom: 0,
   },
   percentage: {
      fontWeight: 500,
   },
}))

const TalentPoolPercentage = ({ percentage, ...rest }) => {
   const classes = useStyles()
   return (
      <Card className={classes.root} {...rest}>
         <CardHeader
            className={classes.header}
            title="Percent in talent pool"
         />
         <CardContent>
            <Grid alignItems="center" container spacing={2}>
               <Grid item xs={1}>
                  <Typography variant="body2" className={classes.percentage}>
                     {percentage}%
                  </Typography>
               </Grid>
               <Grid item xs={11}>
                  <BorderLinearProgress
                     variant="determinate"
                     value={percentage}
                  />
               </Grid>
            </Grid>
         </CardContent>
      </Card>
   )
}

TalentPoolPercentage.propTypes = {
   className: PropTypes.string,
   percentage: PropTypes.number.isRequired,
}
export default TalentPoolPercentage
