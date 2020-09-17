import React, {useEffect, useState} from 'react';
import Groups from "../groups/Groups";
import {withFirebase} from "../../../data/firebase";
import {Button} from "@material-ui/core";
import Link from "next/link";

const GroupProvider = ({firebase, user, absolutePath}) => {
    const [userData, setUserData] = useState(null);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (user) {
            const unsubscribe = firebase.listenToUserData(user.email, querySnapshot => {
                let user = querySnapshot.data();
                if (user) {
                    setUserData(user);
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        if (userData) {
            const unsubscribe = firebase.listenToGroups(querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    if (!userData.groupIds?.includes(careerCenter.id)) {
                        careerCenters.push(careerCenter);
                    }
                })
                setGroups(careerCenters);
            });
            return () => unsubscribe();
        }
    }, [userData]);


    return (userData ?
        <>
            <Groups makeSix={6} userData={userData} groups={groups}/>
            <Link href={absolutePath || "/profile"} underline="none">
                <Button color="primary" style={{position: "sticky", bottom: 10}} variant="contained" fullWidth>
                    Finish
                </Button>
            </Link>
        </>
        : null);
};

export default withFirebase(GroupProvider);
