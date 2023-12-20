import { Typography, TypographyProps } from "@mui/material"
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
         Get your content ready during our exclusive period and start your trial
         right away.
         <DoubleBreak />
         Use our content creation period to organise and film your videos. Once
         satisfied, start your trial seamlessly without any delays.
      </MessageText>
   )
}

const CreationPeriodAboutToExpireMessage = () => {
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

const CreationPeriodExpiredMessage = () => {
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

const PlanDefaultMessage = () => {
   const { groupPresenter } = useGroup()

   const planDaysLeft = groupPresenter.getPlanDaysLeft()

   const expirationDate = DateUtil.formatDateToDayMonthYear(
      groupPresenter.plan.expiresAt
   )

   return (
      <MessageText>
         Your free trial ends in {planDaysLeft} days on {expirationDate}.
         <DoubleBreak />
         Elevate your success with Sparks. Access comprehensive analytics,
         create more engaging content, and attract the right talent all year
         round. Talk to your key success manager to unlock the full power of
         Sparks.
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
   contentCreationPeriodExpired: boolean
   contentCreationAboutToExpire: boolean
}

const Message = ({
   contentCreationPeriodExpired,
   contentCreationAboutToExpire,
}: MessageComponentProps) => {
   if (!contentCreationPeriodExpired && contentCreationAboutToExpire) {
      return <CreationPeriodAboutToExpireMessage />
   }
   if (contentCreationPeriodExpired) {
      return <CreationPeriodExpiredMessage />
   }
   if (!contentCreationPeriodExpired && !contentCreationAboutToExpire) {
      return <CreationPeriodMessage />
   }
   return <PlanDefaultMessage />
}

export default Message
