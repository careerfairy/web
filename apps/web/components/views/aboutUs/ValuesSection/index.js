import PropTypes from "prop-types"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Box, Container } from "@mui/material"
import Section from "../../common/Section"
import SectionHeader from "../../common/SectionHeader"
import BenefitsGrid from "../../common/BenefitsGrid"

const useStyles = makeStyles((theme) => ({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   title: {
      fontWeight: 500,
   },
   subTitle: {},
   bodyText: {
      color: theme.palette.common.white,
   },
}))

const ValuesSection = (props) => {
   const classes = useStyles()

   return (
      <Section
         color={props.color}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Container className={classes.container}>
            <SectionHeader
               color={props.color}
               title={props.title}
               titleClassName={classes.title}
               subTitleClassName={classes.subTitle}
               subTitleVariant="h5"
               titleVariant="h3"
               subtitle={props.subtitle}
            />
            <Box marginTop={3}>
               <BenefitsGrid benefits={props.valuesData} />
            </Box>
         </Container>
      </Section>
   )
}

ValuesSection.propTypes = {
   backgroundColor: PropTypes.string,
   backgroundImage: PropTypes.string,
   backgroundImageOpacity: PropTypes.number,
   color: PropTypes.string,
   subtitle: PropTypes.string,
   title: PropTypes.string,
   valuesData: PropTypes.array,
}
export default ValuesSection
