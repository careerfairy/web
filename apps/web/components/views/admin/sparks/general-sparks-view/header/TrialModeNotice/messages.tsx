import { Typography, TypographyProps } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
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
      fontSize: "1.428rem",
      fontWeight: 600,
      lineHeight: "30px",
   },
})

export const CreationPeriodMessage = () => {
   return (
      <MessageText>
         Get your content ready during our exclusive period and start your trial
         right away.
         <br />
         Use our content creation period to organise and film your videos. Once
         satisfied, start your trial seamlessly without any delays.
      </MessageText>
   )
}

export const CreationPeriodAboutToExpireMessage = () => {
   const { groupPresenter } = useGroup()

   const contentCreationDaysLeft =
      groupPresenter.getTrialPlanCreationPeriodLeft()

   const planDaysLeft = groupPresenter.getPlanDaysLeft()

   const expirationDate = DateUtil.formatDateToDayMonthYear(
      groupPresenter.plan.expiresAt
   )

   return (
      <MessageText>
         The content creation period is about to expire. If you don’t publish
         your Sparks within the next{" "}
         <MessageText color="error.main">{contentCreationDaysLeft}</MessageText>{" "}
         days, your videos will be available to our talent community for a
         shorter period.
         <br />
         As a reminder your trial will end in {planDaysLeft} days on{" "}
         {expirationDate}.
      </MessageText>
   )
}

export const CreationPeriodExpiredMessage = () => {
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
         <br />
         Your free trial ends in {planDaysLeft} days on {expirationDate}.
      </MessageText>
   )
}

const MessageText = ({ children, ...props }: TypographyProps) => {
   return (
      <Typography sx={styles.message} component="span" {...props}>
         {children}
      </Typography>
   )
}
