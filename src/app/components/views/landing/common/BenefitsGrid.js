import React from "react";
import { Grid } from "@material-ui/core";
import MuiGridFade from "materialUI/animations/MuiGridFade";
import BenefitCard from "./BenefitCard";

const BenefitsGrid = ({
   benefits,
   primaryGradientEnd,
   primaryGradientStart,
   secondaryGradientStart,
   secondaryGradientEnd,
}) => {
   return (
      <Grid justifyContent="space-around" container spacing={5}>
         {benefits.map((props, index) => (
            <Grid item xs={12} sm={6} md={3} key={props.name}>
               <MuiGridFade index={index} up>
                  <BenefitCard
                     {...props}
                     primaryGradientEnd={primaryGradientEnd}
                     primaryGradientStart={primaryGradientStart}
                     secondaryGradientStart={secondaryGradientStart}
                     secondaryGradientEnd={secondaryGradientEnd}
                  />
               </MuiGridFade>
            </Grid>
         ))}
      </Grid>
   );
};

export default BenefitsGrid;
