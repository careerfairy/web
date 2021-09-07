import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionHeader from "components/views/common/SectionHeader";
import SectionContainer from "../../common/Section/Container";
import {
   engageShape,
   measureShape,
   reachShape,
} from "../../../../constants/images";
import BenefitCard from "./BenefitCard";
import { Grid } from "@material-ui/core";
import MuiGridFade from "../../../../materialUI/animations/MuiGridFade";

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   benefitsWrapper: {},
   // title: {
   //    fontSize: "4.5rem",
   //    fontWeight: 500,
   //    [theme.breakpoints.down("xs")]: {
   //       fontSize: "3.5rem",
   //    },
   // },
}));

const BenefitsSection = (props) => {
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
               // titleClassName={classes.title}
               subTitleClassName={classes.subTitle}
               title={props.title}
               subtitle={props.subtitle}
            />
            <Grid
               justifyContent="space-around"
               container
               spacing={5}
               className={classes.benefitsWrapper}
            >
               {props.benefits.map(({ name, imageUrl, description }, index) => (
                  <Grid item xs={12} sm={6} md={3} key={name}>
                     <MuiGridFade index={index} up>
                        <BenefitCard
                           name={name}
                           imageUrl={imageUrl}
                           description={description}
                        />
                     </MuiGridFade>
                  </Grid>
               ))}
            </Grid>
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
