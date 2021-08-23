import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import landingUniversities from "../../../../constants/landingUniversities";
import SectionContainer from "../../common/Section/Container";
import Logo from "../common/Logo";
import LogosComponent from "../common/LogosComponent";

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
}));

const UniversitySection = (props) => {
   const classes = useStyles();

   return (
      <Section
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
               subTitleClassName={classes.subTitle}
               title={props.title}
               subtitle={props.subtitle}
            />
            <LogosComponent>
               {landingUniversities.map(({ name, imageUrlMain, website }) => (
                  <Logo
                     key={name}
                     alt={name}
                     logoUrl={imageUrlMain}
                     websiteUrl={website}
                     withZoom
                  />
               ))}
            </LogosComponent>
         </SectionContainer>
      </Section>
   );
};

export default UniversitySection;

UniversitySection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
