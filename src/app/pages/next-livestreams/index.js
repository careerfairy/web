import {withFirebase} from "../../context/firebase";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import {isLoaded} from "react-redux-firebase";
import {CircularProgress} from "@material-ui/core";
import useUpcomingStreams from "../../components/custom-hook/useUpcomingStreams";
import usePastStreams from "../../components/custom-hook/usePastStreams";
import NextLivestreamsBannerSection from "../../components/views/NextLivestreams/NextLivestreamsBannerSection";
import React, {useCallback, useState} from "react";
import {useTheme} from "@material-ui/core/styles";
import {StreamsSection} from "../../components/views/NextLivestreams/StreamsSection";

const placeholderBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-banners%2Fdefault-banner.svg?alt=media&token=9c53d78f-8f4d-420a-b5ef-36a8fd1c1ee0"

const nextLivestreamsPage = ({livestreamId}) => {
    const {palette: {common: {white}, navyBlue}} = useTheme()
    const upcomingLivestreams = useUpcomingStreams(livestreamId)
    const pastLivestreams = usePastStreams(livestreamId)
    console.log("pastLivestreams", pastLivestreams)
    const [value, setValue] = useState(0);

    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);

    return (
        <NextLivestreamsLayout>
            <NextLivestreamsBannerSection
                color={white}
                backgroundImageClassName=""
                backgroundColor={navyBlue.main}
                backgroundImage={placeholderBanner}
                backgroundImageOpacity={0.2}
                title={"Upcoming Streams on CareerFairy"}
                subtitle=""
                handleChange={handleChange}
                value={value}
            />
            <StreamsSection value={value}
                            upcomingLivestreams={upcomingLivestreams}
                            livestreamId={livestreamId}
                            pastLivestreams={pastLivestreams}
            />
        </NextLivestreamsLayout>
    )
};

export async function getServerSideProps({query: {livestreamId}}) {


    return {
        props: livestreamId ? {livestreamId} : {}, // will be passed to the page component as props
    }
}


export default withFirebase(nextLivestreamsPage);
