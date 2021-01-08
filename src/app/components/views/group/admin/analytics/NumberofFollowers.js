import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
    Avatar,
    Card,
    CardContent,
    Grid,
    Typography,
    makeStyles,
    colors
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import {withFirebase} from "../../../../../context/firebase";

const useStyles = makeStyles(() => ({
    root: {
        height: '100%'
    },
    avatar: {
        backgroundColor: colors.indigo[600],
        height: 56,
        width: 56
    }
}));

const NumberofFollowers = ({timeFrames ,className, ...rest}) => {
    const classes = useStyles();

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
                            FOLLOWERS
                        </Typography>
                        <Typography
                            color="textPrimary"
                            variant="h3"
                        >
                            3,674
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <PeopleIcon/>
                        </Avatar>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

NumberofFollowers.propTypes = {
    className: PropTypes.string
};

export default withFirebase(NumberofFollowers);
