import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import { Grid, Hidden } from "@mui/material"
import LaptopVideo from "./LaptopVideo"
import GeneralHeroMessage from "./HeroMessage"
import SectionContainer from "../../common/Section/Container"
import Slide from "@mui/material/Slide"

const styles = {
   messageGridItem: (theme) => ({
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      [theme.breakpoints.down("lg")]: {
         justifyContent: "center",
      },
   }),
   laptopGridItem: {
      display: "flex",
      alignItems: "center",
   },
}
const HeroSection = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   buttons,
   title,
   subTitle,
}) => {
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

export default HeroSection

HeroSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
