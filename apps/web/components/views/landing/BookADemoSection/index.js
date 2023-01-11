import PropTypes from "prop-types"
import React from "react"
import { alpha } from "@mui/material/styles"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import RoundButton from "materialUI/GlobalButtons/RoundButton"
import Link from "materialUI/NextNavLink"
import SectionContainer from "../../common/Section/Container"
import Pulse from "@stahl.luke/react-reveal/Pulse"
import { Box } from "@mui/material"
import { hubSpotFunnelLink } from "../../../../constants/links"

const styles = {
   section: (theme, { dividerColor }) => ({
      height: "60vh",
      display: "flex",

      alignItems: "center",
      borderTop: dividerColor && `2px solid ${alpha(dividerColor, 0.5)}`,
      borderBottom: dividerColor && `2px solid ${alpha(dividerColor, 0.5)}`,
   }),
   bookingButton: {
      margin: (theme) => theme.spacing(1),
   },
   bookingWhite: {
      background: (theme) => theme.palette.common.white,
      color: (theme) => theme.palette.secondary.main,
      "&:hover": {
         color: (theme) => theme.palette.common.white,
      },
   },
   linkBtn: {
      textDecoration: "none !important",
   },
   goToBtn: {
      margin: (theme) => theme.spacing(2),
   },
   bookADemoHeader: {
      marginBottom: (theme) => [theme.spacing(2), "!important"],
   },
   title: {
      fontWeight: 600,
   },
}

const BookADemoSection = (props) => {
   return (
      <Section
         sx={(theme) =>
            styles.section(theme, { dividerColor: props.dividerColor })
         }
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
               sx={styles.bookADemoHeader}
               title={props.title}
               titleSx={styles.title}
               subtitle={props.subtitle}
            />
            <Pulse forever>
               <Box
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
               >
                  {props.goTo ? (
                     <RoundButton
                        sx={{ ...styles.goToBtn, ...styles.linkBtn }}
                        color="secondary"
                        size="large"
                        variant="contained"
                        component={Link}
                        href={props.goTo}
                     >
                        Register for free
                     </RoundButton>
                  ) : (
                     <RoundButton
                        sx={{
                           ...styles.bookingButton,
                           ...(props.bookingWhite && styles.bookingWhite),
                           ...styles.linkBtn,
                        }}
                        color="secondary"
                        size="large"
                        target="_blank"
                        href={hubSpotFunnelLink}
                        variant="contained"
                     >
                        Book a Demo
                     </RoundButton>
                  )}
               </Box>
            </Pulse>
         </SectionContainer>
      </Section>
   )
}

export default BookADemoSection

BookADemoSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
