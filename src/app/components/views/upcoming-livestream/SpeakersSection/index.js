import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "components/views/common/HighlightText";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import { Grid, Typography } from "@material-ui/core";
import Fade from "react-reveal/Fade";
import SpeakerCard from "./SpeakerCard";

const useStyles = makeStyles((theme) => ({
   section: {},
   subTitle: {},
   header: {
      "&:not(:last-child)": {
         marginBottom: theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
}));

const SpeakersSection = (props) => {
   const classes = useStyles();

   return (
      <Section
         className={classes.section}
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
               <Fade bottom>
                  <Box marginBottom={4}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}
            {props.title && (
               <Fade bottom>
                  <SectionHeader
                     color={props.color}
                     className={classes.header}
                     title={props.title}
                     subtitle={props.subtitle}
                     titleClassName={classes.title}
                  />
               </Fade>
            )}
            <Box width="100%">
               <Fade bottom>
                  <Box>
                     <Grid justifyContent="center" container spacing={2}>
                        {props.speakers.map((speaker) => (
                           <Grid key={speaker.id} xs={12} sm={6} md={4} item>
                              <SpeakerCard speaker={speaker} />
                           </Grid>
                        ))}
                     </Grid>
                  </Box>
               </Fade>
            </Box>
         </SectionContainer>
      </Section>
   );
};

export default SpeakersSection;

SpeakersSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
