import {useState, useEffect, Fragment} from 'react';
import JobDescription from './job-description/JobDescription';
import { withFirebase } from 'context/firebase';
import { Grid } from '@material-ui/core';

function JobDescriptions(props) {

    let [positions, setPositions] = useState([]);

    useEffect(() => {
        if (props.company) {
            props.firebase.getCompanyPositions(props.company.companyId).then( querySnapshot => {
                var positionList = [];
                querySnapshot.forEach(doc => {
    
                    let company = doc.data();
                    positionList.push(company);
                });
                setPositions(positionList);
            })
        }
    }, [props.company]);


    let positionList = positions.map((position, index) => {
        return (
            <Grid item xs={12} sm={4} key={index}>
                <JobDescription position={position} />
            </Grid>
        );
    })

    return (
        <Fragment>
            <div className='past-livestream-jobs-container'>
                <Grid container>
                    { positionList }
                </Grid>
            </div>
            <style jsx>{`
                .past-livestream-jobs-container {
                    margin-top: 10px;
                }
            `}</style>
        </Fragment>
    );
}

export default withFirebase(JobDescriptions);