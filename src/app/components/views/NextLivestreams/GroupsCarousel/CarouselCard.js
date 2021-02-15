import React, {useEffect, useState} from 'react';
import {Card, CardMedia, Typography, Grow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";

const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(1.5),
        padding: theme.spacing(1),
        cursor: "pointer",
        borderRadius: "5px",
        maxHeight: 200,
        // maxWidth: 350,
        transition: "all 0.5s, all 0.5s",
        "&:hover": {
            transform: "scale(1.02)"
        },
    },
    media: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        background: theme.palette.common.white,
        borderRadius: theme.spacing(1)
    },
    image: {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        objectFit: "contain",
        width: "45%",
        maxWidth: "120px",
        maxHeight: "60px"
    },
    companyName:{
        marginTop: theme.spacing(1)
    }
}));
const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"


const CarouselCard = ({groupId, firebase, handleSetGroup, groupIdsToRemove, mobile, index, handleResetGroup, activeSlide, setGroupIdsToRemove}) => {
    const classes = useStyles()
    const [localGroup, setLocalGroup] = useState({})
    const [noGroup, setNoGroup] = useState(false)

    useEffect(() => {
        if (isSelected()) {
            handleSetGroup(localGroup)
        }
    }, [index])

    useEffect(() => {
        if (isSelected()) {
            handleSetGroup(localGroup)
        }
    }, [activeSlide, localGroup.universityName, index])


    useEffect(() => {
        if (groupId) {
            const unsubscribe = firebase.listenToCareerCenterById(groupId, querySnapshot => {
                if (querySnapshot.data()) {
                    let careerCenter = querySnapshot.data();
                    careerCenter.id = querySnapshot.id;
                    setLocalGroup(careerCenter);
                } else {
                    const newGroupIds = [...groupIdsToRemove]
                    newGroupIds.push(groupId)
                    setGroupIdsToRemove([...new Set(newGroupIds)])
                    setNoGroup(true)
                }

            })
            return () => unsubscribe()
        }
    }, [])

    const isSelected = () => {
        return activeSlide === index
    }

    if (noGroup) {
        return null
    }


    return (
        <Grow in={Boolean(localGroup.id)} timeout={600}>
            <div>
                <Card style={{borderTop: isSelected() ? "3px solid #00d2aa" : "none"}}
                      onClick={() => {
                          handleResetGroup()
                          handleSetGroup(localGroup)
                      }} elevation={2} className={classes.card}>
                    <CardMedia style={{height: mobile ? 60 : 90, padding: mobile ? "0.5em" : "0 1em 1em 1em"}}
                               className={classes.media}>
                        <img src={localGroup.logoUrl || placeholder} className={classes.image}
                             alt={`${localGroup.universityName} Logo`}/>
                    </CardMedia>{!mobile &&
                <Typography className={classes.companyName} align="center" noWrap>{localGroup.universityName}</Typography>}
                </Card>
            </div>
        </Grow>
    );
};

export default withFirebase(CarouselCard);
