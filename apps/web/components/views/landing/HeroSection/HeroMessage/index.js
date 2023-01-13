import PropTypes from "prop-types"
import Typography from "@mui/material/Typography"
import { Box, Grid } from "@mui/material"
import HeroButton from "../HeroButton"
import Link from "materialUI/NextNavLink"
import { calendarIcon, playIcon } from "constants/images"
import React from "react"
import { alpha } from "@mui/material/styles"
import SvgIcon from "@mui/material/SvgIcon"
import { hubSpotFunnelLink } from "../../../../../constants/links"

const styles = {
   linkButton: {
      textDecoration: "none !important",
      background: (theme) => alpha(theme.palette.common.white, 0.8),
      "&:hover": {
         background: (theme) => alpha(theme.palette.background.paper, 0.8),
      },
   },
   buttonsWrapper: (theme) => ({
      marginTop: theme.spacing(10),
      [theme.breakpoints.down("md")]: {
         marginTop: theme.spacing(1),
      },
      //width: "100%",
   }),
   heroContent: (theme) => ({
      padding: theme.spacing(0, 0, 0, 5),
      maxWidth: 720,
      marginRight: "auto",
      marginLeft: "auto",
      [theme.breakpoints.down("md")]: {
         padding: theme.spacing(0, 2),
      },
   }),
   starIcon: {
      position: "relative",
      top: "0.03em",
      fontSize: "0.63em",
      margin: "0 0.1em",
   },
}

function AStarIcon(props) {
   return (
      <SvgIcon width="35" height="34" viewBox="0 0 35 34" {...props}>
         <path
            xmlns="http://www.w3.org/2000/svg"
            id="a-star"
            sx="styles-1"
            d="M319.873,447.375v6.007a10.384,10.384,0,0,0-4.043-4.7,12.009,12.009,0,0,0-6.54-1.725,13.433,13.433,0,0,0-7.343,2.052,14.075,14.075,0,0,0-5.113,5.887,22.836,22.836,0,0,0,0,18.11,14.04,14.04,0,0,0,5.113,5.917,13.433,13.433,0,0,0,7.343,2.052,12.009,12.009,0,0,0,6.54-1.725,10.373,10.373,0,0,0,4.043-4.7v6.006H329.98V447.375H319.873Zm1.03,14.287-5.2,4.363,1.744,6.127a0.976,0.976,0,0,1-.365,1.054,0.991,0.991,0,0,1-1.123.034l-5.567-3.578-5.567,3.578a1,1,0,0,1-1.124-.034,0.974,0.974,0,0,1-.364-1.054l1.743-6.127-5.2-4.363a0.974,0.974,0,0,1-.3-1.051,0.985,0.985,0,0,1,.868-0.674l6.242-.446,2.808-6.094a0.992,0.992,0,0,1,1.8,0l2.809,6.094,6.241,0.446a0.984,0.984,0,0,1,.868.674A0.974,0.974,0,0,1,320.9,461.662Z"
            transform="translate(-294.969 -446.969)"
         />
      </SvgIcon>
   )
}

const RockstarTextTalent = () => {
   return (
      <div style={{ display: "inline-block" }}>
         <b>
            t
            <AStarIcon sx={styles.starIcon} />
            lent
         </b>
      </div>
   )
}
const GeneralHeroMessage = ({ title, buttons, subTitle }) => {
   return (
      <Box sx={styles.heroContent}>
         <Typography variant="h2">
            {title || (
               <>
                  <b>Engage</b> and recruit <RockstarTextTalent /> from leading{" "}
                  <b>schools.</b>
               </>
            )}
         </Typography>
         {subTitle}
         <Grid spacing={2} container sx={styles.buttonsWrapper}>
            {buttons?.map((button, index) => (
               <Grid xs={12} sm={12} key={index} md={6} item>
                  {button}
               </Grid>
            )) || (
               <>
                  <Grid xs={12} sm={12} md={6} item>
                     <HeroButton
                        color="primary"
                        variant="outlined"
                        fullWidth
                        href="/next-livestreams"
                        sx={styles.linkButton}
                        component={Link}
                        iconUrl={playIcon}
                     >
                        Our Next Events
                     </HeroButton>
                  </Grid>
                  <Grid xs={12} sm={12} md={6} item>
                     <HeroButton
                        color="secondary"
                        fullWidth
                        withGradient
                        target="_blank"
                        href={hubSpotFunnelLink}
                        iconUrl={calendarIcon}
                        variant="contained"
                     >
                        Book a Demo
                     </HeroButton>
                  </Grid>
               </>
            )}
         </Grid>
      </Box>
   )
}

GeneralHeroMessage.propTypes = {
   title: PropTypes.any,
}

export default GeneralHeroMessage
