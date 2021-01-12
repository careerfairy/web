import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Box, colors, LinearProgress, Typography} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

const useStyles = makeStyles(theme => ({
    differenceIcon: {
        color: ({positive}) => positive ? colors.green[900] : colors.red[900]
    },
    differenceValue: {
        color: ({positive}) => positive ? colors.green[900] : colors.red[900],
        marginRight: theme.spacing(1)
    }
}));

const PercentageDisplay = ({fetchingStreams, positive, percentage, globalTimeFrame}) => {

    const classes = useStyles({positive})

    return fetchingStreams ? (
        <Box mt={2}>
            <LinearProgress/>
        </Box>
    ) : (
        <Box
            mt={2}
            display="flex"
            alignItems="center"
        >
            {positive ?
                <ArrowUpwardIcon className={classes.differenceIcon}/>
                :
                <ArrowDownwardIcon className={classes.differenceIcon}/>
            }

            <Typography
                className={classes.differenceValue}
                variant="body2"
            >
                {percentage}
            </Typography>

            <Typography
                color="textSecondary"
                variant="caption"
            >
                Compared to the last {globalTimeFrame.name}
            </Typography>
        </Box>
    )
        ;
};

export default PercentageDisplay;
