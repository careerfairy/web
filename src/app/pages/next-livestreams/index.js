import {withFirebase} from "../../context/firebase";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import useUpcomingStreams from "../../components/custom-hook/useUpcomingStreams";
import usePastStreams from "../../components/custom-hook/usePastStreams";
import NextLivestreamsBannerSection from "../../components/views/NextLivestreams/NextLivestreamsBannerSection";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useTheme} from "@material-ui/core/styles";
import {StreamsSection} from "../../components/views/NextLivestreams/StreamsSection";
import HeadWithMeta from "../../components/page/HeadWithMeta";
import {NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL} from "../../constants/routes";
import {getServerSideStream} from "../../util/serverUtil";
import {getResizedUrl} from "../../components/helperFunctions/HelperFunctions";
import ScrollToTop from "../../components/views/common/ScrollToTop";
import PrivacyCookie from "../../components/views/common/PrivacyCookie";

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"

const nextLivestreamsPage = ({livestreamId, serverSideStream, initialTabValue}) => {
    const {palette: {common: {white}, navyBlue}} = useTheme()
    const upcomingLivestreams = useUpcomingStreams(livestreamId)
    const pastLivestreams = usePastStreams(livestreamId)
    const [value, setValue] = useState(initialTabValue || "upcomingEvents");

    useEffect(() => {
        (function handleFindHighlightedStreamTab() {
            if (livestreamIdIsIn(upcomingLivestreams)) {
                setUpcomingEvents()
            } else if (livestreamIdIsIn(pastLivestreams)) {
                setPastEvents()
            }
        })()
    }, [livestreamId, Boolean(upcomingLivestreams), Boolean(pastLivestreams)]);

    useEffect(() => {
        if (initialTabValue) {
            return
        }
        if (!livestreamId) { // Only find tab with streams if there isn't a livestreamId in query
            (function handleFindTabWithStreams() {
                if (!upcomingLivestreams?.length && pastLivestreams?.length) {
                    setPastEvents()
                } else {
                    setUpcomingEvents()
                }
            })()
        }

    }, [Boolean(upcomingLivestreams), Boolean(pastLivestreams)])

    const livestreamIdIsIn = (streams) => {
        return Boolean(streams?.some(stream => stream.id === livestreamId))
    }

    const setPastEvents = () => setValue("pastEvents")
    const setUpcomingEvents = () => setValue("upcomingEvents")
    const metaInfo = useMemo(() => serverSideStream ? ({
        title: `CareerFairy | Live Stream with ${serverSideStream.company}`,
        description: serverSideStream.title,
        image: getResizedUrl(serverSideStream.backgroundImageUrl, "lg"),
        fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}?livestreamId=${serverSideStream.id}`
    }) : ({
        description: "Catch the upcoming streams on CareerFairy.",
        title: `CareerFairy | Upcoming Livestreams`,
        image: "https://careerfairy.io/logo_teal.png",
        fullPath: `${PRODUCTION_BASE_URL}}${NEXT_LIVESTREAMS_PATH}`,
    }), [serverSideStream])

    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);

    return (
        <React.Fragment>
            <HeadWithMeta
                {...metaInfo}
            />
            <NextLivestreamsLayout>
                <NextLivestreamsBannerSection
                    color={white}
                    backgroundImageClassName=""
                    backgroundColor={navyBlue.main}
                    backgroundImage={placeholderBanner}
                    backgroundImageOpacity={0.2}
                    title={value === 0 ? "Upcoming Events on CareerFairy" : "Past Events on CareerFairy"}
                    subtitle=""
                    handleChange={handleChange}
                    value={value}
                />
                <StreamsSection
                    value={value}
                    upcomingLivestreams={upcomingLivestreams}
                    livestreamId={livestreamId}
                    listenToUpcoming
                    pastLivestreams={pastLivestreams}
                />
                <PrivacyCookie/>
            </NextLivestreamsLayout>
            <ScrollToTop/>
        </React.Fragment>
    )
};

export async function getServerSideProps({query: {livestreamId, careerCenterId, type}}) {
    if (careerCenterId) {
        let destination = livestreamId ? `/next-livestreams/${careerCenterId}?livestreamId=${livestreamId}` : `/next-livestreams/${careerCenterId}`
        return {
            props: {},
            redirect: {
                destination: destination,
                permanent: false,
            },
        }
    }
    let initialTabValue = null
    if (type === "upcomingEvents" || type === "pastEvents") {
        initialTabValue = type
    }

    const serverSideStream = await getServerSideStream(livestreamId)

    return {
        props: {serverSideStream, livestreamId: livestreamId || "", initialTabValue}, // will be passed to the page component as props
    }
}


export default withFirebase(nextLivestreamsPage);