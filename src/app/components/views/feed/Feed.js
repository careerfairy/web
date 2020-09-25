import React, {useContext, useEffect, useState} from 'react';
import {withFirebase} from "../../../context/firebase";
import GroupsCarousel from "./GroupsCarousel/GroupsCarousel";
import {useMediaQuery, useTheme} from "@material-ui/core";
import DesktopFeed from "./DesktopFeed/DesktopFeed";
import MobileFeed from "./MobileFeed";
import {useRouter} from "next/router";
import UserContext from "../../../context/user/UserContext";

const Feed = ({user, firebase}) => {

    const {userData, authenticatedUser} = useContext(UserContext)

    const router = useRouter();
    const {query: {livestreamId}} = router
    const {query: {careerCenterId}} = router

    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [groupData, setGroupData] = useState({})
    const [groupIds, setGroupIds] = useState([])
    const [livestreams, setLivestreams] = useState([])
    const [paramsLivestreamId, setParamsLivestreamId] = useState(null)
    const [paramsCareerCenterId, setParamsCareerCenterId] = useState(null)
    const [searching, setSearching] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [listenToUpcoming, setListenToUpcoming] = useState(false)
    const routerMounted = paramsLivestreamId !== null && paramsCareerCenterId !== null

    useEffect(() => {
        if (listenToUpcoming) {
            const unsubscribe = firebase.listenToUpcomingLivestreams(querySnapshot => {
                let livestreams = [];
                querySnapshot.forEach(doc => {

                    let livestream = doc.data();
                    livestream.id = doc.id;
                    livestreams.push(livestream);
                });
                setLivestreams(livestreams);
            }, error => {
                console.log(error);
            });
            return () => unsubscribe();
        }
    }, [listenToUpcoming])

    useEffect(() => {
        // will set the params once the router is loaded whether it be undefined or truthy
        if (paramsLivestreamId === null && router) {
            setParamsCareerCenterId(careerCenterId)
            setParamsLivestreamId(livestreamId)
        }
    }, [router])


    useEffect(() => {
        if (groupData && groupData.universityId) {
            setSearching(true)
            const unsubscribe = firebase.listenToLiveStreamsByUniversityId(groupData.universityId, querySnapshot => {
                setSearching(false);
                let livestreams = [];
                querySnapshot.forEach(doc => {
                    let livestream = doc.data();
                    livestream.id = doc.id;
                    if (livestream.targetCategories) {
                        const livestreamCategories = livestream.targetCategories[groupData.groupId]
                        if (selectedOptions.length && livestreamCategories) {
                            if (checkIfLivestreamHasAll(selectedOptions, livestreamCategories)) {
                                livestreams.push(livestream)
                            }
                        } else if (!selectedOptions.length) {
                            livestreams.push(livestream);
                        }
                    } else {
                        livestreams.push(livestream)
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
    }, [groupData, selectedOptions, userData, authenticatedUser])

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
        // This checks if the params from the next router have been defined and only then will it set groupIds
        if (routerMounted && userData !== undefined) {
            handleGetGroupIds()
        }
    }, [userData, router, paramsLivestreamId, paramsCareerCenterId, authenticatedUser, routerMounted])


    const checkIfCareerCenterExists = async (centerId) => {
        const querySnapshot = await firebase.getCareerCenterById(centerId)
        return querySnapshot.exists
    }

    const handleGetGroupIds = async () => {
        let newGroupIds = []
        if (userData && userData.groupIds) {
            newGroupIds = [...userData.groupIds]
        }
        if (careerCenterId) {
            if (newGroupIds.includes(careerCenterId)) {
                const currentIndex = newGroupIds.findIndex(el => el === careerCenterId)
                if (currentIndex > -1) {
                    swapPositions(newGroupIds, 0, currentIndex)
                }
            } else {
                const exists = await checkIfCareerCenterExists(careerCenterId)
                if (exists) {
                    newGroupIds.unshift(careerCenterId)
                }
            }
        }
        return setGroupIds(newGroupIds)
    }


    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }

    const repositionElement = (arr, fromIndex, toIndex) => {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }

    const swapPositions = (arr, index1, index2) => {
        [arr[index1], arr[index2]] = [arr[index2], arr[index1]]
    }


    const checkIfLivestreamHasAll = (selected, arr) => {
        return selected.some(v => arr.includes(v)) // switch to selected.includes to make it an AND Operator
    };

    const handleSetGroup = (groupObj) => {
        scrollToTop()
        if (groupObj.universityName) {
            setListenToUpcoming(false)
            const newGroupObj = {
                ...groupObj,
                alreadyJoined: userData ? userData.groupIds?.includes(groupObj.id) : false
            }

            if (newGroupObj.categories) {
                newGroupObj.categories.forEach(category => {
                    category.options.forEach(option => (option.active = false))
                })
            }
            setGroupData(newGroupObj)
        } else {
            setGroupData(groupObj)
            setListenToUpcoming(true)
        }
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
                            careerCenterId={careerCenterId}
                            user={authenticatedUser}
                            handleResetGroup={handleResetGroup}
                            handleSetGroup={handleSetGroup}
                            groupIds={groupIds}/>

            {mobile ?
                <MobileFeed groupData={groupData}
                            user={authenticatedUser}
                            scrollToTop={scrollToTop}
                            handleResetGroup={handleResetGroup}
                            searching={searching}
                            livestreams={livestreams}
                            listenToUpcoming={listenToUpcoming}
                            careerCenterId={careerCenterId}
                            livestreamId={livestreamId}
                            alreadyJoined={groupData.alreadyJoined}
                            handleToggleActive={handleToggleActive}
                            userData={userData}/>
                :
                <DesktopFeed alreadyJoined={groupData.alreadyJoined}
                             handleToggleActive={handleToggleActive}
                             userData={userData}
                             listenToUpcoming={listenToUpcoming}
                             livestreamId={livestreamId}
                             searching={searching}
                             careerCenterId={careerCenterId}
                             handleResetGroup={handleResetGroup}
                             user={authenticatedUser}
                             livestreams={livestreams}
                             mobile={mobile}
                             groupData={groupData}/>}
        </>
    );
};

export default withFirebase(Feed);
