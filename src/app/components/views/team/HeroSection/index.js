import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Container, Typography } from "@material-ui/core";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";

const useStyles = makeStyles((theme) => ({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   title: {
      fontWeight: 500,
   },
   subTitle: {},
   bodyText: {
      color: theme.palette.common.white,
      opacity: 0.9,
   },
}));

const HeroSection = (props) => {
   const classes = useStyles();

   return (
      <Section
         big
         color={props.color}
         backgroundImage={props.backgroundImage}
         backgroundImagePosition={props.backgroundImagePosition}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Container className={classes.container}>
            <SectionHeader
               color={props.color}
               title={props.title}
               titleClassName={classes.title}
               subTitleClassName={classes.subTitle}
               subTitleVariant="h5"
               titleVariant="h3"
               subtitle={props.subtitle}
            />
            <Box marginTop={3}>
               <Typography
                  align="center"
                  variant="h6"
                  className={classes.bodyText}
               >
                  {props.bodyText}
               </Typography>
            </Box>
         </Container>
      </Section>
   );
};

HeroSection.propTypes = {
   backgroundColor: PropTypes.string,
   backgroundImage: PropTypes.string,
   backgroundImageOpacity: PropTypes.number,
   color: PropTypes.string,
   subtitle: PropTypes.string,
   title: PropTypes.string,
};
export default HeroSection;
