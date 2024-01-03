import { Badge, Box, Chip, Stack, Typography } from "@mui/material"
import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import CheckIcon from "@mui/icons-material/CheckCircle"
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined"
import React from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { red } from "@mui/material/colors"

const styles = sxStyles({
   wrapper: {
      position: "absolute",
      display: "flex",
      padding: 2,
      justifyContent: "space-between",
      width: "100%",
   },
   badge: {
      pl: 1,
      "& .MuiBadge-dot": {
         minWidth: 10,
         height: 10,
         borderRadius: "50%",
      },
   },
})

type Props = {
   hasParticipated: boolean
   isPast: boolean
   isLive: boolean
   hasRegistered: boolean
   hasJobToApply: boolean
   recordingAvailableDays?: number
}

const EventPreviewCardChipLabels = ({
   hasParticipated,
   isPast,
   isLive,
   hasRegistered,
   hasJobToApply,
   recordingAvailableDays,
}: Props) => {
   let leftChips = []
   let rightChip

   if (hasParticipated && isPast) {
      rightChip = (
         <Chip
            key={"attend-chip"}
            icon={<CheckIcon />}
            color="primary"
            label={"Attended"}
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
            sx={{ width: { xs: "fit-content", md: "auto" } }}
         />
      )
   }

   if (hasRegistered && !isPast) {
      leftChips.push(
         <Chip
            key={"booked-chip"}
            icon={<TaskAltOutlinedIcon color="success" />}
            color="info"
            label={"Registered"}
         />
      )
   }

   if (hasJobToApply) {
      leftChips.push(
         <Chip
            key={"hiring-now-chip"}
            icon={<BusinessCenterOutlinedIcon color="secondary" />}
            sx={{ pr: 1 }}
            color={"info"}
            label={"Hiring now"}
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
            sx={{ pr: 1 }}
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
         <Stack spacing={1} direction={{ xs: "column", md: "row" }}>
            {leftChips.map((chip, index) => ({
               ...chip,
               key: `chip-${index}`,
            }))}
         </Stack>
         <Box>{rightChip}</Box>
      </Box>
   ) : null
}

export default EventPreviewCardChipLabels
