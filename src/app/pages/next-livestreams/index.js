import {withFirebase} from "../../context/firebase";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";
import {isEmpty, isLoaded, useFirestoreConnect} from "react-redux-firebase";
import {createSelector} from "reselect";
import {repositionElement, repositionStream} from "../../components/helperFunctions/HelperFunctions";
import {useSelector} from "react-redux";
import {store} from "../_app";
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
