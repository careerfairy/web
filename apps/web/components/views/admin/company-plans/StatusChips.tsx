import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Chip, Stack } from "@mui/material"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   chip: {
      py: 0.5,
      px: 1.5,
      "& svg": {
         width: 16,
         height: 16,
         color: "inherit !important",
      },
      "& .MuiChip-label": {
         pl: 2,
      },
   },
   expiredChip: {
      color: "#FF4545",
      bgcolor: "#FFE8E8",
      borderColor: "#FFA2A2",
   },
   neutralChip: {
      color: "#9999B1",
      borderColor: "#9999B1",
      bgcolor: "#F6F6FA",
   },
   onTrialChip: {
      color: "primary.600",
      borderColor: "primary.600",
      bgcolor: "#F1FCF9",
   },
   onSparkChip: {
      color: "#6749EA",
      borderColor: "#D1C8F9",
      bgcolor: "#F0EDFD",
   },
})

type Props = {
   presenter: GroupPresenter
}

const StatusChips = ({ presenter }: Props) => {
   const timeLeftInMilliseconds = presenter.getPlanTimeLeft()
   const timeLeft =
      timeLeftInMilliseconds < 0
         ? "0 days left"
         : DateUtil.getHumanReadableTimeFromMilliseconds(timeLeftInMilliseconds)

   if (presenter.hasPlan()) {
      if (presenter.hasPlanExpired()) {
         return (
            <Wrapper>
               <Chip
                  variant="outlined"
                  sx={[styles.chip, styles.expiredChip]}
                  icon={<Clock />}
                  label="Trial expired"
               />
            </Wrapper>
         )
      }

      return (
         <Wrapper>
            {presenter.plan.type === GroupPlanTypes.Trial ? (
               <Chip
                  variant="outlined"
                  sx={[styles.chip, styles.onTrialChip]}
                  icon={<Clock />}
                  label="On trial"
               />
            ) : (
               // Else, it's a sparks plan
               <Chip
                  variant="outlined"
                  sx={[styles.chip, styles.onSparkChip]}
                  icon={<BasicSparkIcon />}
                  label="Sparks plan"
               />
            )}
            <Chip
               variant="filled"
               sx={[styles.chip, styles.neutralChip]}
               icon={<Clock />}
               label={`${timeLeft} left`}
            />
         </Wrapper>
      )
   }

   return (
      <Wrapper>
         <Chip
            variant="filled"
            sx={[styles.chip, styles.neutralChip]}
            icon={<BasicSparkIcon />}
            label="No Sparks plan"
         />
      </Wrapper>
   )
}

type WrapperProps = {
   children: React.ReactNode
}

const Wrapper = ({ children }: WrapperProps) => {
   return (
      <Stack direction="row" spacing={1}>
         {children}
      </Stack>
   )
}

export default StatusChips
