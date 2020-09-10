import {useEffect, useState, Fragment} from 'react'
import {Button, Container, Grid, Grow} from "@material-ui/core";
import {useRouter} from 'next/router';
import {withFirebase} from 'data/firebase';
import AddIcon from '@material-ui/icons/Add';
import CurrentGroup from 'components/views/profile/CurrentGroup';


const UserProfile = ({userData, firebase}) => {


    const router = useRouter();
    const [adminGroups, setAdminGroups] = useState([]);
    const [grid, setGrid] = useState(null);

    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 500);
        }
    }, [grid, userData.groupIds]);


    useEffect(() => {
        if (userData) {
            firebase.listenCareerCentersByAdminEmail(userData.id, querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenters.push(careerCenter);
                })
                setAdminGroups(careerCenters);
            })
        }
    }, [userData])

    let existingGroupElements = [];

    if (userData && userData.groupIds) {
        existingGroupElements = userData.groupIds.map(groupId => {
            return (
                <Grow key={groupId} in={Boolean(groupId)} timeout={600}>
                    <Grid item xs={12} sm={6} md={4} lg={4}>
                        <CurrentGroup groupId={groupId} userData={userData}/>
                    </Grid>
                </Grow>)
        });
    }

    let adminGroupElements = [];

    if (userData) {
        adminGroupElements = adminGroups.map(group => {
            return (
                <Grow key={group.id} in={Boolean(group)} timeout={600}>
                    <Grid item xs={12} sm={6} md={4} lg={4}>
                        <CurrentGroup isAdmin={true} group={group} userData={userData}/>
                    </Grid>
                </Grow>
            )
        });
    }

    return (
        <Fragment>
            <div>
                <div className="header-wrapper">
                    <h3 style={{color: 'rgb(160,160,160)', margin: '0 0 10px 0', fontWeight: '300'}}>My
                        Groups</h3>
                    <Button endIcon={<AddIcon/>} variant="contained" size='large'
                            onClick={() => router.push('/group/create')}>
                        Create a New Career Group
                    </Button>
                </div>
                <Container>
                    <Grid style={{marginBottom: 50}} container spacing={3}>
                        {existingGroupElements}
                    </Grid>
                </Container>
                <div className={existingGroupElements.length > 0 ? 'hidden' : ''}
                     style={{margin: '30px 0', fontSize: '1.1em'}}>
                    You are currently not a member of any career group.
                </div>
                <h3 style={{color: 'rgb(160,160,160)', margin: '0 0 10px 0', fontWeight: '300'}}>Admin
                    Groups</h3>
                <div className={adminGroupElements.length > 0 ? 'hidden' : ''}
                     style={{margin: '30px 0', fontSize: '1.1em'}}>
                    You are currently not a member of any career group.
                </div>
                <Grid style={{marginBottom: 50}} container spacing={3}>
                    {adminGroupElements}
                </Grid>
            </div>
            <style jsx>{`
                    .hidden {
                    display: none;
                    }

                    .greyBackground {
                    background-color: rgb(250,250,250);
                    height: 100%;
                    }

                    .field-error {
                    margin-top: 10px;
                    color: red;
                    }
                    .header-wrapper {
                    display: flex;
                    justify-content: space-between;
                    }

                    #profileContainer {
                    }
                    `}</style>
        </Fragment>
    );
};

export default withFirebase(UserProfile);