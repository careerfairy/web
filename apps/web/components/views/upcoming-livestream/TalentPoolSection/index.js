import PropTypes from "prop-types"
import React, { memo, useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import HighlightText from "components/views/common/HighlightText"
import SectionHeader from "../../common/SectionHeader"
import Box from "@mui/material/Box"
import Fade from "@stahl.luke/react-reveal/Fade"
import {
   Button,
   CircularProgress,
   Grid,
   Hidden,
   Typography,
} from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded"
import UserUtil from "../../../../data/util/UserUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { useRouter } from "next/router"
import { connectedIcon } from "../../../../constants/svgs"

const styles = {
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
      textAlign: "left",
   },
   whiteBtn: {
      borderColor: (theme) => theme.palette.common.white,
      color: (theme) => theme.palette.common.white,
   },
   imgGrid: {
      overflow: "hidden",
   },
   imgWrapper: {
      width: "100%",
      height: "350px",
      position: "relative",
      "& img": {
         position: "absolute",
         objectFit: "contain",
         maxWidth: "100%",
         maxHeight: "100%",
         transform: "translate(-50%, -50%)",
         top: "50%",
         left: "50%",
         padding: (theme) => theme.spacing(2),
      },
   },
   details: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
}

const TalentPoolSection = memo((props) => {
   const theme = useTheme()

   const { joinCompanyTalentPool, leaveCompanyTalentPool } =
      useFirebaseService()
   const { push, replace, asPath } = useRouter()
   const { userData, authenticatedUser, isLoggedOut } = useAuth()
   const [joiningTalentPool, setJoiningTalentPool] = useState(false)
   const [leavingTalentPool, setLeavingTalentPool] = useState(false)
   const [userIsInTalentPool, setUserIsInTalentPool] = useState(false)

   const color = userIsInTalentPool
      ? theme.palette.common.white
      : theme.palette.common.black

   const title = userIsInTalentPool
      ? "You are part of the talent pool"
      : "Join the Talent Pool and Get Hired"

   const backgroundColor = userIsInTalentPool
      ? theme.palette.primary.main
      : theme.palette.common.white

   useEffect(() => {
      setUserIsInTalentPool(
         Boolean(
            props.stream &&
               userData?.talentPools?.includes(props.stream?.companyId)
         )
      )
   }, [props.stream, userData])

   const joinTalentPool = async () => {
      if (isLoggedOut || !authenticatedUser.emailVerified) {
         return replace({
            pathname: `/signup`,
            query: { absolutePath: asPath },
         })
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push({
            pathname: `/profile`,
            query: { absolutePath: asPath },
         })
      }
      if (!props.registered) {
         return props.handleOpenJoinModal()
      }
      try {
         setJoiningTalentPool(true)

         await joinCompanyTalentPool(
            props.stream.companyId,
            userData,
            props.stream
         )
      } catch (e) {}
      setJoiningTalentPool(false)
   }

   const leaveTalentPool = async () => {
      if (!authenticatedUser || !authenticatedUser.emailVerified) {
         return replace({
            pathname: `/signup`,
            query: { absolutePath: asPath },
         })
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push({
            pathname: `/profile`,
            query: { absolutePath: asPath },
         })
      }

      try {
         setLeavingTalentPool(true)
         await leaveCompanyTalentPool(
            props.stream.companyId,
            userData,
            props.stream
         )
      } catch (e) {}
      setLeavingTalentPool(false)
   }
   return (
      <Section
         big={props.big}
         color={color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth="lg">
            {props.overheadText && (
               <Fade bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}

            <Grid spacing={2} container>
               <Grid sx={styles.details} item xs={12} md={6}>
                  {title && (
                     <Fade bottom>
                        <SectionHeader
                           color={color}
                           sx={styles.header}
                           title={title}
                           subtitle={props.subtitle}
                           titleSx={styles.title}
                        />
                     </Fade>
                  )}
                  <Box width="100%">
                     <Fade bottom>
                        <Box>
                           <Typography sx={{ color }} variant="body1">
                              We want to make it easy for students and young
                              pros to find the right company for them. To help
                              you let companies know that you're interested in
                              potentially joining - now or in the future -,
                              we've invented the Talent Pool. By joining its
                              talent pool, the company can contact you at any
                              time with a relevant opportunity.
                           </Typography>
                        </Box>
                        <Box
                           marginTop={2}
                           display="flex"
                           justifyContent="flex-start"
                        >
                           <Button
                              size="large"
                              style={{ width: 300 }}
                              sx={[userIsInTalentPool && styles.whiteBtn]}
                              fullWidth
                              disabled={joiningTalentPool || leavingTalentPool}
                              variant={
                                 userIsInTalentPool ? "outlined" : "contained"
                              }
                              startIcon={
                                 joiningTalentPool || leavingTalentPool ? (
                                    <CircularProgress
                                       size={10}
                                       color="inherit"
                                    />
                                 ) : userIsInTalentPool ? (
                                    <ClearIcon />
                                 ) : (
                                    <HowToRegRoundedIcon />
                                 )
                              }
                              onClick={
                                 userIsInTalentPool
                                    ? () => leaveTalentPool()
                                    : () => joinTalentPool()
                              }
                              color={userIsInTalentPool ? "grey" : "primary"}
                           >
                              {joiningTalentPool
                                 ? "Joining Talent Pool"
                                 : leavingTalentPool
                                 ? "Leaving Talent Pool"
                                 : userIsInTalentPool
                                 ? "Leave Talent Pool"
                                 : "Join Talent Pool"}
                           </Button>
                        </Box>
                     </Fade>
                  </Box>
               </Grid>
               <Hidden mdDown>
                  <Grid sx={styles.imgGrid} item xs={12} md={6}>
                     <Fade right>
                        <Box sx={styles.imgWrapper}>
                           <img
                              src={connectedIcon}
                              alt="talent pool illustration"
                           />
                        </Box>
                     </Fade>
                  </Grid>
               </Hidden>
            </Grid>
         </SectionContainer>
      </Section>
   )
})

export default TalentPoolSection

TalentPoolSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
}
