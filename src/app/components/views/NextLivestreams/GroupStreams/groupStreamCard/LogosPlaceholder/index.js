import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles(theme => ({
    placeholderRoot:{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-evenly",
        height: 90
    },
    skeleton:{
        borderRadius: 5
    }
}));

const LogosPlaceHolder = ({}) => {

    const classes = useStyles()

    return (
        <div className={classes.placeholderRoot}>
            <Skeleton className={classes.skeleton}  variant="rect" width={90} height={70}/>
        </div>
    );
};

export default LogosPlaceHolder;
