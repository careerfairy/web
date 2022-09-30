import PropTypes from "prop-types"
import React from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import NumbersCard from "./NumbersCard"
import { Box, Grid } from "@mui/material"
import MuiGridFade from "materialUI/animations/MuiGridFade"

const NumbersSection = (props) => {
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
            <Box display="flex" width="100%">
               <Grid container justifyContent="space-around" spacing={5}>
                  {props.numbersData.map((data, index) => (
                     <Grid item xs={12} sm={6} md={4} key={data.id}>
                        <MuiGridFade index={index} up>
                           <NumbersCard {...data} />
                        </MuiGridFade>
                     </Grid>
                  ))}
               </Grid>
            </Box>
         </SectionContainer>
      </Section>
   )
}

export default NumbersSection

NumbersSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
