import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTheme} from "@material-ui/core/styles";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import GroupBannerSection from "../../components/views/NextLivestreams/GroupBannerSection";
import useListenToGroupStreams from "../../components/custom-hook/useGroupUpcomingStreams";
import {useFirestoreConnect} from "react-redux-firebase";
import {PAST_LIVESTREAMS_NAME} from "../../data/constants/streamContants";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import {NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL} from "../../constants/routes";
import {StreamsSection} from "../../components/views/NextLivestreams/StreamsSection";
import {useDispatch, useSelector} from "react-redux";
import * as actions from '../../store/actions'
import {getServerSideGroup, getServerSideStream} from "../../util/serverUtil";
import {getResizedUrl} from "../../components/helperFunctions/HelperFunctions";

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"

const GroupPage = ({serverSideGroup, livestreamId, serverSideStream}) => {

    const {palette: {common: {white}, navyBlue}} = useTheme()
    const [value, setValue] = useState(0);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const currentGroup = useSelector(state => state.firestore.data[`group ${serverSideGroup.groupId}`] || serverSideGroup)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(actions.closeNextLivestreamsFilter())
    }, [currentGroup.groupId])

    useFirestoreConnect(() => [{
        collection: "careerCenterData",
        doc: currentGroup.groupId,
        storeAs: "currentGroup"
    }])
    const upcomingLivestreams = useListenToGroupStreams(livestreamId, currentGroup.groupId, selectedOptions)
    const pastLivestreams = useListenToGroupStreams(livestreamId, currentGroup.groupId, selectedOptions, PAST_LIVESTREAMS_NAME)

    useEffect(() => {
        (function handleFindHighlightedStreamTab() {
            if (livestreamIdIsIn(upcomingLivestreams)) {
                setValue(0)
            } else if (livestreamIdIsIn(pastLivestreams)) {
                setValue(1)
            }
        })()
    }, [livestreamId, Boolean(upcomingLivestreams), Boolean(pastLivestreams)]);

    useEffect(() => {
        if (!livestreamId) { // Only find tab with streams if there isn't a livestreamId in query
            (function handleFindTabWithStreams() {
                if (!upcomingLivestreams?.length && pastLivestreams?.length) {
                    setValue(1)
                } else {
                    setValue(0)
                }
            })()
        }
    }, [Boolean(upcomingLivestreams), Boolean(pastLivestreams), currentGroup.groupId])

    const livestreamIdIsIn = (streams) => {
        return Boolean(streams?.some(stream => stream.id === livestreamId))
    }

    const metaInfo = useMemo(() => serverSideStream ? ({
        title: `CareerFairy | Live Stream with ${serverSideStream.company}`,
        description: serverSideStream.title,
        image: getResizedUrl(serverSideStream.backgroundImageUrl, "md"),
        fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}?livestreamId=${serverSideStream.id}`
    }) : ({
        description: currentGroup.description,
        title: `CareerFairy | Next Livestreams of ${currentGroup.universityName}`,
        image: getResizedUrl(currentGroup.logoUrl, "md"),
        fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}`,
    }), [serverSideStream])


    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);

    return (
        <React.Fragment>
            <HeadWithMeta
                {...metaInfo}
            />
            <NextLivestreamsLayout currentGroup={currentGroup}>
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
                    <StreamsSection
                        value={value}
                        upcomingLivestreams={upcomingLivestreams}
                        livestreamId={livestreamId}
                        setSelectedOptions={setSelectedOptions}
                        selectedOptions={selectedOptions}
                        currentGroup={currentGroup}
                        pastLivestreams={pastLivestreams}
                    />
                </div>
            </NextLivestreamsLayout>
        </React.Fragment>
    );
};

export async function getServerSideProps({params: {groupId}, query: {livestreamId}}) {
    const serverSideStream = await getServerSideStream(livestreamId)
    const serverSideGroup = await getServerSideGroup(groupId)
    return {
        props: {serverSideGroup, livestreamId: livestreamId || "", serverSideStream}, // will be passed to the page component as props
    }
}

export default GroupPage;


