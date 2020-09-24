import {useState, useEffect, Fragment} from 'react';
import { Grid } from 'semantic-ui-react';
import JobDescription from './job-description/JobDescription';
import { withFirebase } from 'context/firebase';

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
            <Grid.Column key={index}>
                <JobDescription position={position} />
            </Grid.Column>
        );
    })

    return (
        <Fragment>
            <div className='past-livestream-jobs-container'>
                <Grid columns='3' stackable>
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