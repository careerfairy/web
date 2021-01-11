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
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import {withFirebase} from "../../../../../context/firebase";
import AddToPhotosRoundedIcon from "@material-ui/icons/AddToPhotosRounded";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%'
    },
    avatar: {
        backgroundColor: colors.red[600],
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

const TotalRegistrations = ({
                                registrationsStatus,
                                fetchingStreams,
                                totalRegistrations,
                                timeFrames,
                                className,
                                ...rest
                            }) => {
    const classes = useStyles({positive: registrationsStatus.positive});

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
                            REGISTRATIONS
                        </Typography>
                        <Typography
                            color="textPrimary"
                            variant="h3"
                        >
                            {fetchingStreams ? <CircularProgress/> : totalRegistrations}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <AddToPhotosRoundedIcon/>
                        </Avatar>
                    </Grid>
                </Grid>
                <Box
                    mt={2}
                    display="flex"
                    alignItems="center"
                >
                    {registrationsStatus.positive ?
                        <ArrowUpwardIcon className={classes.differenceIcon}/>
                        :
                        <ArrowDownwardIcon className={classes.differenceIcon}/>
                    }
                    <Typography
                        className={classes.differenceValue}
                        variant="body2"
                    >
                        {registrationsStatus.percentage}
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

TotalRegistrations.propTypes = {
    className: PropTypes.string
};

export default withFirebase(TotalRegistrations);
