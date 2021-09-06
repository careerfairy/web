import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "../../common/Section";
import { Container } from "@material-ui/core";
import SectionHeader from "../../common/SectionHeader";
import StreamsTab from "../StreamsTab";

const useStyles = makeStyles((theme) => ({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   section: {
      paddingBottom: theme.spacing(1),
   },
}));

const NextLivestreamsBannerSection = (props) => {
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
         <Container className={classes.container}>
            <SectionHeader
               color={props.color}
               title={props.title}
               subtitle={props.subtitle}
            />
            <StreamsTab handleChange={props.handleChange} value={props.value} />
         </Container>
      </Section>
   );
};

export default NextLivestreamsBannerSection;

NextLivestreamsBannerSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   handleChange: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
   value: PropTypes.string.isRequired,
};
