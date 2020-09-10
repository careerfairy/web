import React, {useEffect, useState, Fragment} from 'react'
import CardActions from '@material-ui/core/CardActions';
import {Dropdown, Image, Grid} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withFirebase} from 'data/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';

import {Card, CardContent, CardMedia, Typography, Button, Grow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        paddingTop: '100%',
    },
    card: {
        flex: 1
    }
});

const CurrentGroup = ({firebase, userData, group, isAdmin, groupId}) => {
    const {push} = useRouter()

    const [open, setOpen] = useState(false);
    const [localGroup, setLocalGroup] = useState({})

    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (group) {
            setLocalGroup(group)
        }
    }, [group])

    useEffect(() => {
        if (!group) {
            const unsubscribe = firebase.listenToCareerCenterById(groupId, querySnapshot => {
                if (querySnapshot) {
                    let careerCenter = querySnapshot.data();
                    console.log("careerCenter in snapshot", careerCenter);
                    careerCenter.id = querySnapshot.id;
                    setLocalGroup(careerCenter);
                }
            })
            return () => unsubscribe()
        }
    }, [])


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

    return (
        <Fragment key={localGroup.id}>
            <Card>
                <CardMedia
                    className={classes.media}
                    image={localGroup.logoUrl}
                    title={`${localGroup.universityName} logo`}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {localGroup.universityName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {localGroup.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button fullWidth size="small" color="primary">
                        View Calendar
                    </Button>
                    <Button onClick={handleClick} size="small" color="primary">
                        <MoreVertIcon/>
                    </Button>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => push(`/group/${localGroup.id}/admin`)}>Update my data</MenuItem>
                        <MenuItem onClick={() => router.push('/group/' + localGroup.id)}>Group Page</MenuItem>
                        {isAdmin ?
                            <MenuItem onClick={() => {
                                setOpen(true)
                                handleClose()
                            }}>Delete group</MenuItem>
                            :
                            <MenuItem onClick={handleClose}>Leave group</MenuItem>}
                        <AreYouSureModal
                            open={open}
                            handleClose={() => setOpen(false)}
                            handleConfirm={handleDeleteCareerCenter}
                            title="Warning"
                            message={`Are you sure you want to delete ${localGroup.universityName}? You wont be able to revert changes`}
                        />
                    </Menu>
                </CardActions>
            </Card>
            <style jsx>{`
                .group-selector {
                    position: relative;
                    border-radius: 15px;
                    background-color: white;
                    box-shadow: 0 0 2px lightgrey;
                    padding: 30px 30px 100px 30px;
                }
            `}</style>
        </Fragment>
    );
};

export default withFirebase(CurrentGroup);