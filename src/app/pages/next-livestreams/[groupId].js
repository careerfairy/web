import React, {useState} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {store} from "../_app";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import GroupBannerSection from "../../components/views/NextLivestreams/group/GroupBannerSection";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import useGroupUpcomingStreams from "../../components/custom-hook/useGroupUpcomingStreams";
import {isLoaded} from "react-redux-firebase";
import {CircularProgress} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    backgroundImage: {
        // border: "2px solid pink",
        // backgroundSize: "contain"
    }
}));

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"
const GroupPage = ({currentGroup, livestreamId}) => {

    const classes = useStyles()
    const {palette: {common: {white}, text: {primary}, navyBlue}} = useTheme()
    const [selectedOptions, setSelectedOptions] = useState([]);
    const upcomingLivestreams = useGroupUpcomingStreams(livestreamId, currentGroup.groupId, selectedOptions)

    return (
        <NextLivestreamsLayout>
            <GroupBannerSection
                color={white}
                backgroundImageClassName={classes.backgroundImage}
                backgroundColor={navyBlue.main}
                groupLogo={currentGroup.logoUrl}
                backgroundImage={placeholderBanner}
                backgroundImageOpacity={0.5}
                title={currentGroup.universityName}
                subtitle={currentGroup.description}
            />
            {!isLoaded(upcomingLivestreams) ? <CircularProgress/> : (
                <NextLivestreams
                    livestreamId={livestreamId}
                    setSelectedOptions={setSelectedOptions}
                    selectedOptions={selectedOptions}
                                 livestreams={upcomingLivestreams}
                                 currentGroup={currentGroup}/>
            )}
        </NextLivestreamsLayout>
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


