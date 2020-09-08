import {useEffect, useState, Fragment} from 'react'
import {Button} from "@material-ui/core";
import {useRouter} from 'next/router';
import {withFirebase} from 'data/firebase';
import AddIcon from '@material-ui/icons/Add';
import {SizeMe} from 'react-sizeme';
import CurrentGroup from 'components/views/profile/CurrentGroup';
import {Grid} from "semantic-ui-react";
import StackGrid from "react-stack-grid";


const UserProfile = (props) => {


    const router = useRouter();
    const [groups, setGroups] = useState([]);
    const [adminGroups, setAdminGroups] = useState([]);
    const [grid, setGrid] = useState(null);

    useEffect(() => {
        if (grid) {
            setTimeout(() => {
                grid.updateLayout();
            }, 500);
        }
    }, [grid, groups]);

    useEffect(() => {
        if (props.userData.groupIds) {
            props.firebase.listenToJoinedGroups(props.userData.groupIds, querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenters.push(careerCenter);
                })
                setGroups(careerCenters);
            })
        }
    }, [props.userData])

    useEffect(() => {
        if (props.userData) {
            props.firebase.listenCareerCentersByAdminEmail(props.userData.id, querySnapshot => {
                let careerCenters = [];
                querySnapshot.forEach(doc => {
                    let careerCenter = doc.data();
                    careerCenter.id = doc.id;
                    careerCenters.push(careerCenter);
                })
                setAdminGroups(careerCenters);
            })
        }
    }, [props.userData])

    let existingGroupElements = [];

    if (props.userData && props.userData.groupIds) {
        existingGroupElements = groups.map(group => {
            return <CurrentGroup group={group} userData={props.userData} key={group.id}/>
        });
    }

    let adminGroupElements = [];

    if (props.userData) {
        adminGroupElements = adminGroups.map(group => {
            return <CurrentGroup isAdmin={true} group={group} userData={props.userData} key={group.id} grid={grid}/>
        });
    }

    return (
        <Fragment>
            <div className="header-wrapper">
                <h3 style={{color: 'rgb(160,160,160)', margin: '0 0 10px 0', fontWeight: '300'}}>My Groups</h3>
                <Button endIcon={<AddIcon/>} variant="contained" size='large'
                        onClick={() => router.push('/group/create')}>
                    Create a New Career Group
                </Button>
            </div>
            <Grid style={{padding: '20px 0 0 0', flexWrap: 'wrap'}} stackable>
                {existingGroupElements}
            </Grid>
            <div className={existingGroupElements.length > 0 ? 'hidden' : ''}
                 style={{margin: '30px 0', fontSize: '1.1em'}}>
                You are currently not a member of any career group.
            </div>
            <h3 style={{color: 'rgb(160,160,160)', margin: '0 0 10px 0', fontWeight: '300'}}>Admin Groups</h3>
            <SizeMe>{({size}) => (
                <StackGrid
                    columnWidth={(size.width <= 768 ? '100%' : '33.33%')}
                    gutterWidth={20}
                    gutterHeight={20}
                    gridRef={grid => setGrid(grid)}>
                    {adminGroupElements}
                </StackGrid>
            )}</SizeMe>
            <div className={adminGroupElements.length > 0 ? 'hidden' : ''}
                 style={{margin: '30px 0', fontSize: '1.1em'}}>
                You are currently not a member of any career group.
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