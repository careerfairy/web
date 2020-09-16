import React, {useEffect, useState} from 'react';
import Groups from "../groups/Groups";
import {withFirebase} from "../../../data/firebase";

const GroupProvider = ({firebase, user, handleNext, handleBack, handleReset}) => {
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
                    console.log(userData);
                    if (!userData.groupIds.includes(careerCenter.id)) {
                        careerCenters.push(careerCenter);
                    }
                })
                setGroups(careerCenters);
            });
            return () => unsubscribe();
        }
    }, [userData]);


    return (userData ? <Groups userData={userData} groups={groups}/> : null);
};

export default withFirebase(GroupProvider);
