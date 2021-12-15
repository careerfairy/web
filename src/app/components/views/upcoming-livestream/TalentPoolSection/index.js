import PropTypes from "prop-types";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import HighlightText from "components/views/common/HighlightText";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import Fade from "react-reveal/Fade";
import { Button, CircularProgress, Typography } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import HowToRegRoundedIcon from "@material-ui/icons/HowToRegRounded";
import UserUtil from "../../../../data/util/UserUtil";
import { useAuth } from "../../../../HOCs/AuthProvider";
import { useFirebase } from "../../../../context/firebase";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   section: {},
   subTitle: {},
   header: {
      "&:not(:last-child)": {
         marginBottom: theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
   talentPoolText: {
      color: ({ color }) => color,
   },
   whiteBtn: {
      borderColor: theme.palette.common.white,
      color: theme.palette.common.white,
   },
}));

const TalentPoolSection = (props) => {
   const classes = useStyles({ color: props.color });
   const { joinCompanyTalentPool, leaveCompanyTalentPool } = useFirebase();
   const { push, replace, asPath } = useRouter();
   const { userData, authenticatedUser, isLoggedOut } = useAuth();
   const [joiningTalentPool, setJoiningTalentPool] = useState(false);
   const [leavingTalentPool, setLeavingTalentPool] = useState(false);

   const joinTalentPool = async () => {
      if (isLoggedOut || !authenticatedUser.emailVerified) {
         return replace({
            pathname: `/signup`,
            query: { absolutePath: asPath },
         });
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push({
            pathname: `/profile`,
            query: { absolutePath: asPath },
         });
      }
      try {
         setJoiningTalentPool(true);

         await joinCompanyTalentPool(
            props.stream.companyId,
            userData,
            props.stream.id
         );
      } catch (e) {}
      setJoiningTalentPool(false);
   };

   const leaveTalentPool = async () => {
      if (!authenticatedUser || !authenticatedUser.emailVerified) {
         return replace({
            pathname: `/signup`,
            query: { absolutePath: asPath },
         });
      }

      if (!userData || !UserUtil.userProfileIsComplete(userData)) {
         return push({
            pathname: `/profile`,
            query: { absolutePath: asPath },
         });
      }

      try {
         setLeavingTalentPool(true);
         await leaveCompanyTalentPool(
            props.stream.companyId,
            userData,
            props.stream.id
         );
      } catch (e) {}
      setLeavingTalentPool(false);
   };
   return (
      <Section
         className={classes.section}
         big={props.big}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <SectionContainer>
            {props.overheadText && (
               <Fade bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={props.overheadText} />
                  </Box>
               </Fade>
            )}
            {props.title && (
               <Fade bottom>
                  <SectionHeader
                     color={props.color}
                     className={classes.header}
                     title={props.title}
                     subtitle={props.subtitle}
                     titleClassName={classes.title}
                  />
               </Fade>
            )}
            <Box width="100%">
               <Fade bottom>
                  <Box>
                     <Typography
                        className={classes.talentPoolText}
                        variant="body1"
                     >
                        We want to make it easy for students and young pros to
                        find the right company for them. To help you let
                        companies know that you're interested in potentially
                        joining - now or in the future -, we've invented the
                        Talent Pool. By joining its talent pool, the company can
                        contact you at any time with a relevant opportunity.
                     </Typography>
                  </Box>
                  <Box marginTop={2} display="flex" justifyContent="center">
                     <Button
                        size="large"
                        className={props.userIsInTalentPool && classes.whiteBtn}
                        disabled={joiningTalentPool || leavingTalentPool}
                        variant={
                           props.userIsInTalentPool ? "outlined" : "contained"
                        }
                        startIcon={
                           joiningTalentPool || leavingTalentPool ? (
                              <CircularProgress size={10} color="inherit" />
                           ) : props.userIsInTalentPool ? (
                              <ClearIcon />
                           ) : (
                              <HowToRegRoundedIcon />
                           )
                        }
                        onClick={
                           props.userIsInTalentPool
                              ? () => leaveTalentPool()
                              : () => joinTalentPool()
                        }
                        color={props.userIsInTalentPool ? "default" : "primary"}
                     >
                        {joiningTalentPool
                           ? "Joining Talent Pool"
                           : leavingTalentPool
                           ? "Leaving Talent Pool"
                           : props.userIsInTalentPool
                           ? "Leave Talent Pool"
                           : "Join Talent Pool"}
                     </Button>
                  </Box>
               </Fade>
            </Box>
         </SectionContainer>
      </Section>
   );
};

export default TalentPoolSection;

TalentPoolSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
