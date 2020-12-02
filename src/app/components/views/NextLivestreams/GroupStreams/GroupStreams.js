import React, {useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {withFirebase} from "../../../../context/firebase";
import GroupStreamCard, {StreamCardPlaceHolder} from "./GroupStreamCard";
import {Typography, LinearProgress, Box, Button, Grid} from "@material-ui/core";
import {useRouter} from "next/router";
import GroupJoinModal from "../../profile/GroupJoinModal";
import GroupStreamCardV2 from "./groupStreamCard/GroupStreamCardV2";


const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
    },
    followButton: {
        position: "sticky",
        top: 165,
        zIndex: 101,
        marginBottom: 14
    },
    emptyMessage: {
        maxWidth: "400px",
        margin: "0 auto",
        color: "rgb(130,130,130)"
    }
}));


const GroupStreams = ({groupData, userData, user, livestreams, mobile, searching, livestreamId, careerCenterId, alreadyJoined, listenToUpcoming, selectedOptions}) => {
        const classes = useStyles()
        const router = useRouter()
        const absolutePath = router.asPath
        const [openJoinModal, setOpenJoinModal] = useState(false);
        const [hasChecked, setHasChecked] = useState(false)
        const searchedButNoResults = selectedOptions.length && !searching && !livestreams.length


        const handleCloseJoinModal = () => {
            setOpenJoinModal(false);
        };
        const handleOpenJoinModal = () => {
            setOpenJoinModal(true);
        };

        const handleJoin = () => {
            if (userData) {
                handleOpenJoinModal()
            } else {
                return router.push({pathname: "/login", query: {absolutePath}})
            }
        }

        const renderStreamCards = livestreams?.map((livestream, index) => {
            if (livestream) {
                return (
                    <Grid style={{width: "100%"}} key={livestream.id} md={12} lg={12} item>
                        <GroupStreamCardV2 livestream={livestream}/>
                        {/*<GroupStreamCard*/}
                        {/*    index={index}*/}
                        {/*    groupData={groupData}*/}
                        {/*    listenToUpcoming={listenToUpcoming}*/}
                        {/*    careerCenterId={careerCenterId}*/}
                        {/*    livestreamId={livestreamId}*/}
                        {/*    user={user} userData={userData} fields={null}*/}
                        {/*    careerCenters={[]}*/}
                        {/*    id={livestream.id}*/}
                        {/*    key={livestream.id} livestream={livestream}/>*/}
                    </Grid>
                )
            }
        })

        return (
            <div style={{padding: mobile ? 0 : "1rem"}} className={classes.root}>
                {/* {!userData?.groupIds?.includes(groupData.groupId) && !mobile && !listenToUpcoming &&
                <Button className={classes.followButton} size="large" onClick={handleJoin} variant="contained" fullWidth
                        color="primary" align="center">
                    <Typography variant="h6">Start Following {groupData.universityName}</Typography>
                </Button>} */}
                {groupData.id || listenToUpcoming ? (searching ?
                    <Box display="flex" justifyContent="center" mt={5}>
                        <LinearProgress style={{width: "80%"}} color="primary"/>
                    </Box>
                    :
                    livestreams.length ?
                        <Grid container spacing={2}>
                            {renderStreamCards}
                        </Grid>
                        :
                        <Typography className={classes.emptyMessage} align="center" variant="h5"
                                      style={{marginTop: 100}}>{searchedButNoResults ? "We couldn't find anything... 😕" :<strong>{groupData.universityName} currently has no scheduled live streams</strong>}</Typography>)
                    : null}
                <GroupJoinModal
                    open={openJoinModal}
                    group={groupData}
                    alreadyJoined={alreadyJoined}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
            </div>
        );
    }
;

export default withFirebase(GroupStreams);
