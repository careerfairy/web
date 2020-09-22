import React, {useEffect, useState} from 'react';
import {withFirebase} from "../../../data/firebase";
import GroupsCarousel from "./GroupsCarousel/GroupsCarousel";
import {useMediaQuery, useTheme} from "@material-ui/core";
import DesktopFeed from "./DesktopFeed/DesktopFeed";
import MobileFeed from "./MobileFeed";

const Feed = ({user, userData, firebase}) => {
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [groupData, setGroupData] = useState({})
    const [value, setValue] = useState(0);
    const [livestreams, setLivestreams] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([])


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


    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleResetView = () => {
        setValue(0)
    }

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const checkIfLivestreamHasAll = (selected, arr) => {
        return selected.every(v => arr.includes(v))
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
        handleResetView()
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
                            groupIds={userData.groupIds}/>

            {mobile ?
                <MobileFeed groupData={groupData}
                            user={user}
                            handleResetGroup={handleResetGroup}
                            value={value}
                            searching={searching}
                            livestreams={livestreams}
                            handleChangeIndex={handleChangeIndex}
                            handleResetView={handleResetView}
                            handleChange={handleChange}
                            alreadyJoined={groupData.alreadyJoined}
                            handleToggleActive={handleToggleActive}
                            userData={userData}/>
                :
                <DesktopFeed alreadyJoined={groupData.alreadyJoined}
                             handleToggleActive={handleToggleActive}
                             userData={userData}
                             searching={searching}
                             handleResetGroup={handleResetGroup}
                             user={user}
                             livestreams={livestreams}
                             mobile={mobile}
                             groupData={groupData}/>}
        </>
    );
};

export default withFirebase(Feed);
