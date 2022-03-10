import React from "react";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import DateUtil from "../../../../../util/DateUtil";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import Stack from "@mui/material/Stack";

const styles = {
   dateShareWrapper: {
      py: 1,
   },
   date: {
      fontWeight: 600,
      color: "text.primary",
   },
} as const;
const DateAndShareDisplay = ({ startDate, loading, onShareClick }: Props) => {
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
               <Skeleton width={120} />
            ) : (
               DateUtil.eventPreviewDate(startDate)
            )}
         </Typography>
         {loading ? (
            <Skeleton variant={"circular"} height={20} width={20} />
         ) : onShareClick ? (
            <>
               <IconButton onClick={onShareClick}>
                  <ShareIcon />
               </IconButton>
            </>
         ) : null}
      </Stack>
   );
};

interface Props {
   loading: boolean;
   onShareClick?: () => void;
   startDate?: Date;
}

export default DateAndShareDisplay;
