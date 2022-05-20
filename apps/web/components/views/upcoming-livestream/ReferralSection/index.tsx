import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import Fade from "@stahl.luke/react-reveal/Fade"
import Referral from "./Referral"

const styles = {
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
}

const ReferralSection = (props) => {
   return (
      <Section
         big={props.big}
         // @ts-ignore
         sectionId={props.sectionId}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            <Fade fraction={props.forceReveal ? 0 : 0.2} bottom>
               <Referral event={props.event} />
            </Fade>
         </SectionContainer>
      </Section>
   )
}

export default ReferralSection

ReferralSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
