import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "../../common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import FollowCompaniesPrompt from "./FollowCompaniesPrompt";
import FeaturedCompanies from "./FeaturedCompanies";

const useStyles = makeStyles((theme) => ({
   section: {},
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
}));

const FollowCompaniesSection = (props) => {
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
               title={props.title}
               subtitle={props.subtitle}
            />
            <FeaturedCompanies />
            <FollowCompaniesPrompt />
         </SectionContainer>
      </Section>
   );
};

export default FollowCompaniesSection;

FollowCompaniesSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
