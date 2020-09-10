import React, {useEffect, useState, Fragment} from 'react'
import {useRouter} from 'next/router';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import {withFirebase} from 'data/firebase';
import {Button, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import GroupJoinModal from "./GroupJoinModal";


const NewGroup = ({firebase, group, categories, userData}) => {

    const [openJoinModal, setOpenJoinModal] = useState(false);

    const router = useRouter();

    const handleCloseJoinModal = () => {
        setOpenJoinModal(false)
    }
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true)
    }




    return (
        <Fragment key={group.id}>
            <Card>
                <CardMedia
                    style={{display: 'flex', justifyContent: 'center', padding: '1.5em 1em 1em 1em', height: '90px'}}>
                    <img src={group.logoUrl} style={{
                        objectFit: 'contain',
                        maxWidth: '80%'
                    }} alt=""/>
                </CardMedia>
                <CardContent style={{height: '115px'}}>
                    <Typography align="center" gutterBottom variant="h5" component="h2">
                        {group.universityName}
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" component="p">
                        {group.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    {userData.groupIds.includes(group.id) ?
                        <Button fullWidth
                                size="small"
                                variant="contained"
                                endIcon={<ExitToAppIcon size={20} color="inherit"/>}>
                            Leave
                        </Button>
                        :
                        < Button fullWidth
                                 size="small"
                                 variant="contained"
                                 color="primary"
                                 onClick={handleOpenJoinModal}
                                 endIcon={<GroupAddIcon size={20} color="inherit"/>}>
                            Join
                        </Button>}
                </CardActions>
            </Card>
            <GroupJoinModal open={openJoinModal} group={group} userData={userData} closeModal={handleCloseJoinModal}/>
            <style jsx>{`
                .group-selector {
                    position: relative;
                    height: 300px;
                    border-radius: 15px;
                    background-color: white;
                    box-shadow: 0 0 5px lightgrey;
                }
            `}</style>
        </Fragment>
    );
};

export default withFirebase(NewGroup);