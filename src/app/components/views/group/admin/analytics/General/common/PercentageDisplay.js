import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Box, LinearProgress, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { red, green } from '@mui/material/colors';

const useStyles = makeStyles((theme) => ({
   differenceIcon: {
      color: ({ positive }) => (positive ? green[900] : red[900]),
   },
   differenceValue: {
      color: ({ positive }) => (positive ? green[900] : red[900]),
      marginRight: theme.spacing(1),
   },
}));

const PercentageDisplay = ({
   fetchingStreams,
   positive,
   percentage,
   globalTimeFrame,
}) => {
   const classes = useStyles({ positive });

   return fetchingStreams ? (
      <Box mt={2}>
         <LinearProgress />
      </Box>
   ) : (
      <Box mt={2} display="flex" alignItems="center">
         {positive ? (
            <ArrowUpwardIcon className={classes.differenceIcon} />
         ) : (
            <ArrowDownwardIcon className={classes.differenceIcon} />
         )}

         <Typography className={classes.differenceValue} variant="body2">
            {percentage}
         </Typography>

         <Typography color="textSecondary" variant="caption">
            Compared to the last {globalTimeFrame.name}
         </Typography>
      </Box>
   );
};

export default PercentageDisplay;
