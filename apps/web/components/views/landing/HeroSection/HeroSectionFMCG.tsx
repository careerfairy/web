import React from "react"
import Section from "components/views/common/Section"
import { Grid, Hidden } from "@mui/material"
import LaptopVideo from "./LaptopVideo"
import GeneralHeroMessage from "./HeroMessage"
import SectionContainer from "../../common/Section/Container"
import Slide from "@mui/material/Slide"
import HeroButton from "./HeroButton"
import Link from "materialUI/NextNavLink"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
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
})

interface HeroSectionFMCGProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: string
}

const HeroSectionFMCG: React.FC<HeroSectionFMCGProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
}) => {
   const title = "Connect with Top FMCG Talent"
   const subTitle = "Access the best consumer goods professionals through live career events, networking sessions, and direct recruitment opportunities."
   const buttons = [
      <HeroButton
         key="demo"
         color="primary"
         variant="contained"
         fullWidth
         component={Link}
         href="/demo-request"
      >
         Book a Demo
      </HeroButton>,
      <HeroButton
         key="events"
         color="primary"
         variant="outlined"
         fullWidth
         component={Link}
         href="/next-livestreams?industry=FMCG"
      >
         View FMCG Events
      </HeroButton>,
   ]

   return (
      <Section
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth="xl">
            <Grid spacing={2} container>
               <Slide timeout={1000} in direction="right">
                  <Grid sx={styles.messageGridItem} item xs={12} lg={6}>
                     <GeneralHeroMessage
                        title={title}
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
      </Section>
   )
}

export default HeroSectionFMCG