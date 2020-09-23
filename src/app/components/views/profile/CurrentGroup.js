import React, {useEffect, useState, Fragment} from 'react'
import CardActions from '@material-ui/core/CardActions';
import {useRouter} from 'next/router';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withFirebase} from 'context/firebase';
import {Card, CardContent, CardMedia, Typography, Button, Grow, IconButton, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";
import Skeleton from '@material-ui/lab/Skeleton';
import GroupJoinModal from "./GroupJoinModal";


const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        display: 'flex',
        justifyContent: 'center',
        padding: '1.5em 1em 1em 1em',
        height: '120px'
    },
    card: {
        flex: 1
    }
});

const CurrentGroup = ({firebase, userData, group, isAdmin, groupId}) => {
    const {push} = useRouter()

    const [open, setOpen] = useState(false);
    const [localGroup, setLocalGroup] = useState({})
    const [noGroup, setNoGroup] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const [leaving, setLeaving] = useState(false);
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [leaveGroup, setLeaveGroup] = useState(false)

    useEffect(() => {
        if (group) {
            setLocalGroup(group)
        }
    }, [group])

    useEffect(() => {
        if (!group) {
            const unsubscribe = firebase.listenToCareerCenterById(groupId, querySnapshot => {
                if (querySnapshot) {
                    if (querySnapshot.data()) {
                        let careerCenter = querySnapshot.data();
                        careerCenter.id = querySnapshot.id;
                        setLocalGroup(careerCenter);
                    } else {
                        setNoGroup(true)
                    }
                }
            })
            return () => unsubscribe()
        }
    }, [])

    const handleCloseJoinModal = () => {
        setOpenJoinModal(false);
    };
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true);
        setAnchorEl(null)
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const classes = useStyles()
    const router = useRouter();

    const handleDeleteCareerCenter = async () => {
        try {
            await firebase.deleteCareerCenter(group.id)
            await firebase.deleteCareerCenterFromAllUsers(group.id)
            setOpen(false)

        } catch (e) {
            console.log("error in career center deletion", e)
        }
    }
    const handleLeaveGroup = async () => {
        try {
            setLeaving(true);
            const targetGroupId = localGroup.id;
            const filteredArrayOfGroups = userData.registeredGroups.filter(
                (group) => group.groupId !== targetGroupId
            );
            const arrayOfGroupIds = filteredArrayOfGroups.map((obj) => obj.groupId);
            const userId = userData.id || userData.userEmail
            await firebase.setgroups(
                userId,
                arrayOfGroupIds,
                filteredArrayOfGroups
            );
            setLeaving(false);
            setOpen(false)
        } catch (e) {
            setLeaving(false);
            console.log("error in leaving", e);
        }
    };

    if (noGroup) {
        return null
    }

    return (
        <Fragment key={localGroup.id}>
            <Grow in={Boolean(localGroup.id)} timeout={600}>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                    <Card style={{position: "relative"}}>
                        {!localGroup.logoUrl ?
                            <Skeleton className={classes.media} animation="wave" variant="rect"/>
                            :
                            <CardMedia className={classes.media}>
                                <img src={localGroup.logoUrl} style={{
                                    objectFit: 'contain',
                                    maxWidth: '80%'
                                }} alt={`${localGroup.universityName} logo`}/>
                            </CardMedia>}
                        <CardContent style={{height: '115px'}}>
                            <Typography align="center" gutterBottom variant="h5" component="h2">
                                {localGroup.universityName}
                            </Typography>
                            <Typography align="center" variant="body2" color="textSecondary" component="p">
                                {localGroup.description}
                            </Typography>
                        </CardContent>
                        <IconButton style={{position: "absolute", top: 10, right: 10}} onClick={handleClick}
                                    size="small">
                            <MoreVertIcon/>
                        </IconButton>
                        <CardActions>
                            <Button fullWidth size="large" color="primary">
                                View Calendar
                            </Button>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => router.push('/group/' + localGroup.id)}>Group Page</MenuItem>
                                <MenuItem onMouseEnter={() => setLeaveGroup(true)} onClick={() => setOpen(true)}>Leave
                                    Group</MenuItem>
                                {localGroup.categories && <MenuItem onClick={handleOpenJoinModal}>Update</MenuItem>}
                                {isAdmin &&
                                <>
                                    <MenuItem onClick={() => push(`/group/${localGroup.id}/admin`)}>
                                        Settings
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        setOpen(true)
                                        handleClose()
                                    }}
                                              onMouseEnter={() => setLeaveGroup(false)}
                                    >Delete group</MenuItem>
                                </>}
                            </Menu>
                        </CardActions>
                    </Card>
                </Grid>
            </Grow>
            <GroupJoinModal
                open={openJoinModal}
                group={localGroup}
                alreadyJoined={userData.groupIds?.includes(localGroup.id)}
                userData={userData}
                closeModal={handleCloseJoinModal}
            />
            <AreYouSureModal
                open={open}
                handleClose={() => setOpen(false)}
                handleConfirm={leaveGroup ? handleLeaveGroup : handleDeleteCareerCenter}
                title="Warning"
                message={leaveGroup ?
                    `Are you sure you want to leave ${localGroup.universityName}'s group?`
                    :
                    `Are you sure you want to delete ${localGroup.universityName}? You wont be able to revert changes`}
            />
        </Fragment>
    );
};

export default withFirebase(CurrentGroup);