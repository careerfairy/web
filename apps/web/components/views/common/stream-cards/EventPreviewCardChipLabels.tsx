import CheckIcon from "@mui/icons-material/CheckCircle"
import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined"
import { Box, Chip, Stack, Typography } from "@mui/material"
import { Briefcase, CheckCircle } from "react-feather"
import { sxStyles } from "../../../../types/commonTypes"
import { useEventPreviewCardContext } from "./EventPreviewCardContext"

const styles = sxStyles({
   wrapper: {
      position: "absolute",
      display: "flex",
      padding: 1.5,
      justifyContent: "space-between",
      width: "100%",
   },
   liveLeftChip: {
      "& .MuiChip-icon": {
         width: "16px",
         height: "16px",
         mr: 0.5,
      },
   },
   leftChip: {
      color: (theme) => theme.palette.neutral[700],
   },
   tag: {
      padding: "4px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "4px",
      height: "unset",
      "& .MuiChip-label, p": {
         fontSize: "12px",
         fontWeight: 400,
         lineHeight: "16px",
         padding: 0,
      },
      "& .MuiChip-icon": {
         margin: 0,
         width: "14px",
         height: "14px",
      },
   },
})

type Props = {
   recordingAvailableDays?: number
}

const EventPreviewCardChipLabels = ({ recordingAvailableDays }: Props) => {
   const { isPast, isLive, hasJobsToApply, hasParticipated, hasRegistered } =
      useEventPreviewCardContext()
   const leftChips = []
   let rightChip

   if (hasParticipated && isPast) {
      rightChip = (
         <Chip
            key={"attend-chip"}
            icon={<CheckIcon />}
            color="primary"
            label={"Attended"}
            sx={[styles.tag, styles.liveLeftChip]}
         />
      )
   }

   if (isLive) {
      leftChips.push(
         <Chip
            key={"live-chip"}
            icon={<LiveIcon />}
            color="error"
            label={"Live"}
            sx={[styles.tag, styles.liveLeftChip]}
         />
      )
   }

   if (hasRegistered && !isPast) {
      leftChips.push(
         <Chip
            key={"booked-chip"}
            icon={<CheckCircle color="#00D247" width={14} height={14} />}
            sx={[styles.tag, styles.leftChip]}
            color="info"
            label={<Typography>{REGISTERED_LABEL}</Typography>}
         />
      )
   }

   if (hasJobsToApply && !(isLive && hasRegistered)) {
      // registered tag takes precedence over hiring tag if it's live
      leftChips.push(
         <Chip
            key={"hiring-now-chip"}
            icon={<Briefcase color={"#3A70E2"} width={14} height={14} />}
            sx={[styles.tag, styles.leftChip]}
            color={"info"}
            label={<Typography>Hiring now</Typography>}
         />
      )
   }

   if (recordingAvailableDays) {
      let daysLeftMessage: JSX.Element

      if (recordingAvailableDays === 1) {
         daysLeftMessage = (
            <Typography ml={0.5} fontWeight={500} color={"error"}>
               1 Day
            </Typography>
         )
      }

      if (recordingAvailableDays > 1) {
         daysLeftMessage = (
            <Typography ml={0.5} fontWeight={500} color={"secondary"}>
               {recordingAvailableDays} Days
            </Typography>
         )
      }

      leftChips.push(
         <Chip
            key={"available-chip"}
            color={"info"}
            icon={
               <TaskAltOutlinedIcon
                  color={recordingAvailableDays > 1 ? "secondary" : "error"}
               />
            }
            label={
               <Box display={"flex"}>
                  <Typography fontWeight={500}>Available for</Typography>
                  {daysLeftMessage}
               </Box>
            }
         />
      )
   }

   return leftChips.length > 0 || rightChip ? (
      <Box className="hideOnHoverContent" sx={styles.wrapper}>
         <Stack spacing={1} direction={"row"}>
            {leftChips.map((chip, index) => ({
               ...chip,
               key: `chip-${index}`,
            }))}
         </Stack>
         <Box>{rightChip}</Box>
      </Box>
   ) : null
}

export const REGISTERED_LABEL = "Registered"
export default EventPreviewCardChipLabels
