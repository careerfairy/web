import React, {useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../data/firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        padding: theme.spacing(2),
        border: "1px solid blue",
        height: "100%",
    },
}));

const GroupStreams = ({groupData, firebase}) => {

        const classes = useStyles()
        const [livestreams, setLivestreams] = useState([])
        const [searching, setSearching] = useState(false)
        console.log("livestreams", livestreams);
        console.log("groupData", groupData);

        useEffect(() => {
            if (groupData) {
                const unsubscribe = firebase.listenToLiveStreamsByUniversityId(groupData.universityId, querySnapshot => {
                    setSearching(false);
                    let livestreams = [];
                    querySnapshot.forEach(doc => {
                        let livestream = doc.data();
                        livestream.id = doc.id;
                        livestreams.push(livestream);
                    })
                    setLivestreams(livestreams);
                })
                return () => unsubscribe()
            }
        }, [groupData])

        return (
            <div className={classes.root}>
                {groupData.universityId}
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
