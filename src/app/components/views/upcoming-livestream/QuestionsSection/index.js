import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "components/views/common/HighlightText";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";
import Fade from "react-reveal/Fade";
import CreateQuestion from "./CreateQuestion";

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

const QuestionsSection = (props) => {
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
            <Fade bottom>
               <Box>
                  <CreateQuestion />
               </Box>
            </Fade>
         </SectionContainer>
      </Section>
   );
};

export default QuestionsSection;

QuestionsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
