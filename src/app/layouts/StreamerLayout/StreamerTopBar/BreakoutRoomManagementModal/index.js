import React, {memo, useMemo} from 'react'
import PropTypes from 'prop-types'
import {CircularProgress, DialogContent, Slide} from "@material-ui/core";
import {useCurrentStream} from "../../../../context/stream/StreamContext";
import {useRouter} from "next/router";
import {isEmpty, isLoaded, useFirestoreConnect} from "react-redux-firebase";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import CreateBreakoutRoomsView from "./CreateBreakoutRoomsView";
import ManageBreakoutRoomsView from "./ManageBreakoutRoomsView";
import {GlassDialog} from "materialUI/GlobalModals";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {useTheme} from "@material-ui/core/styles";
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector";
import * as actions from 'store/actions'

const Content = ({handleClose}) => {
    console.count("-> Content");
    const {query: {livestreamId}} = useRouter()
    const {isMainStreamer} = useCurrentStream()

    const query = useMemo(() => livestreamId ? [{
        collection: "livestreams",
        doc: livestreamId,
        subcollections: [{
            collection: "breakoutRooms",
        }],
        storeAs: `breakoutRooms of ${livestreamId}`,
    }] : [], [livestreamId]);

    useFirestoreConnect(query)
    const breakoutRooms = useSelector(state =>
        breakoutRoomsSelector(state.firestore.ordered[`breakoutRooms of ${livestreamId}`]), shallowEqual
    )


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
const BreakoutRoomManagementModal = () => {
    const open = useSelector(state => state.stream.layout.streamerBreakoutRoomModalOpen)
    console.log("-> open modal Open", open);
    const theme = useTheme()
    const dispatch = useDispatch()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const onClose = () => {
        dispatch(actions.closeStreamerBreakoutModal())
    }
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

export default memo(BreakoutRoomManagementModal)