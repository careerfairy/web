import PropTypes from "prop-types";
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";

const styles = {
   section: {
      height: {
         sm: "100%",
         lg: "100vh",
      },
      display: "flex",
      alignItems: "center",
   },
   container: {
      paddingTop: (theme) => theme.spacing(2),
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   title: {
      fontWeight: 500,
   },
   bodyText: {
      color: (theme) => theme.palette.common.white,
      opacity: 0.9,
      fontSize: {
         md: '1.5rem',
         lg: '2rem'
      }
   },
};

const HeroSection = (props) => {
   return (
      <Section
         big
         color={props.color}
         sx={styles.section}
         backgroundImage={props.backgroundImage}
         backgroundImagePosition={props.backgroundImagePosition}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Container sx={styles.container}>
            <SectionHeader
               color={props.color}
               title={props.title}
               titleSx={styles.title}
               subTitleVariant="h5"
               titleVariant="h3"
               subtitle={props.subtitle}
            />
            <Box marginTop={3}>
               <Typography align="center" variant="h6" sx={styles.bodyText}>
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
