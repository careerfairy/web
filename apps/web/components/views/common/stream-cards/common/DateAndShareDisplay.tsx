import React, { useCallback } from "react"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import DateUtil from "../../../../../util/DateUtil"
import IconButton from "@mui/material/IconButton"
import ShareIcon from "@mui/icons-material/Share"
import Stack from "@mui/material/Stack"

const styles = {
   dateShareWrapper: {
      py: 1,
   },
   date: {
      fontWeight: 600,
      color: "text.primary",
   },
} as const
const DateAndShareDisplay = ({
   startDate,
   loading,
   onShareClick,
   animation,
   showPlaceholderDate = false,
}: Props) => {
   const renderDate = useCallback(
      (date) => {
         if (showPlaceholderDate) {
            return "Coming soon"
         }
         return DateUtil.eventPreviewDate(date)
      },
      [showPlaceholderDate]
   )

   return (
      <Stack
         spacing={2}
         sx={styles.dateShareWrapper}
         justifyContent="space-between"
         alignItems={"center"}
         direction="row"
      >
         <Typography component={"div"} variant={"h6"} sx={styles.date}>
            {loading ? (
               <Skeleton animation={animation} width={120} />
            ) : (
               renderDate(startDate)
            )}
         </Typography>
         {loading ? (
            <Skeleton
               variant={"circular"}
               animation={animation}
               height={20}
               width={20}
            />
         ) : onShareClick ? (
            <>
               <IconButton onClick={onShareClick}>
                  <ShareIcon />
               </IconButton>
            </>
         ) : null}
      </Stack>
   )
}

interface Props {
   loading?: boolean
   onShareClick?: () => void
   startDate?: Date
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   showPlaceholderDate?: boolean
}

export default DateAndShareDisplay
