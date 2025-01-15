import EmailIcon from "@mui/icons-material/Email"
import { Button } from "@mui/material"
import Box from "@mui/material/Box"
import Fade from "@stahl.luke/react-reveal/Fade"
import HighlightText from "components/views/common/HighlightText"
import Section from "components/views/common/Section"
import PropTypes from "prop-types"
import SectionContainer from "../../common/Section/Container"
import SectionHeader from "../../common/SectionHeader"

const styles = {
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
   whiteBtn: {
      borderColor: (theme) => theme.palette.common.white,
      color: (theme) => theme.palette.common.white,
   },
}

const ContactSection = (props) => {
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
            {Boolean(props.overheadText) && (
               <Fade bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}
            {Boolean(props.title || props.subtitle) && (
               <Fade bottom>
                  <SectionHeader
                     color={props.color}
                     sx={styles.header}
                     title={props.title}
                     subtitle={props.subtitle}
                     titleSx={styles.title}
                  />
               </Fade>
            )}
            <Box width="100%">
               <Fade bottom>
                  <Box marginTop={2} display="flex" justifyContent="center">
                     <a
                        className="aboutContentContactButton"
                        href="mailto:support@careerfairy.io"
                     >
                        <Button
                           size="large"
                           color="grey"
                           startIcon={<EmailIcon />}
                           variant="outlined"
                        >
                           Contact CareerFairy
                        </Button>
                     </a>
                  </Box>
               </Fade>
            </Box>
         </SectionContainer>
      </Section>
   )
}

export default ContactSection

ContactSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
