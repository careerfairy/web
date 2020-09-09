import React, {useEffect, useState, Fragment} from 'react'
import {Container, Header as SemanticHeader, Dropdown, Form, Image, Grid} from 'semantic-ui-react';
import {Formik} from 'formik';
import {useRouter} from 'next/router';

import {withFirebase} from 'data/firebase';
import GroupJoinModal from 'components/views/profile/GroupJoinModal';
import {Button, Card, CardContent, CardMedia, Typography} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";

const NewGroup = ({firebase, group, categories, userData}) => {

    const [openJoinModal, setOpenJoinModal] = useState(false);
    const router = useRouter();

    function joinGroup(group) {
        firebase.joinGroup(userData.userEmail, group.id, categories);
    }

    const material = true


    return (
        <Fragment key={group.id}>
            {material ? <Card >
                <CardMedia
                    style={{paddingTop: '100%'}}
                    image={group.logoUrl}
                    title={`${group.universityName} logo`}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {group.universityName}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button fullWidth size="small" variant="contained" color="primary" endIcon>
                        Join
                    </Button>
                </CardActions>
            </Card> : <Grid.Column>
                <div className='group-selector'>
                    <Image src={group.logoUrl} style={{
                        position: 'absolute',
                        top: '35%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '50%',
                        maxHeight: '70px'
                    }}/>
                    <div style={{
                        position: 'absolute',
                        top: '65%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        textAlign: 'center',
                        fontSize: '1.2em',
                        fontWeight: '300',
                        color: 'rgb(80,80,80)'
                    }}>{group.description}</div>
                    <Button content='Join' icon='add' style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '20px',
                        width: '90%',
                        transform: 'translateX(-50%)'
                    }} onClick={() => router.push('/group/' + group.id)} primary/>
                </div>
            </Grid.Column>}
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