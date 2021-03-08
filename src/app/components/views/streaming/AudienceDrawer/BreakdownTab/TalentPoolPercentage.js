import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles, withStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Grid, Typography} from "@material-ui/core";
import LinearProgress from '@material-ui/core/LinearProgress';

import clsx from "clsx";

const BorderLinearProgress = withStyles((theme) => ({
    root: {
        height: 10,
        borderRadius: 5,
    },
    colorPrimary: {
        backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
        borderRadius: 5,
        backgroundColor: theme.palette.primary.main,
    },
}))(LinearProgress);

const useStyles = makeStyles(theme => ({
    root:{
        background: theme.palette.background.default
    },
    header:{
        paddingBottom: 0
    },
    percentage:{
      fontWeight: 500
    }
}));


const TalentPoolPercentage = ({percentage, className, ...rest}) => {

    const classes = useStyles()
    return (
        <Card className={clsx(classes.root, className)} {...rest}>
            <CardHeader
                className={classes.header}
                title="Percent in talent pool"
            />
            <CardContent>
                <Grid alignItems="center" container spacing={2}>
                    <Grid item xs={1}>
                        <Typography variant="body2" className={classes.percentage}>
                            {percentage}%
                        </Typography>
                    </Grid>
                    <Grid item xs={11}>
                        <BorderLinearProgress variant="determinate" value={percentage}/>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};


TalentPoolPercentage.propTypes = {
  className: PropTypes.string,
  percentage: PropTypes.number.isRequired
}
export default TalentPoolPercentage;
