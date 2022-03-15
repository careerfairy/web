import PropTypes from "prop-types"
import React from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { DialogContent, Grid, useMediaQuery } from "@mui/material"

import Tabs from "@mui/material/Tabs"
import CallToActionTypeButton from "./CallToActionTypeButton"
import {
   callToActionsArray,
   callToActionsDictionary,
} from "../../../../../../util/constants/callToActions"

const useStyles = makeStyles((theme) => ({
   gridContainer: {},
   tabsIndicator: {
      background: (props) => props.indicatorColor,
   },
   dialogContent: {
      padding: theme.spacing(0, 3, 3),
   },
}))

const CallToActionTypeMenu = ({ initialValues, handleSetCallToActionType }) => {
   const {
      palette: { grey, primary },
      breakpoints,
   } = useTheme()
   const mobile = useMediaQuery(breakpoints.down("xs"))
   const getColor = (ctaTypeColor) => {
      return ctaTypeColor === "primary"
         ? primary.main
         : ctaTypeColor || grey["500"]
   }

   const classes = useStyles({
      indicatorColor: getColor(initialValues.color),
   })

   return (
      <React.Fragment>
         {mobile ? (
            <Grid className={classes.gridContainer} container spacing={2}>
               {callToActionsArray.map((ctaType) => (
                  <Grid item xs={12} key={ctaType.type}>
                     <CallToActionTypeButton
                        data={ctaType}
                        mobile={true}
                        isJobPosting={
                           ctaType.type ===
                           callToActionsDictionary.jobPosting.type
                        }
                        active={initialValues.type === ctaType.type}
                        handleSetCallToActionType={handleSetCallToActionType}
                        color={
                           ctaType.color === "primary"
                              ? primary.main
                              : ctaType.color || grey["500"]
                        }
                     />
                  </Grid>
               ))}
            </Grid>
         ) : (
            <Tabs
               value={initialValues.value}
               onChange={handleSetCallToActionType}
               variant="scrollable"
               indicatorColor="secondary"
               TabIndicatorProps={{
                  className: classes.tabsIndicator,
               }}
               textColor="secondary"
               aria-label="icon label tabs example"
            >
               {callToActionsArray.map((ctaType) => (
                  <CallToActionTypeButton
                     key={ctaType.type}
                     isJobPosting={
                        ctaType.type === callToActionsDictionary.jobPosting.type
                     }
                     data={ctaType}
                     handleSetCallToActionType={handleSetCallToActionType}
                     color={getColor(ctaType.color)}
                  />
               ))}
            </Tabs>
         )}
      </React.Fragment>
   )
}

export default CallToActionTypeMenu

CallToActionTypeMenu.propTypes = {
   handleSetCallToActionType: PropTypes.func.isRequired,
}
