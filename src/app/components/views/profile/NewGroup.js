import React, {useEffect, useState, Fragment} from 'react'
import {useRouter} from 'next/router';
import GroupAddIcon from '@material-ui/icons/GroupAdd';

import {withFirebase} from 'data/firebase';
import {Button, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import GroupJoinModal from "./GroupJoinModal";


const NewGroup = ({firebase, group, categories, userData}) => {

    const [openJoinModal, setOpenJoinModal] = useState(false);

    const router = useRouter();

    function joinGroup(group) {
        firebase.joinGroup(userData.userEmail, group.id, categories);
    }

    const closeJoinModal = () => {
        setOpenJoinModal(false)
    }

    const material = true


    return (
        <Fragment key={group.id}>
            <Card>
                <CardMedia style={{display: 'flex', justifyContent: 'center', padding: '1em'}}>
                    <img src={group.logoUrl} style={{
                        maxWidth: '50%',
                        maxHeight: '70px'
                    }} alt=""/>
                </CardMedia>
                <CardContent>
                    <Typography align="center" gutterBottom variant="h5" noWrap component="h2">
                        {group.universityName}
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" component="p">
                        {group.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button fullWidth size="small" variant="contained" color="primary"
                            endIcon={<GroupAddIcon size={20} color="inherit"/>}>
                        Join
                    </Button>
                </CardActions>
            </Card>
            <GroupJoinModal open={openJoinModal} group={group} userData={userData} closeModal={closeJoinModal}/>
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