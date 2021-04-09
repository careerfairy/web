import React, {useCallback, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {store} from "../_app";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import GroupBannerSection from "../../components/views/NextLivestreams/group/GroupBannerSection";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import useListenToGroupStreams from "../../components/custom-hook/useGroupUpcomingStreams";
import {isLoaded} from "react-redux-firebase";
import {CircularProgress} from "@material-ui/core";

import {SwipeablePanel} from "../../materialUI/GlobalPanels/GlobalPanels";
import {PAST_LIVESTREAMS_NAME} from "../../data/constants/streamContants";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import {NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL} from "../../constants/routes";

const useStyles = makeStyles(theme => ({
    backgroundImage: {
        // border: "2px solid pink",
        // backgroundSize: "contain"
    },
    swipeableContainer: {
        "& > div": {
            border: "2px solid green",
            minHeight: "50vh",
        }
    },
    spinner:{
        margin: "auto"
    }
}));

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"
const GroupPage = ({currentGroup, livestreamId}) => {

    const classes = useStyles()
    const {palette: {common: {white}, text: {primary}, navyBlue}, direction} = useTheme()
    const [value, setValue] = useState(0);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const upcomingLivestreams = useListenToGroupStreams(livestreamId, currentGroup.groupId, selectedOptions)
    const pastLivestreams = useListenToGroupStreams(livestreamId, currentGroup.groupId, selectedOptions, PAST_LIVESTREAMS_NAME)

    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);


    return (
        <React.Fragment>
            <HeadWithMeta
                description={currentGroup.description}
                title={`CareerFairy | Next Livestreams of ${currentGroup.universityName}`}
                image={currentGroup.logoUrl}
                fullPath={`${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}`}
            />
        <NextLivestreamsLayout>
            <div>
                <GroupBannerSection
                    color={white}
                    backgroundImageClassName={classes.backgroundImage}
                    backgroundColor={navyBlue.main}
                    groupLogo={currentGroup.logoUrl}
                    backgroundImage={placeholderBanner}
                    backgroundImageOpacity={0.5}
                    title={currentGroup.universityName}
                    subtitle={currentGroup.description}
                    handleChange={handleChange}
                    value={value}
                />
                <div style={{minHeight: "50vh"}}>
                <SwipeablePanel value={value} index={0} dir={direction}>
                    {isLoaded(upcomingLivestreams) ? (
                        <NextLivestreams
                            livestreamId={livestreamId}
                            setSelectedOptions={setSelectedOptions}
                            selectedOptions={selectedOptions}
                            livestreams={upcomingLivestreams || []}
                            currentGroup={currentGroup}/>
                    ) : (
                        <CircularProgress className={classes.spinner} color="primary"/>
                    )}
                </SwipeablePanel>
                <SwipeablePanel value={value} index={1} dir={direction}>
                    {isLoaded(pastLivestreams) ? (
                        <NextLivestreams
                            livestreamId={livestreamId}
                            setSelectedOptions={setSelectedOptions}
                            selectedOptions={selectedOptions}
                            isPastLivestreams
                            livestreams={pastLivestreams || []}
                            currentGroup={currentGroup}/>
                    ) : (
                        <CircularProgress className={classes.spinner} color="primary"/>
                    )}
                </SwipeablePanel>
                </div>
            </div>
        </NextLivestreamsLayout>
        </React.Fragment>
    );
};

export async function getServerSideProps({params: {groupId}, query: {livestreamId}}) {
    let currentGroup = {}
    const snap = await store.firestore.get({collection: "careerCenterData", doc: groupId})
    if (snap.exists) {
        currentGroup = snap.data()
    }
    return {
        props: {currentGroup, livestreamId: livestreamId || ""}, // will be passed to the page component as props
    }
}

export default GroupPage;


