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

const useStyles = makeStyles((theme) => ({
   subTitle: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
   },
   benefitsWrapper: {},
   title: {
      fontSize: "4.5rem",
      fontWeight: 500,
      [theme.breakpoints.down("xs")]: {
         fontSize: "3.5rem",
      },
   },
}));

const benefitsData = [
   {
      name: "Engage",
      description: "An engaging platform to brand yourself as a company",
      imageUrl: engageShape,
   },
   {
      name: "Reach",
      description:
         "Reach more talents through CareerFairy and through CareerFairy's network of schools",
      imageUrl: reachShape,
   },
   {
      name: "Measure",
      description:
         "Measure and demonstrate the results of your events with detailed analytics",
      imageUrl: measureShape,
   },
];

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
               titleClassName={classes.title}
               subTitleClassName={classes.subTitle}
               title={props.title}
               subtitle={props.subtitle}
            />
            <Grid
               justify="space-around"
               container
               spacing={2}
               className={classes.benefitsWrapper}
            >
               {benefitsData.map(({ name, imageUrl, description }) => (
                  <Grid item xs={12} sm={6} md={3} key={name}>
                     <BenefitCard
                        name={name}
                        imageUrl={imageUrl}
                        description={description}
                     />
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
