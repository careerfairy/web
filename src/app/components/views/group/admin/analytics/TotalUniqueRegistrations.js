import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    colors,
    makeStyles, CircularProgress
} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import {withFirebase} from "../../../../../context/firebase";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%'
    },
    avatar: {
        backgroundColor: colors.green[600],
        height: 56,
        width: 56
    },
    differenceIcon: {
        color: ({positive}) => positive ? colors.green[900] : colors.red[900]
    },
    differenceValue: {
        color: ({positive}) => positive ? colors.green[900] : colors.red[900],
        marginRight: theme.spacing(1)
    }
}));

const TotalUniqueRegistrations = ({uniqueRegistrationsStatus, fetchingStreams, totalUniqueRegistrations, timeFrames, className, ...rest}) => {
    const classes = useStyles({positive: uniqueRegistrationsStatus.positive});

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardContent>
                <Grid
                    container
                    justify="space-between"
                    spacing={3}
                >
                    <Grid item>
                        <Typography
                            color="textSecondary"
                            gutterBottom
                            variant="h6"
                        >
                            UNIQUE REGISTRATIONS
                        </Typography>
                        <Typography
                            color="textPrimary"
                            variant="h3"
                        >
                            {fetchingStreams ? <CircularProgress/> : totalUniqueRegistrations}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <LibraryAddCheckIcon/>
                        </Avatar>
                    </Grid>
                </Grid>
                <Box
                    mt={2}
                    display="flex"
                    alignItems="center"
                >
                    {uniqueRegistrationsStatus.positive ?
                        <ArrowUpwardIcon className={classes.differenceIcon}/>
                        :
                        <ArrowDownwardIcon className={classes.differenceIcon}/>
                    }
                    <Typography
                        className={classes.differenceValue}
                        variant="body2"
                    >
                        {uniqueRegistrationsStatus.percentage}
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="caption"
                    >
                        Since last month
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

TotalUniqueRegistrations.propTypes = {
    className: PropTypes.string
};

export default withFirebase(TotalUniqueRegistrations);
