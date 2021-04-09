import {withFirebase} from "../../context/firebase";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import {isLoaded} from "react-redux-firebase";
import {CircularProgress} from "@material-ui/core";
import useUpcomingStreams from "../../components/custom-hook/useUpcomingStreams";


const nextLivestreamsPage = ({livestreamId}) => {

    const livestreams = useUpcomingStreams(livestreamId)

    return (
        <NextLivestreamsLayout>
            {!isLoaded(livestreams) ? <CircularProgress/> :
                <NextLivestreams livestreamId={livestreamId} livestreams={livestreams || []}/>}
        </NextLivestreamsLayout>
    )
};

export async function getServerSideProps({query: {livestreamId}}) {


    return {
        props: livestreamId ? {livestreamId} : {}, // will be passed to the page component as props
    }
}


export default withFirebase(nextLivestreamsPage);
