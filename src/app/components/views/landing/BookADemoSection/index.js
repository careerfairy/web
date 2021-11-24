import PropTypes from "prop-types";
import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import RoundButton from "materialUI/GlobalButtons/RoundButton";
import Link from "materialUI/NextNavLink";
import SectionContainer from "../../common/Section/Container";
import Pulse from "react-reveal/Pulse";
import { Box } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   section: {
      height: "60vh",
      display: "flex",

      alignItems: "center",
      borderTop: ({ dividerColor }) =>
         dividerColor && `2px solid ${alpha(dividerColor, 0.5)}`,
      borderBottom: ({ dividerColor }) =>
         dividerColor && `2px solid ${alpha(dividerColor, 0.5)}`,
   },
   bookingButton: {
      margin: theme.spacing(1),
   },
   bookingWhite: {
      background: theme.palette.common.white,
      color: theme.palette.secondary.main,
      "&:hover": {
         color: theme.palette.common.white,
      },
   },
   goToNextLivestreamsBtn: {
      margin: theme.spacing(2),
      textDecoration: "none !important",
   },
   bookADemoHeader: {
      marginBottom: [theme.spacing(2), "!important"],
   },
   title: {
      fontWeight: 600,
   },
}));

const BookADemoSection = (props) => {
   const classes = useStyles({ dividerColor: props.dividerColor });
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
               titleClassName={classes.title}
               subtitle={props.subtitle}
            />
            <Pulse forever>
               <Box
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
               >
                  {props.goToNextLivestreams ? (
                     <RoundButton
                        className={classes.goToNextLivestreamsBtn}
                        color="secondary"
                        size="large"
                        variant="contained"
                        component={Link}
                        href="/next-livestreams"
                     >
                        Register now
                     </RoundButton>
                  ) : (
                     <RoundButton
                        className={clsx(
                           classes.bookingButton,
                           props.bookingWhite && classes.bookingWhite
                        )}
                        color="secondary"
                        size="large"
                        variant="contained"
                        onClick={props.handleOpenCalendly}
                     >
                        Book a Demo
                     </RoundButton>
                  )}
               </Box>
            </Pulse>
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
   title: PropTypes.any,
};
