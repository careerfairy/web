import {
   Box,
   LinearProgress,
   LinearProgressProps,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import StyledToolTip from "materialUI/GlobalTooltips/StyledToolTip"
import { ReactElement } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import Message from "./Message"

const styles = sxStyles({
   tooltip: {
      p: 2.5,
      maxWidth: 456,
   },
   popper: {
      maxWidth: 456,
      width: "100%",
   },
   content: {},
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
   progressBarWrapper: {
      width: "100%",
   },
   progressBar: {
      width: "100%",
      height: 8,
      borderRadius: 5,
      bgcolor: "grey.300",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 5,
      },
   },
   message: {
      fontSize: "1.428rem",
      fontWeight: 600,
      lineHeight: "30px",
   },
   warning: {
      color: "error.main",
   },
   error: {
      color: "error.main",
   },
})

type Props = {
   children: ReactElement
}

const daysLeftToWarnContentCreation = 3
const daysLeftToWarnTrial = 14

const TrialStatusToolTip = ({ children }: Props) => {
   return (
      <>
         <StyledToolTip
            componentsProps={{
               tooltip: { sx: styles.tooltip },
               popper: { sx: styles.popper },
            }}
            open
            title={<Content />}
         >
            {children}
         </StyledToolTip>
      </>
   )
}

const Content = () => {
   const { groupPresenter } = useGroup()

   const contentCreationProgress =
      groupPresenter.getTrialContentCreationProgress()

   const remainderProgress = groupPresenter.getRemainderProgress()

   const contentCreationPeriodEnded =
      groupPresenter.getContentCreationPeriodEnded()

   const remainingDaysLeftForPlan = groupPresenter.getPlanDaysLeft()

   const remainingDaysLeftForContentCreation =
      groupPresenter.getRemainingDaysLeftForContentCreation()

   const shouldWarnTrial = remainingDaysLeftForPlan <= daysLeftToWarnTrial

   const contentCreationAboutToExpire =
      remainingDaysLeftForContentCreation <= daysLeftToWarnContentCreation

   console.log({
      remainingDaysLeftForPlan,
      contentCreationProgress,
      remainderProgress,
      contentCreationPeriodEnded,
   })

   if (groupPresenter.hasPlanExpired()) {
      return (
         <Typography sx={styles.message}>
            Your trial has expired. Please contact your key success manager to
            unlock the full power of Sparks.
         </Typography>
      )
   }

   return (
      <Box sx={styles.content}>
         {contentCreationPeriodEnded ? (
            <StatusTitle
               title="on your trial"
               daysLeft={remainingDaysLeftForPlan}
               shouldWarn={shouldWarnTrial}
            />
         ) : (
            <StatusTitle
               title="on content creation period"
               daysLeft={remainingDaysLeftForContentCreation}
               shouldError={contentCreationAboutToExpire}
            />
         )}
         <Box sx={styles.progressSection}>
            <Progress
               sx={styles.contentCreationBar}
               color={contentCreationAboutToExpire ? "error" : "secondary"}
               value={contentCreationProgress}
            />
            <Divider />
            <Progress
               sx={styles.trialBar}
               color={"secondary"}
               value={remainderProgress}
            />
         </Box>
         <Message
            contentCreationPeriodExpired={contentCreationPeriodEnded}
            contentCreationAboutToExpire={contentCreationAboutToExpire}
         />
      </Box>
   )
}

type ProgressProps = {
   color: LinearProgressProps["color"]
   value: number
   sx?: LinearProgressProps["sx"]
}

const Progress = (props: ProgressProps) => {
   return (
      <Box
         sx={combineStyles(styles.progressBarWrapper, props.sx)}
         component="span"
      >
         <LinearProgress
            sx={styles.progressBar}
            color={props.color}
            variant="determinate"
            value={props.value > 100 ? 100 : props.value}
         />
      </Box>
   )
}

const Divider = () => {
   return (
      <Box
         sx={{
            width: "2px",
            height: "100%",
         }}
      />
   )
}

type MessageProps = {
   title: string
   daysLeft: number
   shouldWarn?: boolean
   shouldError?: boolean
}

const StatusTitle = (props: MessageProps) => {
   return (
      <Typography sx={styles.message}>
         <Typography
            component="span"
            sx={[
               styles.message,
               props.shouldWarn && styles.warning,
               props.shouldError && styles.error,
            ]}
         >
            {props.daysLeft} days left{" "}
         </Typography>
         {props.title}
      </Typography>
   )
}

export default TrialStatusToolTip
