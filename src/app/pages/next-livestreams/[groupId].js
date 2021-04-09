import React, {useCallback, useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {store} from "../_app";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import GroupBannerSection from "../../components/views/NextLivestreams/group/GroupBannerSection";
import useListenToGroupStreams from "../../components/custom-hook/useGroupUpcomingStreams";
import {useFirestoreConnect} from "react-redux-firebase";
import {PAST_LIVESTREAMS_NAME} from "../../data/constants/streamContants";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import {NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL} from "../../constants/routes";
import {useSelector} from "react-redux";
import {StreamsSection} from "../../components/views/NextLivestreams/StreamsSection";

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"

const GroupPage = ({serverSideGroup, livestreamId}) => {

    const classes = useStyles()
    const {palette: {common: {white}, navyBlue}} = useTheme()
    const [value, setValue] = useState(0);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const currentGroup = useSelector(state => state.firestore.data[`group ${serverSideGroup.groupId}`] || serverSideGroup)

    useFirestoreConnect(() => [{
        collection: "careerCenterData",
        doc: currentGroup.groupId,
        storeAs: "currentGroup"
    }])

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
                        backgroundImageClassName=""
                        backgroundColor={navyBlue.main}
                        groupLogo={currentGroup.logoUrl}
                        backgroundImage={placeholderBanner}
                        backgroundImageOpacity={0.2}
                        title={currentGroup.universityName}
                        subtitle={currentGroup.description}
                        handleChange={handleChange}
                        value={value}
                    />
                    <StreamsSection value={value}
                                    upcomingLivestreams={upcomingLivestreams}
                                    livestreamId={livestreamId}
                                    setSelectedOptions={setSelectedOptions}
                                    selectedOptions={selectedOptions}
                                    currentGroup={currentGroup}
                                    classes={classes}
                                    pastLivestreams={pastLivestreams}
                    />
                </div>
            </NextLivestreamsLayout>
        </React.Fragment>
    );
};

export async function getServerSideProps({params: {groupId}, query: {livestreamId}}) {
    let serverSideGroup = {}
    const snap = await store.firestore.get({collection: "careerCenterData", doc: groupId, storeAs: `group ${groupId}`})
    if (snap.exists) {
        serverSideGroup = snap.data()
    }
    return {
        props: {serverSideGroup, livestreamId: livestreamId || ""}, // will be passed to the page component as props
    }
}

export default GroupPage;


