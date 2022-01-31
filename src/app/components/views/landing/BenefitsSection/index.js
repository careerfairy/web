import PropTypes from "prop-types";
import React from "react";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import BenefitsGrid from "../../common/BenefitsGrid";

const BenefitsSection = (props) => {
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
            <BenefitsGrid benefits={props.benefits} />
         </SectionContainer>
      </Section>
   );
};

export default BenefitsSection;

BenefitsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
