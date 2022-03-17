import PropTypes from "prop-types"
import React from "react"
import Section from "../../common/Section"
import { Container } from "@mui/material"
import SectionHeader from "../../common/SectionHeader"
import StreamsTab from "../StreamsTab"

const styles = {
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   section: {
      p: [0, "!important"],
   },
   defaultTitle: {
      fontSize: "1.8rem",
      letterSpacing: "8px",
   },
}

const NextLivestreamsBannerSection = (props) => {
   return (
      <Section sx={styles.section} big={props.big} color={props.color}>
         <Container sx={styles.container}>
            <StreamsTab handleChange={props.handleChange} value={props.value} />
         </Container>
      </Section>
   )
}

export default NextLivestreamsBannerSection

NextLivestreamsBannerSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   handleChange: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
   value: PropTypes.string.isRequired,
}
