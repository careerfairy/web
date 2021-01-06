import React, {useContext, useEffect, useState, Fragment} from 'react';
import Groups from "../groups/Groups";
import {withFirebase} from "../../../context/firebase";
import {Button} from "@material-ui/core";
import Link from "next/link";
import {useAuth} from "../../../HOCs/AuthProvider";

const GroupProvider = ({firebase, absolutePath}) => {
    const {userData} = useAuth()
    const [groups, setGroups] = useState([]);


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


    return userData ? (
        <Fragment>
            <Groups absolutePath={absolutePath} makeSix={6} userData={userData} groups={groups}/>
            <Link href={absolutePath || "/profile"} underline="none">
                <Button color="primary" style={{position: "sticky", bottom: 10}} variant="contained" fullWidth>
                    Finish
                </Button>
            </Link>
        </Fragment>
    ) : null;
};

export default withFirebase(GroupProvider);
