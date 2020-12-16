import { useEffect, useState, Fragment } from 'react'
import { Container, Image, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from 'context/firebase';

const SelectCompanyStep = (props) => {

    if (props.schedulingStep > 0) {
        return null;
    }
    
    const router = useRouter();
    const groupId = router.query.groupId;

    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        props.firebase.getCompanies().then(querySnapshot => {
                let companies = [];
                querySnapshot.forEach(doc => {
                    let company = doc.data();
                    company.id = doc.id;
                    companies.push(company);
                });
                setCompanies(companies);
            });
    }, []);

    function setLivestreamRequestCompany(company) {
        let requestCopy = Object.assign({}, props.livestreamRequest);
        requestCopy.company = company;
        props.setLivestreamRequest(requestCopy);
    }

    let companiesElements = companies.map( company => {
        return(
            <Grid.Column width={4}>
                <div className='company-selector' onClick={() => setLivestreamRequestCompany(company)}>
                    <Image src={company.logoUrl} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '60%', maxHeight: '50%', margin: '0 auto'}}/>
                </div>
                <style jsx>{`
                    .company-selector {
                        position: relative;
                        height: 150px;
                        border-radius: 10px;
                        background-color: white;
                        box-shadow: 0 0 2px rgb(200,200,200);
                        cursor: pointer;
                    }

                    .company-selector:hover {
                        box-shadow: 0 0 5px rgb(0, 210, 170);
                    }
                `}</style>
            </Grid.Column>
        );
    });

    return (    
            <Fragment> 
                <div>
                    <h2 className='schedule-events-label'>Which company would you like to invite?</h2>
                    <div className='internal'>
                        <Grid>
                            { companiesElements }
                        </Grid>
                    </div>
                </div>  
                <style jsx>{`
                    .hidden {
                        display: none;
                    }

                    .greyBackground {
                        background-color: rgb(250,250,250);
                        height: 100%;
                        min-height: 100vh;
                    }

                    .white-box {
                        padding: 10px;
                        margin: 10px 0 10px 0;
                        text-align: left;
                    }

                    .image-outer-container {
                        max-width: 80px;
                        margin: 0 auto;
                    }

                    .image-container {
                        position: relative;
                        width: 100%;
                        padding-top: 95%;
                        border-radius: 50%;
                        border: 5px solid rgb(0, 210, 170);
                        background-color: white;
                        margin: 0 auto;
                        box-shadow: 0 0 5px rgb(200,200,200);
                    }

                    .schedule-events-label {
                        font-weight: 300;
                        margin: 30px 0;
                    }

                    .field-error {
                        margin-top: 10px;
                        color: red;
                    }

                    .join-group-title {
                        text-align: left;
                        margin: 0 0 30px 0;
                        font-weight: 700;
                        font-size: 1.3em;
                        color: rgb(80,80,80);
                    }

                    .group-name {
                        margin: 20px 0 20px 0;
                        font-weight: 500;
                        font-size: calc(1em + 1.4vw);
                        color: rgb(80,80,80);
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
            `}</style>
        </Fragment>   
    );
};

export default withFirebase(SelectCompanyStep);