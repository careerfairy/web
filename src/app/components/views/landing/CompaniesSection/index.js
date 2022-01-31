import PropTypes from "prop-types";
import React from "react";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "../../common/HighlightText";
import landingCompanies from "../../../../constants/landingCompanies";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import Logo from "../common/Logo";
import LogosComponent from "../common/LogosComponent";
import SectionHeader from "../../common/SectionHeader";

const styles = {
   section: (theme) => ({
      paddingBottom: 20,
      [theme.breakpoints.down("md")]: {
         paddingTop: 40,
      },
   }),
};

const CompaniesSection = (props) => {
   return (
      <Section
         sx={styles.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            {props.title && (
               <SectionHeader
                  color={props.color}
                  title={props.title}
                  subtitle={props.subtitle}
               />
            )}
            {props.overheadText && <HighlightText text={props.overheadText} />}
            <LogosComponent>
               {landingCompanies.map(({ name, imageUrlMain }) => (
                  <Logo
                     key={name}
                     alt={name}
                     logoUrl={getResizedUrl(imageUrlMain, "xs")}
                  />
               ))}
            </LogosComponent>
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
