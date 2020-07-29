import { useEffect, useState } from 'react'
import { Container, Button, Image, Menu, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { withFirebase } from 'data/firebase';
import Head from 'next/head';

import Header from 'components/views/header/Header';
import Footer from 'components/views/footer/Footer';
import Events from 'components/views/group/admin/events/Events';
import Settings from 'components/views/group/admin/settings/Settings';
import Members from 'components/views/group/admin/members/Members';

const ScheduleEvent = (props) => {
    
    const router = useRouter();
    const groupId = router.query.groupId;

    const [user, setUser] = useState({});
    const [group, setGroup] = useState({});
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        props.firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            }  else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        if (groupId) {
            props.firebase.getCareerCenterById(groupId).then(querySnapshot => {
                let careerCenter = querySnapshot.data();
                careerCenter.id = querySnapshot.id;
                setGroup(careerCenter);
            });
        }        
    }, [groupId]);

    useEffect(() => {
        props.firebase.getCompanies().then(querySnapshot => {
                let companies = [];
                querySnapshot.forEach(doc => {
                    let company = doc.data();
                    companies.push(company);
                });
                setCompanies(companies);
            });
    }, []);

    let companiesElements = companies.map( company => {
        return(
            <Grid.Column width={4}>
                <div className='company-selector'>
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
            <div className='greyBackground'>
                <Head>
                    <title key="title">CareerFairy | Schedule Events</title>
                </Head>
                <Header classElement='relative white-background'/>
                <Container style={{ padding: '30px 0'}} textAlign='center'>
                    <div className='white-box'>
                        <Grid>
                            <Grid.Column width={6}>
                                <div className='image-outer-container'>
                                    <div className='image-container'>
                                        <Image style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: '0 auto 50px auto', maxHeight: '30%', maxWidth: '70%'}} src={group.logoUrl}/>
                                    </div>
                                </div>
                            </Grid.Column>
                            <Grid.Column width={10} textAlign='left'>
                                <h1 className='group-name'>{ group.universityName }</h1>
                            </Grid.Column>
                        </Grid>  
                    </div> 
                    <div>
                        <h2 className='schedule-events-label'>Schedule an Event with a Company</h2>
                        <div className='internal'>
                            <Grid>
                                { companiesElements }
                            </Grid>
                        </div>
                    </div>  
                </Container>
                <Footer/>
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
                        text-shado
                    }

                    .sublabel {
                        margin: 40px 0 15px 0;
                        text-align: center;
                    }

                    #profileContainer {
                        padding: 30px 0;
                    }
                `}</style>
            </div>
    );
};

export default withFirebase(ScheduleEvent);