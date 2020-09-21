import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardMedia, Typography, Grow, withStyles} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../data/firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: theme.spacing(0.5),
        cursor: "pointer",
        borderRadius: "20px",
        maxHeight: 200,
        transition: "background 1s, color 1s",
        "&:hover": {
            backgroundColor: "rgba(233,233,233,0.5)",
        }
    },
    media: {
        display: "flex",
        justifyContent: "center",
        padding: "1.5em 1em 1em 1em",
        height: "90px",
    },
    image: {
        objectFit: "contain",
        maxWidth: "80%",
    }
}));

const placeholder = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"


const GroupCarouselCard = ({group, groupId, firebase, handleSetGroup, groupData}) => {
    const classes = useStyles()
    const [localGroup, setLocalGroup] = useState({})
    const [noGroup, setNoGroup] = useState(false)

    useEffect(() => {
        if (group) {
            setLocalGroup(group)
        }
    }, [group])

    useEffect(() => {
        if (!group) {
            const unsubscribe = firebase.listenToCareerCenterById(groupId, querySnapshot => {
                if (querySnapshot) {
                    if (querySnapshot.data()) {
                        let careerCenter = querySnapshot.data();
                        careerCenter.id = querySnapshot.id;
                        setLocalGroup(careerCenter);
                    } else {
                        setNoGroup(true)
                    }
                }
            })
            return () => unsubscribe()
        }
    }, [])

    if (noGroup) {
        return null
    }


    return (
        <Grow in={Boolean(localGroup.id)} timeout={600}>
            <Card style={{borderTop: groupData.id === groupId ? "3px solid #00d2aa" : "none"}}
                  onClick={() => handleSetGroup(localGroup)} elevation={2} className={classes.root}>
                <CardMedia className={classes.media}>
                    <img src={localGroup.logoUrl || placeholder} className={classes.image}
                         alt={`${localGroup.universityName} Logo`}/>
                </CardMedia>
            </Card>
        </Grow>
    );
};

export default withFirebase(GroupCarouselCard);
