import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "../common/HighlightText";
import landingCompanies from "../../../../constants/landingCompanies";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   section: {
      paddingBottom: 0,
   },
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   title: {
      fontSize: "4.5rem",
      fontWeight: 500,
      [theme.breakpoints.down("xs")]: {
         fontSize: "3.5rem",
      },
   },
   imagesWrapper: {
      display: "flex",
      flexWrap: "wrap",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing(2),
   },
   companyLogo: {
      filter:
         "invert(55%) sepia(0%) saturate(1465%) hue-rotate(134deg) brightness(94%) contrast(84%) grayscale(100%)",
      width: "auto",
      height: 33,
      margin: theme.spacing(2),
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.short,
         easing: theme.transitions.easing.easeInOut,
      }),
      "&:hover": {
         transform: "scale(1.1) rotate(1deg)",
      },
   },
}));

const CompaniesSection = (props) => {
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
            <HighlightText text={"Over 200+ happy customers"} />
            <div className={classes.imagesWrapper}>
               {landingCompanies.map(
                  ({ name, imageUrlDark, imageUrlMain, website }) => (
                     <img
                        key={name}
                        className={classes.companyLogo}
                        src={getResizedUrl(imageUrlMain, "xs")}
                        alt={name}
                     />
                  )
               )}
            </div>
         </SectionContainer>
      </Section>
   );
};

export default CompaniesSection;

CompaniesSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
