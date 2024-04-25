import { Typography, TypographyProps } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   error: {
      color: "error.main",
   },
   warning: {
      color: "warning.main",
   },
   message: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "24px",
   },
})

const CreationPeriodMessage = () => {
   return (
      <MessageText>
         Get your content ready during our exclusive content creation period and
         start your trial right away.
         <DoubleBreak />
         Use our content creation period to organise and film your videos. Once
         satisfied, start your trial seamlessly without any delays.
      </MessageText>
   )
}

const CreationPeriodEndingMessage = () => {
   const { groupPresenter } = useGroup()

   const contentCreationDaysLeft =
      groupPresenter.getRemainingDaysLeftForContentCreation()

   const planDaysLeft = groupPresenter.getPlanDaysLeft()

   const expirationDate = DateUtil.formatDateToDayMonthYear(
      groupPresenter.plan.expiresAt
   )

   return (
      <MessageText>
         The content creation period is about to expire. If you don&apos;t
         publish your Sparks within the{" "}
         <MessageText color="error.main">
            next {contentCreationDaysLeft} days
         </MessageText>
         , your videos will be available to our talent community for a shorter
         period.
         <DoubleBreak />
         As a reminder your trial will end in {planDaysLeft} days on{" "}
         {expirationDate}.
      </MessageText>
   )
}

const TrialPeriodNotMetCriteriaMessage = () => {
   const { groupPresenter } = useGroup()

   const planDaysLeft = groupPresenter.getPlanDaysLeft()

   const expirationDate = DateUtil.formatDateToDayMonthYear(
      groupPresenter.plan.expiresAt
   )

   return (
      <MessageText>
         Hurry up! The content creation period has expired and your trial has
         already started. You can still upload your videos, but the longer you
         wait the less time your Sparks will be available to our talent
         community.
         <DoubleBreak />
         Your free trial ends in {planDaysLeft} days on {expirationDate}.
      </MessageText>
   )
}

const TrialEndingMessage = () => {
   const { groupPresenter } = useGroup()

   const planDaysLeft = groupPresenter.getPlanDaysLeft()

   const expirationDate = DateUtil.formatDateToDayMonthYear(
      groupPresenter.plan.expiresAt
   )
   const trialEnded =
      groupPresenter.isTrialPlan() && groupPresenter.hasPlanExpired()

   return (
      <ConditionalWrapper
         condition={!trialEnded}
         fallback={<TrialEndedMessage expirationDate={expirationDate} />}
      >
         <MessageText>
            Your free trial ends in {planDaysLeft} days on {expirationDate}.
            <DoubleBreak />
            Elevate your success with Sparks. Access comprehensive analytics,
            create more engaging content, and attract the right talent all year
            round. Talk to your Success Manager to unlock the full power of
            Sparks.
         </MessageText>
      </ConditionalWrapper>
   )
}

type TrialEndedMessageProps = {
   expirationDate: string
}
const TrialEndedMessage = ({ expirationDate }: TrialEndedMessageProps) => {
   return (
      <MessageText>
         Your Sparks trial ended on {expirationDate}, and your Sparks are
         currently unavailable. Upgrade now to reactivate them, gain in-depth
         analytics, create more engaging content, and attract top talent all
         year round!
      </MessageText>
   )
}

const DoubleBreak = () => {
   return (
      <Fragment>
         <br />
         <br />
      </Fragment>
   )
}

const MessageText = ({ children, ...props }: TypographyProps) => {
   return (
      <Typography sx={styles.message} component="span" {...props}>
         {children}
      </Typography>
   )
}

type MessageComponentProps = {
   isInContentCreationPeriod: boolean
   metPublishingCriteria: boolean
   contentCreationAboutToExpire: boolean
   trialAboutToExpire: boolean
}

const Message = ({
   isInContentCreationPeriod,
   contentCreationAboutToExpire,
   metPublishingCriteria,
   trialAboutToExpire,
}: MessageComponentProps) => {
   // #1 - Creation period & not yet met the publishing criteria
   if (
      isInContentCreationPeriod &&
      !metPublishingCriteria &&
      !contentCreationAboutToExpire
   ) {
      return <CreationPeriodMessage />
   }

   // #2 - Creation period & not yet met the publishing criteria & <= 3 days left on content creation
   if (
      isInContentCreationPeriod &&
      !metPublishingCriteria &&
      contentCreationAboutToExpire
   ) {
      return <CreationPeriodEndingMessage />
   }

   // #3 - Creation period & already met the publishing criteria
   if (isInContentCreationPeriod && metPublishingCriteria) {
      return <TrialEndingMessage />
   }

   // #4 - Real trial period & not yet met the publishing criteria
   if (!isInContentCreationPeriod && !metPublishingCriteria) {
      return <TrialPeriodNotMetCriteriaMessage />
   }

   // #5 - Real trial period & met the publishing criteria & > 14 days left
   // TODO: Needs stripe integration from product fallback to #6 component
   if (
      !isInContentCreationPeriod &&
      metPublishingCriteria &&
      !trialAboutToExpire
   ) {
      return <TrialEndingMessage />
   }

   // #6 - Real trial period & met the publishing criteria &  <= 14 days left
   if (
      !isInContentCreationPeriod &&
      metPublishingCriteria &&
      trialAboutToExpire
   ) {
      return <TrialEndingMessage />
   }

   return null
}

export default Message
