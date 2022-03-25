import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import Fade from "@stahl.luke/react-reveal/Fade"
import BenefitsGrid from "../../common/BenefitsGrid"
import { Box } from "@mui/material"

const styles = {
   subTitle: {
      color: (theme) => theme.palette.text.secondary,
      fontWeight: 500,
   },
   backgroundRectangle: (theme) => ({
      top: 0,
      position: "absolute",
      width: "100%",
      height: "100%",
      opacity: 0.35,
      right: "4%",
      [theme.breakpoints.down("lg")]: {
         right: theme.spacing(1),
      },
      [theme.breakpoints.down("md")]: {
         borderRadius: theme.spacing(0, 5, 5, 0),
      },
      borderRadius: theme.spacing(0, 10, 10, 0),
      background: "radial-gradient(closest-corner at 60% 55%, #fff, #fff4b6)",
   }),
}

const StudentBenefitsSection = (props) => {
   return (
      <Section
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Box sx={styles.backgroundRectangle} />
         <SectionContainer>
            <Fade right>
               <SectionHeader
                  color={props.color}
                  subTitleSx={styles.subTitle}
                  title={props.title}
                  subtitle={props.subtitle}
               />
            </Fade>
            <Fade up>
               <BenefitsGrid
                  primaryGradientStart={"#cfb6df"}
                  primaryGradientEnd={"#94bcff"}
                  secondaryGradientStart={"#ff968d"}
                  secondaryGradientEnd={"#fff"}
                  benefits={props.benefits}
               />
            </Fade>
         </SectionContainer>
      </Section>
   )
}

export default StudentBenefitsSection

StudentBenefitsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
