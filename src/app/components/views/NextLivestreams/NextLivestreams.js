import React, {useEffect, useState} from "react";
import {withFirebase} from "../../../context/firebase";
import {useMediaQuery} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import DesktopFeed from "./DesktopFeed/DesktopFeed";
import MobileFeed from "./MobileFeed";
import {useRouter} from "next/router";
import {getServerSideRouterQuery} from "../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../HOCs/AuthProvider";

const NextLivestreams = ({firebase}) => {
    const {userData, authenticatedUser} = useAuth();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));
    const router = useRouter();

    // const {
    //     query:{ livestreamId, careerCenterId}
    // } = router

    const livestreamId = getServerSideRouterQuery("livestreamId", router)
    const careerCenterId = getServerSideRouterQuery("careerCenterId", router)

    const [groupData, setGroupData] = useState({});
    const [groupIds, setGroupIds] = useState(["upcoming"]);
    const [livestreams, setLivestreams] = useState([]);
    console.log("--> livestreams", livestreams)
    const [searching, setSearching] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [listenToUpcoming, setListenToUpcoming] = useState(false);

    useEffect(() => {
        const unsubscribe = firebase.listenToUpcomingLivestreams(
            (querySnapshot) => {
                let livestreams = [];
                querySnapshot.forEach((doc) => {
                    let livestream = doc.data();
                    livestream.id = doc.id;
                    livestreams.push(livestream);
                });
                if (livestreamId && !careerCenterId) {
                    const currentIndex = livestreams.findIndex(
                        (el) => el.id === livestreamId
                    );
                    if (currentIndex > -1) {
                        repositionElement(livestreams, currentIndex, 0);
                    }
                }
                livestreams = livestreams.filter(livestream => !livestream.hidden);
                setLivestreams(livestreams);
            },
            (error) => {
                console.log(error);
            }
        );
        return () => unsubscribe();

    }, [livestreamId]);


    useEffect(() => {
        if (groupData && groupData.categories) {
            let activeOptions = [];
            groupData.categories.forEach((category) => {
                category.options.forEach((option) => {
                    if (option.active === true) {
                        activeOptions.push(option.id);
                    }
                });
            });
            setSelectedOptions(activeOptions);
        }
    }, [groupData.categories, groupData]);

    useEffect(() => {
        // This checks if the params from the next router have been defined and only then will it set groupIds
        if (careerCenterId || userData !== undefined) {
            handleGetGroupIds();
        }
    }, [userData, careerCenterId]);

    useEffect(() => {
        if (groupIds.length > 1 && setToUpcomingSlide()) {
            const newGroupIds = [...groupIds]
            const currentIndex = newGroupIds.findIndex((el) => el === "upcoming");
            if (currentIndex > -1) {
                swapPositions(newGroupIds, 0, currentIndex);
            }
            setGroupIds([...new Set(newGroupIds)]);
        }
    }, [livestreamId, careerCenterId, router])


    const setToUpcomingSlide = () => {
        return livestreamId && !careerCenterId || (!livestreamId && !careerCenterId)
    }

    const checkIfCareerCenterExists = async (centerId) => {
        const querySnapshot = await firebase.getCareerCenterById(centerId);
        return querySnapshot.exists;
    };

    const handleGetGroupIds = () => {
        let newGroupIds = [...groupIds];
        if (userData && userData.groupIds) {
            newGroupIds = [...groupIds, ...userData.groupIds];
        }
        if (careerCenterId) {
            return handleGetParams(newGroupIds);
        } else {
            setGroupIds([...new Set(newGroupIds)]);
        }
    };

    const handleGetParams = async (userGroupIds) => {
        let newGroupIds = [...userGroupIds];
        if (newGroupIds.includes(careerCenterId)) {
            const currentIndex = newGroupIds.findIndex((el) => el === careerCenterId);
            if (currentIndex > -1) {
                swapPositions(newGroupIds, 0, currentIndex);
            }
            setGroupIds([...new Set(newGroupIds)]);
        } else {
            const exists = await checkIfCareerCenterExists(careerCenterId);
            if (exists) {
                newGroupIds.unshift(careerCenterId);
            }
            setGroupIds([...new Set(newGroupIds)]);
        }
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const repositionElement = (arr, fromIndex, toIndex) => {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    };

    const swapPositions = (arr, index1, index2) => {
        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
    };

    const checkIfLivestreamHasAll = (selected, arr) => {
        return selected.some((v) => arr.includes(v)); // switch to selected.includes to make it an AND Operator
    };


    const handleResetGroup = () => {
        setGroupData({});
    };

    const handleToggleActive = (categoryId, optionId) => {
        const newGroupData = {...groupData};
        const targetCategory = newGroupData.categories.find(
            (category) => category.id === categoryId
        );
        const targetOption = targetCategory.options.find(
            (option) => option.id === optionId
        );
        targetOption.active = !targetOption.active;
        setGroupData(newGroupData);
        if (!mobile) {
            scrollToTop();
        }
    };


    const hasCategories = () => {
        if (groupData?.categories?.length) {
            const filteredCategories = groupData.categories.filter(category => category.name.toLowerCase() !== "level of study")
            return filteredCategories.length
        } else {
            return 0
        }
    }

    return mobile ? (
        <MobileFeed
            groupData={groupData}
            hasCategories={hasCategories()}
            user={authenticatedUser}
            selectedOptions={selectedOptions}
            scrollToTop={scrollToTop}
            handleResetGroup={handleResetGroup}
            searching={searching}
            livestreams={livestreams}
            listenToUpcoming
            careerCenterId={careerCenterId}
            livestreamId={livestreamId}
            alreadyJoined={groupData.alreadyJoined}
            handleToggleActive={handleToggleActive}
            userData={userData}
        />
    ) : (
        <DesktopFeed
            alreadyJoined={groupData.alreadyJoined}
            handleToggleActive={handleToggleActive}
            userData={userData}
            hasCategories={hasCategories()}
            listenToUpcoming
            livestreamId={livestreamId}
            searching={searching}
            selectedOptions={selectedOptions}
            careerCenterId={careerCenterId}
            handleResetGroup={handleResetGroup}
            user={authenticatedUser}
            livestreams={livestreams}
            mobile={mobile}
            groupData={groupData}
        />
    )
};

export default withFirebase(NextLivestreams);
