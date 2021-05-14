import React, {useMemo} from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {shallowEqual, useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector";
import {useRouter} from "next/router";
import {GlassDialog} from "../../../../materialUI/GlobalModals";
import {Slide} from "@material-ui/core";
import * as PropTypes from "prop-types";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles(theme => ({}));

const Content = props => {
    return null;
};

Content.propTypes = {handleClose: PropTypes.any};
const ViewerBreakoutRoomModal = ({open, onClose}) => {

    const classes = useStyles()
    const {query: {livestreamId}} = useRouter()

    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const query = useMemo(() => livestreamId ? [{
        collection: "livestreams",
        doc: livestreamId,
        subcollections: [{
            collection: "breakoutRooms",
        }],
        storeAs: `ActiveBreakoutRooms of ${livestreamId}`,
        where: ["hasStarted", "==", true],
        limit: open ? undefined : 1
    }] : [], [livestreamId, open]);
    console.log("-> query", query);

    useFirestoreConnect(query)
    const breakoutRooms = useSelector(state =>
        breakoutRoomsSelector(state.firestore.ordered[`ActiveBreakoutRooms of ${livestreamId}`]), shallowEqual
    )

    const handleClose = () => {
        onClose()
    }


    console.log("-> Open BreakoutRooms", breakoutRooms);

    return (
        <GlassDialog TransitionComponent={Slide} fullScreen={mobile} maxWidth="md" fullWidth open={open}
                     onClose={handleClose}>
            <Content handleClose={handleClose}/>
        </GlassDialog>
    );
};

export default ViewerBreakoutRoomModal;
