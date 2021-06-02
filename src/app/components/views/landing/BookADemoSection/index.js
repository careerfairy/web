import PropTypes from 'prop-types'
import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import RoundButton from "materialUI/GlobalButtons/RoundButton";
import SectionContainer from "../../common/Section/Container";

const useStyles = makeStyles((theme) => ({
   section: {
      height: "100vh",
      display: "flex",
      alignItems:"center"
   },
   bookingButton: {
      background: theme.palette.common.white,
      color: theme.palette.secondary.main,
      "&:hover": {
         color: theme.palette.common.white,
      },
   },
   bookADemoHeader: {
      marginBottom: [theme.spacing(2), "!important"],
   },
}));

const BookADemoSection = (props) => {
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
            <SectionHeader
               color={props.color}
               className={classes.bookADemoHeader}
               title={props.title}
               subtitle={props.subtitle}
            />
            <RoundButton
               className={classes.bookingButton}
               color="secondary"
               variant="contained"
               onClick={props.handleOpenCalendly}
            >
               Book a Demo
            </RoundButton>
         </SectionContainer>
      </Section>
   );
};

export default BookADemoSection;

BookADemoSection.propTypes = {
  backgroundColor: PropTypes.any,
  backgroundImage: PropTypes.any,
  backgroundImageClassName: PropTypes.any,
  backgroundImageOpacity: PropTypes.any,
  big: PropTypes.any,
  color: PropTypes.any,
  handleOpenCalendly: PropTypes.func,
  subtitle: PropTypes.any,
  title: PropTypes.any
}
