import React, {useEffect, useState, Fragment} from 'react'
import CardActions from '@material-ui/core/CardActions';
import {useRouter} from 'next/router';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withFirebase} from 'data/firebase';
import {Card, CardContent, CardMedia, Typography, Button, Grow, IconButton} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";
import Skeleton from '@material-ui/lab/Skeleton';


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
            <Grow in={Boolean(localGroup.id)} timeout={600}>
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
                        <IconButton style={{position: "absolute", top: 10, right: 10}} onClick={handleClick} size="small">
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
            </Grow>
        </Fragment>
    );
};

export default withFirebase(CurrentGroup);