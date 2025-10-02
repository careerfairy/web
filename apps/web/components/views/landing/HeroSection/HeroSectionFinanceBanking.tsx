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
      backgroundColor: "#E8F5E9",
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
      background: "linear-gradient(180deg, #0DFF00 0%, #2E7D32 100%)",
      zIndex: 1,
   },
   rightRectangle: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "50%",
      height: "100%",
      background: "linear-gradient(135deg, rgba(46, 125, 50, 0.42) 0%, #ADFFB5 100%)",
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
      color: "#1B9A21",
      fontWeight: "bold",
   },
})

interface HeroSectionFinanceBankingProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
}

const HeroSectionFinanceBanking: React.FC<HeroSectionFinanceBankingProps> = () => {
   const title = "Finance Collection"
   const subTitle = "Access leading finance and banking talent through exclusive career events, industry insights sessions, and direct networking with qualified professionals."
   const buttons = [
      <HeroButton
         key="demo"
         color="tertiary"
         variant="contained"
         fullWidth
         component={Link}
         href="/demo-request"
      >
         Book a Demo
      </HeroButton>,
      <HeroButton
         key="events"
         color="tertiary"
         variant="outlined"
         fullWidth
         component={Link}
         href="/next-livestreams?industry=Finance&Banking"
      >
         View Finance Events
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

export default HeroSectionFinanceBanking