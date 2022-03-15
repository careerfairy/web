import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import HighlightText from "components/views/common/HighlightText"
import SectionHeader from "../../common/SectionHeader"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import Fade from "@stahl.luke/react-reveal/Fade"
import LinkifyText from "../../../util/LinkifyText"

const styles = {
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
}

const AboutSection = (props) => {
   return (
      <Section
         big={props.big}
         sectionRef={props.sectionRef}
         sectionId={props.sectionId}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            {props.overheadText && (
               <Fade fraction={props.forceReveal ? 0 : 0.2} bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}
            {props.title && (
               <Fade fraction={props.forceReveal ? 0 : 0.2} bottom>
                  <SectionHeader
                     color={props.color}
                     sx={styles.header}
                     title={props.title}
                     subtitle={props.subtitle}
                     titleSx={styles.title}
                  />
               </Fade>
            )}
            <Fade fraction={props.forceReveal ? 0 : 0.2} bottom>
               <Box>
                  <LinkifyText>
                     <Typography
                        style={{ whiteSpace: "pre-line" }}
                        color="textSecondary"
                        variant="h6"
                     >
                        {props.summary}
                     </Typography>
                  </LinkifyText>
               </Box>
            </Fade>
         </SectionContainer>
      </Section>
   )
}

export default AboutSection

AboutSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
