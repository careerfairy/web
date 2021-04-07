import React, {useEffect, useState} from "react";
import {withFirebase} from "../../../context/firebase";
import {useMediaQuery} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import DesktopFeed from "./DesktopFeed/DesktopFeed";
import MobileFeed from "./MobileFeed";
import {useRouter} from "next/router";
import {getServerSideRouterQuery} from "../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../HOCs/AuthProvider";

const NextLivestreams = ({livestreamId, livestreams}) => {
    const {userData, authenticatedUser} = useAuth();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));
    const router = useRouter();

    const careerCenterId = getServerSideRouterQuery("careerCenterId", router)

    const [groupData, setGroupData] = useState({});
    const [selectedOptions, setSelectedOptions] = useState([]);

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

    const scrollToTop = () => {
        window.scrollTo(0, 0);
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
