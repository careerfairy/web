import React, {useMemo, useState} from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Radio,
    Select,
    Typography
} from "@material-ui/core";
import {useFirebase} from "../../../context/firebase";
import {useCurrentStream} from "../../../context/stream/StreamContext";
import {useRouter} from "next/router";
import {isEmpty, isLoaded, useFirestoreConnect} from "react-redux-firebase";
import {useDispatch, useSelector} from "react-redux";
import {streamType} from "../../../types";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import * as actions from '../../../store/actions'
import {DynamicColorButton} from "../../../materialUI/GlobalButtons/GlobalButtons";

const MAX_ROOMS = 10
const options = Array.from({length: MAX_ROOMS}, (_, i) => i + 1)
const CreateBreakoutRoomsView = ({handleClose}) => {
    const dispatch = useDispatch()
    const {query: {livestreamId}} = useRouter()
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [assignType, setAssignType] = useState("manually");
    const [loading, setLoading] = useState(false);
    const {createMultipleBreakoutRooms} = useFirebase()

    const handleChangeNumberOfRooms = (event) => {
        setNumberOfRooms(event.target.value)
    }
    const handleChangeAssignType = (value) => {
        setAssignType(value);
    };

    const handleCreateRooms = async () => {
        try {
            setLoading(true)
            await createMultipleBreakoutRooms(livestreamId, numberOfRooms)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setLoading(false)
    }

    const assignOptions = [
        {
            primaryText: "Manually",
            secondaryText: "Assign people to rooms individually",
            onClick: () => handleChangeAssignType("manually"),
            value: "manually"
        },
        {
            primaryText: "Passively",
            secondaryText: "Once created, your participants will be able to move between rooms freely",
            onClick: () => handleChangeAssignType("passively"),
            value: "passively"
        }
    ]

    return (
        <React.Fragment>
            <DialogTitle>
                Create Breakout Rooms
            </DialogTitle>
            <DialogContent dividers>
                <Box p={1}>
                    <Typography variant="h6">
                        Rooms
                    </Typography>
                    <Box display="flex" justifyContent="space-between">
                        <DialogContentText>
                            How many breakout rooms do you need?
                        </DialogContentText>
                        <FormControl>
                            <Select
                                labelId="number-of-rooms-select"
                                id="number-of-rooms-select"
                                value={numberOfRooms}
                                onChange={handleChangeNumberOfRooms}
                                // input={<OutlinedInput label="Age"/>}
                            >
                                {options.map(value =>
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
                <Divider/>
                <Box p={1}>
                    <Typography variant="h6">
                        Participants
                    </Typography>
                    <DialogContentText>
                        How do you want to assign people to rooms?
                    </DialogContentText>
                    <List>
                        {assignOptions.map(({value, secondaryText, primaryText, onClick}) => (
                            <ListItem key={value}
                                      onClick={onClick}
                                      selected={assignType === value}
                                      button>
                                <ListItemText
                                    primary={primaryText}
                                    secondary={secondaryText}
                                />
                                <ListItemIcon style={{minWidth: 0}}>
                                    <Radio
                                        checked={assignType === value}
                                        value={value}
                                        name="radio-buttons"
                                        inputProps={{'aria-label': 'A'}}
                                    />
                                </ListItemIcon>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <DynamicColorButton
                    color="primary"
                    loading={loading}
                    variant="contained"
                    onClick={handleCreateRooms}
                >
                    Create Rooms
                </DynamicColorButton>
            </DialogActions>
        </React.Fragment>
    )
}

const ManageBreakoutRoomsView = ({breakoutRooms, handleClose}) => {


    return (
        <React.Fragment>
            <DialogTitle>
                Manage Breakout Rooms - {breakoutRooms.length}
            </DialogTitle>
            <DialogContent dividers>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
            </DialogActions>
        </React.Fragment>
    )
}

ManageBreakoutRoomsView.propTypes = {
    breakoutRooms: PropTypes.arrayOf(streamType).isRequired
}

const Content = ({handleClose}) => {

    const {query: {livestreamId}} = useRouter()
    const {} = useFirebase()
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

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog maxWidth="md" fullWidth open={open} onClose={handleClose}>
            <Content handleClose={handleClose}/>
        </Dialog>
    )
};

BreakoutRoomManagementModal.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool
}

