import React, {useEffect, useState} from 'react';
import {withFirebase} from "../../../data/firebase";
import GroupsCarousel from "./GroupsCarousel/GroupsCarousel";
import {useMediaQuery, useTheme} from "@material-ui/core";
import DesktopFeed from "./DesktopFeed/DesktopFeed";
import MobileFeed from "./MobileFeed";

const Feed = ({user, userData, firebase, livestreamId, careerCenterId}) => {

    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [groupData, setGroupData] = useState({})
    const [groupIds, setGroupIds] = useState([])
    const [livestreams, setLivestreams] = useState([])
    const [iDsHasBeenSet, setIdsHasBeenSet] = useState(false)
    const [searching, setSearching] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([])

    const checkIfCareerCenterExists = async (centerId) => {
        const querySnapshot = await firebase.getCareerCenterById(centerId)
        return querySnapshot.exists
    }


    useEffect(() => {
        if (groupData && groupData.universityId) {
            setSearching(true)
            const unsubscribe = firebase.listenToLiveStreamsByUniversityId(groupData.universityId, querySnapshot => {
                setSearching(false);
                let livestreams = [];
                querySnapshot.forEach(doc => {
                    let livestream = doc.data();
                    livestream.id = doc.id;
                    const livestreamCategories = livestream.targetCategories[groupData.groupId]
                    if (selectedOptions.length && livestreamCategories) {
                        if (checkIfLivestreamHasAll(selectedOptions, livestreamCategories)) {
                            livestreams.push(livestream)
                        }
                    } else if (!selectedOptions.length) {
                        livestreams.push(livestream);
                    }
                })
                if (livestreamId && careerCenterId && careerCenterId === groupData.groupId) {
                    const currentIndex = livestreams.findIndex(el => el.id === livestreamId)
                    if (currentIndex > -1) {
                        repositionElement(livestreams, currentIndex, 0)
                    }
                }
                setLivestreams(livestreams);
                setSearching(false)
            })
            return () => unsubscribe()
        }
    }, [groupData, selectedOptions])

    useEffect(() => {
        if (groupData && groupData.categories) {
            let activeOptions = [];
            groupData.categories.forEach(category => {
                category.options.forEach(option => {
                    if (option.active === true) {
                        activeOptions.push(option.id)
                    }
                })
            })
            setSelectedOptions(activeOptions)
        }
    }, [groupData.categories, groupData])

    useEffect(() => {
        if (userData && userData.groupIds && userData.groupIds.length && !iDsHasBeenSet) {
            handleGetGroupIds()
        }
    }, [userData])

    const handleGetGroupIds = async () => {
        setIdsHasBeenSet(true)
        const newGroupIds = [...userData.groupIds]
        if (livestreamId && careerCenterId) {
            if (newGroupIds.includes(careerCenterId)) {
                const currentIndex = newGroupIds.findIndex(el => el === careerCenterId)
                if (currentIndex > -1) {
                    repositionElement(newGroupIds, currentIndex, 0)
                }
            } else {
                const exists = await checkIfCareerCenterExists(careerCenterId)
                if (exists) {
                    newGroupIds.unshift(careerCenterId)
                }
            }
        }
        setGroupIds(newGroupIds)
    }


    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }

    const repositionElement = (arr, fromIndex, toIndex) => {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }


    const checkIfLivestreamHasAll = (selected, arr) => {
        return selected.some(v => arr.includes(v)) // switch to selected.includes to make it an AND Operator
    };

    const handleSetGroup = (groupObj) => {
        const newGroupObj = {
            ...groupObj,
            alreadyJoined: userData.groupIds?.includes(groupObj.id)
        }
        if (newGroupObj.categories) {
            newGroupObj.categories.forEach(category => {
                category.options.forEach(option => (option.active = false))
            })
        }
        setGroupData(newGroupObj)
        scrollToTop()
    }

    const handleResetGroup = () => {
        setGroupData({})
    }

    const handleToggleActive = (categoryId, optionId) => {
        const newGroupData = {...groupData}
        const targetCategory = newGroupData.categories.find(category => category.id === categoryId)
        const targetOption = targetCategory.options.find(option => option.id === optionId)
        targetOption.active = !targetOption.active
        setGroupData(newGroupData)
        if (!mobile) {
            scrollToTop()
        }
    }

    return (
        <>
            <GroupsCarousel groupData={groupData}
                            mobile={mobile}
                            handleResetGroup={handleResetGroup}
                            handleSetGroup={handleSetGroup}
                            groupIds={groupIds}/>

            {mobile ?
                <MobileFeed groupData={groupData}
                            user={user}
                            scrollToTop={scrollToTop}
                            handleResetGroup={handleResetGroup}
                            searching={searching}
                            livestreams={livestreams}
                            careerCenterId={careerCenterId}
                            livestreamId={livestreamId}
                            alreadyJoined={groupData.alreadyJoined}
                            handleToggleActive={handleToggleActive}
                            userData={userData}/>
                :
                <DesktopFeed alreadyJoined={groupData.alreadyJoined}
                             handleToggleActive={handleToggleActive}
                             userData={userData}
                             livestreamId={livestreamId}
                             searching={searching}
                             careerCenterId={careerCenterId}
                             handleResetGroup={handleResetGroup}
                             user={user}
                             livestreams={livestreams}
                             mobile={mobile}
                             groupData={groupData}/>}
        </>
    );
};

export default withFirebase(Feed);
