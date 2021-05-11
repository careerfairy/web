import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {CircularProgress, DialogContent, Slide} from "@material-ui/core";
import {useCurrentStream} from "../../../../context/stream/StreamContext";
import {useRouter} from "next/router";
import {isEmpty, isLoaded, useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import CreateBreakoutRoomsView from "./CreateBreakoutRoomsView";
import ManageBreakoutRoomsView from "./ManageBreakoutRoomsView";
import {GlassDialog} from "materialUI/GlobalModals";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {useTheme} from "@material-ui/core/styles";


const Content = ({handleClose}) => {

    const {query: {livestreamId}} = useRouter()
    const {isMainStreamer} = useCurrentStream()

    const query = useMemo(() => livestreamId ? [{
        collection: "livestreams",
        doc: livestreamId,
        subcollections: [{
            collection: "breakoutRooms",
            orderBy: ["index", "asc"]
        }],
        storeAs: `breakoutRooms of ${livestreamId}`,
    }] : [], [livestreamId]);

    useFirestoreConnect(query)

    const breakoutRooms = useSelector(state => state.firestore.ordered[`breakoutRooms of ${livestreamId}`])

    if (!isLoaded(breakoutRooms)) {
        return (
            <React.Fragment>
                <DialogContent style={{minHeight: "40vh", display: "grid", placeItems: "center"}}>
                    <CircularProgress/>
                </DialogContent>
            </React.Fragment>
        )
    }

    if (isEmpty(breakoutRooms)) {
        return <CreateBreakoutRoomsView handleClose={handleClose}/>
    }

    return <ManageBreakoutRoomsView handleClose={handleClose} breakoutRooms={breakoutRooms}/>
}
export const BreakoutRoomManagementModal = ({open, onClose}) => {
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const handleClose = () => {
        onClose()
    }

    return (
        <GlassDialog TransitionComponent={Slide} fullScreen={mobile} maxWidth="md" fullWidth open={open}
                     onClose={handleClose}>
            <Content handleClose={handleClose}/>
        </GlassDialog>
    )
};

BreakoutRoomManagementModal.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
}

