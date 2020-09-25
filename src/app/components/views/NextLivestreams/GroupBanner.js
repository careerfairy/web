import React from 'react';
import {CardMedia, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "sticky",
        top: 0,
        zIndex:11
    },
    media: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        padding: "1.5em 1em 1em 1em",
        height: "120px",
    },
    image: {
        objectFit: "contain",
        maxWidth: "80%",
    },
}));

const GroupBanner = ({logoUrl, description}) => {
    const classes = useStyles()

    return logoUrl ? (
        <div className={classes.root}>
            <CardMedia className={classes.media}>
                <img src={logoUrl} className={classes.image} alt=""/>
            </CardMedia>
        </div>
    ) : null;
};

export default GroupBanner;
