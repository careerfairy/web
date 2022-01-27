import PropTypes from "prop-types";
import React from "react";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import SectionHeader from "../../common/SectionHeader";
import { Grid } from "@mui/material";
import SpeakersCarousel from "./SpeakersCarousel";

const styles = {
   section: (theme) => ({
      paddingBottom: "20px",
      [theme.breakpoints.down("md")]: {
         paddingTop: "400px",
      },
   }),
};

const SpeakersSection = (props) => {
   return (
      <Section
         sx={styles.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            {props.title && (
               <SectionHeader
                  color={props.color}
                  title={props.title}
                  subtitle={props.subtitle}
               />
            )}
            <Grid container justifyContent="center">
               <Grid item xs={12} md={12}>
                  <SpeakersCarousel speakers={props.speakers} />
               </Grid>
            </Grid>
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
