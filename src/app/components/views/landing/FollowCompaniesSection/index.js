import PropTypes from "prop-types";
import React from "react";
import Section from "components/views/common/Section";
import SectionHeader from "../../common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import FollowCompaniesPrompt from "./FollowCompaniesPrompt";

const FollowCompaniesSection = (props) => {
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
               title={props.title}
               subtitle={props.subtitle}
            />
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
