import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import PeopleIcon from "@material-ui/icons/People";
import {Grid, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

const EmptyDisplay = () => {

    const classes = useStyles()

    return (
        <Grid className={classes.container} container>
            <PeopleIcon fontSize="large"/>
            <Typography>
                No participation yet
            </Typography>
        </Grid>
    );
};

export default EmptyDisplay;
