import React from "react"
import { Box, Grid, Hidden, Typography } from "@mui/material"
import LaptopVideo from "./LaptopVideo"
import GeneralHeroMessage from "./HeroMessage"
import SectionContainer from "../../common/Section/Container"
import Slide from "@mui/material/Slide"
import HeroButton from "./HeroButton"
import Link from "materialUI/NextNavLink"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   heroSection: {
      position: "relative",
      minHeight: "100vh",
      backgroundColor: "#9A9A9A",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      [theme => theme.breakpoints.up("sm")]: {
         paddingTop: "160px",
         paddingBottom: "160px",
      },
      [theme => theme.breakpoints.down("md")]: {
         paddingTop: "48px",
         paddingBottom: "48px",
      },
   },
   leftRectangle: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "50%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      zIndex: 1,
   },
   rightRectangle: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "50%",
      height: "100%",
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, #FFFFFF 100%)",
      zIndex: 1,
   },
   contentContainer: {
      position: "relative",
      zIndex: 2,
      width: "100%",
   },
   messageGridItem: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      [theme => theme.breakpoints.down("lg")]: {
         justifyContent: "center",
      },
   },
   laptopGridItem: {
      display: "flex",
      alignItems: "center",
   },
   customTitle: {
      color: "#FFFFFF",
      fontWeight: "bold",
   },
})

interface HeroSectionEngineeringProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
}

const HeroSectionEngineering: React.FC<HeroSectionEngineeringProps> = () => {
   const title = "Engineering Collection"
   const subTitle = "Connect with skilled engineers and manufacturing professionals through targeted career events, technical workshops, and industry-specific networking opportunities."
   const buttons = [
      <HeroButton
         key="demo"
         color="secondary"
         variant="contained"
         fullWidth
         component={Link}
         href="/demo-request"
      >
         Book a Demo
      </HeroButton>,
      <HeroButton
         key="events"
         color="secondary"
         variant="outlined"
         fullWidth
         component={Link}
         href="/next-livestreams?industry=Engineering"
      >
         View Engineering Events
      </HeroButton>,
   ]

   return (
      <Box sx={styles.heroSection}>
         {/* Left Rectangle */}
         <Box sx={styles.leftRectangle} />
         
         {/* Right Rectangle */}
         <Box sx={styles.rightRectangle} />
         
         {/* Content */}
         <Box sx={styles.contentContainer}>
            <SectionContainer maxWidth="xl">
               <Grid spacing={2} container>
                  <Slide timeout={1000} in direction="right">
                     <Grid sx={styles.messageGridItem} item xs={12} lg={6}>
                        <GeneralHeroMessage
                           title={<Typography variant="h2" sx={styles.customTitle}>{title}</Typography>}
                           subTitle={subTitle}
                           buttons={buttons}
                        />
                     </Grid>
                  </Slide>
                  <Hidden lgDown>
                     <Slide timeout={1000} in direction="left">
                        <Grid sx={styles.laptopGridItem} item md={6}>
                           <LaptopVideo />
                        </Grid>
                     </Slide>
                  </Hidden>
               </Grid>
            </SectionContainer>
         </Box>
      </Box>
   )
}

export default HeroSectionEngineering