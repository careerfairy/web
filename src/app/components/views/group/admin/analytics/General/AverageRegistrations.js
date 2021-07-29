import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Avatar, Card, CardContent, CircularProgress, Grid, Typography} from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';
import {withFirebase} from "../../../../../../context/firebase";
import orange from "@material-ui/core/colors/orange";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    },
    avatar: {
        backgroundColor: orange[600],
        height: 56,
        width: 56
    }
}));

const AverageRegistrations = ({fetchingStreams, averageRegistrations, timeFrames, className, ...rest}) => {
    const classes = useStyles();

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardContent>
                <Grid
                    container
                    justifyContent="space-between"
                    spacing={3}
                >
                    <Grid item>
                        <Typography
                            color="textSecondary"

                            variant="h6"
                        >
                            REGISTRATIONS PER EVENT
                        </Typography>
                        <Typography gutterBottom variant="h6">
                            (average)
                        </Typography>
                        <Typography
                            color="textPrimary"
                            variant="h3"
                        >
                            {fetchingStreams ? <CircularProgress/> : averageRegistrations}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <InsertChartIcon/>
                        </Avatar>
                    </Grid>
                </Grid>
                {/*<Box mt={3}>*/}
                {/*    <LinearProgress*/}
                {/*        value={75.5}*/}
                {/*        variant="determinate"*/}
                {/*    />*/}
                {/*</Box>*/}
            </CardContent>
        </Card>
    );
};

AverageRegistrations.propTypes = {
    className: PropTypes.string
};

export default withFirebase(AverageRegistrations);
