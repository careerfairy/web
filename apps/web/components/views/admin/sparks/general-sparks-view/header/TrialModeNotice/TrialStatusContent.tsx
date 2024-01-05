import { Fragment } from "react"
import { Box, Typography } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { sxStyles } from "types/commonTypes"
import Message from "./Message"
import Progress from "./Progress"

const styles = sxStyles({
   progressSection: {
      display: "flex",
      flexWrap: "nowrap",
      py: 2.5,
   },
   contentCreationBar: {
      width: "35%",
   },
   trialBar: {
      width: "65%",
   },
   title: {
      fontSize: "1.428rem",
      fontWeight: 600,
      lineHeight: "30px",
   },
   divider: {
      width: "2px",
      height: "100%",
   },
   error: {
      color: "error.main",
   },
})

const TrialStatusContent = () => {
   const { groupPresenter } = useGroup()

   const contentCreationProgress =
      groupPresenter.getTrialContentCreationProgress()

   const remainderProgressAfterContentCreation =
      groupPresenter.getProgressAfterContentCreation()

   const isInContentCreationPeriod =
      groupPresenter.getIsInContentCreationPeriod()

   const remainingDaysLeftForPlan = groupPresenter.getPlanDaysLeft()

   const remainingDaysLeftForContentCreation =
      groupPresenter.getRemainingDaysLeftForContentCreation()

   const trialAboutToExpire = groupPresenter.getTrialAboutToExpire()

   const contentCreationAboutToExpire =
      groupPresenter.getContentCreationAboutToExpire()

   const failedToMakeEnoughInContentCreationPeriod = Boolean(
      !isInContentCreationPeriod && !groupPresenter.publicSparks
   )

   const contentCreationBarCritical =
      contentCreationAboutToExpire || failedToMakeEnoughInContentCreationPeriod

   const trialBarCritical =
      trialAboutToExpire || failedToMakeEnoughInContentCreationPeriod

   if (groupPresenter.hasPlanExpired()) {
      return (
         <Typography sx={styles.title}>
            Your trial has expired. Please contact your key success manager to
            unlock the full power of Sparks.
         </Typography>
      )
   }

   return (
      <Fragment>
         {isInContentCreationPeriod && !groupPresenter.publicSparks ? (
            <StatusTitle
               title="on content creation period"
               daysLeft={remainingDaysLeftForContentCreation}
               critical={contentCreationAboutToExpire}
            />
         ) : (
            <StatusTitle
               title="on your trial"
               daysLeft={remainingDaysLeftForPlan}
               critical={trialAboutToExpire}
            />
         )}
         <Box sx={styles.progressSection}>
            <Progress
               sx={styles.contentCreationBar}
               critical={contentCreationBarCritical}
               value={contentCreationProgress}
            />
            <Divider />
            <Progress
               sx={styles.trialBar}
               value={remainderProgressAfterContentCreation}
               critical={trialBarCritical}
            />
         </Box>
         <Message
            isInContentCreationPeriod={isInContentCreationPeriod}
            contentCreationAboutToExpire={contentCreationAboutToExpire}
            trialAboutToExpire={trialAboutToExpire}
            metPublishingCriteria={groupPresenter.publicSparks}
         />
      </Fragment>
   )
}

const Divider = () => {
   return <Box sx={styles.divider} />
}

type MessageProps = {
   title: string
   daysLeft: number
   critical?: boolean
}

const StatusTitle = (props: MessageProps) => {
   return (
      <Typography sx={styles.title}>
         <Typography
            component="span"
            sx={[styles.title, props.critical && styles.error]}
         >
            {props.daysLeft} days left{" "}
         </Typography>
         {props.title}
      </Typography>
   )
}

export default TrialStatusContent
