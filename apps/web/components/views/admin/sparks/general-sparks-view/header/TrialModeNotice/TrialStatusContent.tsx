import { Fragment } from "react"
import { Box, Typography } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { sxStyles } from "types/commonTypes"
import Message from "./Message"
import Progress from "./Progress"
import UpgradePlanButton from "components/views/checkout/forms/UpgradePlanButton"
import { Star } from "react-feather"
import ConditionalWrapper from "components/util/ConditionalWrapper"

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

   const planExpired = groupPresenter.hasPlanExpired()
   const trialBarCritical =
      trialAboutToExpire ||
      failedToMakeEnoughInContentCreationPeriod ||
      planExpired

   return (
      <Fragment>
         <ConditionalWrapper
            condition={!planExpired}
            fallback={<PlanEndStatusTitle title="Spark it up! Upgrade now." />}
         >
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
         </ConditionalWrapper>
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
         <Box>
            <UpgradePlanButton
               text="Upgrade now"
               icon={<Star strokeWidth={3} />}
            />
         </Box>
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

type PlanEndProps = {
   title: string
}

const PlanEndStatusTitle = (props: PlanEndProps) => {
   return <Typography sx={styles.title}>{props.title}</Typography>
}
export default TrialStatusContent
