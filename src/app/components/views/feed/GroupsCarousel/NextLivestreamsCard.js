import React, {useEffect, useState} from 'react';
import {Card, CardMedia, Grow, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: theme.spacing(1.5),
        padding: theme.spacing(1),
        cursor: "pointer",
        borderRadius: "5px",
        maxHeight: 200,
        transition: "all 1s, all 1s",
        "&:hover": {
            backgroundColor: "rgba(233,233,233,0.5)",
        }
    },
    media: {
        display: "flex",
        justifyContent: "center",
        padding: "0 1em 1em 1em",
        height: "70px",
        alignItems: "center"
    },
    image: {
        objectFit: "contain",
        maxWidth: "50%",
    }
}));


const NextLivestreamsCard = ({handleSetGroup, mobile, index, handleResetGroup, activeSlide, groupData, position}) => {
    const classes = useStyles()

    useEffect(() => {
        if (amISelected()) {
            handleSetGroup({})
        }
    }, [index])

    useEffect(() => {
        if (amISelected()) {
            handleSetGroup({})
        }
    }, [activeSlide, index])

    const amISelected = () => {
        return position === activeSlide
    }


    return (
        <Grow in={true} timeout={600}>
            <Card style={{borderTop: amISelected() ? "3px solid #00d2aa" : "none"}}
                  onClick={() => {
                      handleResetGroup()
                      handleSetGroup({})
                  }} elevation={2} className={classes.root}>
                <CardMedia style={{height: mobile ? 50 : 90}} className={classes.media}>
                    <Typography variant="h4" align="center" noWrap>Next Livestreams</Typography>
                </CardMedia>
                <Typography align="center" noWrap>click here for upcoming streams</Typography>
            </Card>
        </Grow>
    );
};

export default withFirebase(NextLivestreamsCard);
