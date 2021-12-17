import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "components/views/common/HighlightText";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import Fade from "react-reveal/Fade";
import { Button } from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";

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
   talentPoolText: {
      color: ({ color }) => color,
   },
   whiteBtn: {
      borderColor: theme.palette.common.white,
      color: theme.palette.common.white,
   },
}));

const ContactSection = (props) => {
   const classes = useStyles({ color: props.color });

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
            {props.overheadText && (
               <Fade bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}
            {(props.title || props.subtitle) && (
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
                  <Box marginTop={2} display="flex" justifyContent="center">
                     <a
                        className="aboutContentContactButton"
                        href="mailto:thomas@careerfairy.io"
                     >
                        <Button
                           size="large"
                           children="Contact CareerFairy"
                           startIcon={<EmailIcon />}
                           variant="outlined"
                        />
                     </a>
                  </Box>
               </Fade>
            </Box>
         </SectionContainer>
      </Section>
   );
};

export default ContactSection;

ContactSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
