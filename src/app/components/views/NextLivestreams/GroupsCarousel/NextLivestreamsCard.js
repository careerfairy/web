import React, {useEffect, useState} from 'react';
import {Card, CardMedia, Grow, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        justifyContent: "center",
        width: "100%"
    },
    card: {
        margin: theme.spacing(1.5),
        padding: theme.spacing(1),
        cursor: "pointer",
        borderRadius: "5px",
        maxHeight: 200,
        color: "white",
        boxShadow: "none",
        // maxWidth: 350,
        background: "rgba(255, 255, 255, 0)",
        transition: "all 0.5s, all 0.5s",
        "&:hover": {
            transform: "scale(1.02)"
        }
    },
    media: {
        display: "flex",
        justifyContent: "center",
        height: "70px",
        alignItems: "center"
    },
    image: {
        objectFit: "contain",
        maxWidth: "50%",
    },
    text: {
        textTransform: "uppercase",
        fontSize: "1.3rem",
    }
}));


const NextLivestreamsCard = ({handleSetGroup, mobile, index, handleResetGroup, activeSlide, groupData, position}) => {
    // console.log("activeSlide in next",activeSlide);
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
            <div>
                <Card
                    style={{border: amISelected() ? " 5px solid #00d2aa" : "white"}}
                      onClick={() => {
                          handleResetGroup()
                          handleSetGroup({})
                      }} elevation={2} className={classes.card}>
                    <CardMedia style={{height: mobile ? 60 : 90, padding: mobile ? "0.5em" : "0 1em 1em 1em"}} className={classes.media}>
                        <Typography variant="h4" align="center" className={classes.text} noWrap><strong>Next Live Streams</strong></Typography>
                    </CardMedia>{!mobile &&
                    <Typography align="center" noWrap>Coming up on CareerFairy</Typography>}
                </Card>
            </div>
        </Grow>
    );
};

export default withFirebase(NextLivestreamsCard);