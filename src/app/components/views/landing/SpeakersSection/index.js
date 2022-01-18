import PropTypes from "prop-types";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import SectionHeader from "../../common/SectionHeader";
import { Grid } from "@mui/material";
import SpeakersCarousel from "./SpeakersCarousel";

const useStyles = makeStyles((theme) => ({
   section: {
      paddingBottom: 20,
      [theme.breakpoints.down('md')]: {
         paddingTop: 40,
      },
      // paddingTop: 0
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {
      fontSize: "4.5rem",
      fontWeight: 500,
      [theme.breakpoints.down('sm')]: {
         fontSize: "3.5rem",
      },
   },
}));

const SpeakersSection = (props) => {
   const classes = useStyles();

   return (
      <Section
         className={classes.section}
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
