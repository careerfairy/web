import { Box, Card, Typography, useTheme } from "@mui/material"
import { Calendar, Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import DateUtil from "util/DateUtil"

const styles = sxStyles({
   dateTimeRow: {
      display: "flex",
      gap: { xs: 1, md: 3 },
      alignItems: "center",
   },
   dateTimeItem: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
   },
   dateTimeText: {
      color: "common.white",
      whiteSpace: "nowrap",
   },
   mobileDateTimeCard: {
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "8px",
      padding: "20px",
      border: "none",
      boxShadow: "none",
   },
   mobileDateTimeRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
   },
   mobileDateTimeItem: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
   },
   mobileDateTimeText: {
      color: "neutral.900",
      whiteSpace: "nowrap",
   },
})

type Props = {
   eventDate: Date
}

export const HeroDateAndTime = ({ eventDate }: Props) => {
   return (
      <Box sx={styles.dateTimeRow}>
         <Box sx={styles.dateTimeItem}>
            <Calendar size={20} color="white" />
            <Typography variant="medium" sx={styles.dateTimeText}>
               {DateUtil.formatDayOfMonth(eventDate)}
            </Typography>
         </Box>
         <Box sx={styles.dateTimeItem}>
            <Clock size={20} color="white" />
            <Typography variant="medium" sx={styles.dateTimeText}>
               {DateUtil.getPrettyTime(eventDate)}
            </Typography>
         </Box>
      </Box>
   )
}

export const MobileDateAndTime = ({ eventDate }: Props) => {
   const theme = useTheme()

   return (
      <Card sx={styles.mobileDateTimeCard}>
         <Box sx={styles.mobileDateTimeRow}>
            <Box sx={styles.mobileDateTimeItem}>
               <Calendar size={20} color={theme.palette.neutral[900]} />
               <Typography variant="medium" sx={styles.mobileDateTimeText}>
                  {DateUtil.formatDayOfMonth(eventDate)}
               </Typography>
            </Box>
            <Box sx={styles.mobileDateTimeItem}>
               <Clock size={20} color={theme.palette.neutral[900]} />
               <Typography variant="medium" sx={styles.mobileDateTimeText}>
                  {DateUtil.getPrettyTime(eventDate)}
               </Typography>
            </Box>
         </Box>
      </Card>
   )
}
