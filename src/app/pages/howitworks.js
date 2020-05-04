import { Fragment, useEffect, useRef, useState } from "react";
import {Container, Grid, Image, Button, Icon} from "semantic-ui-react";

import { withFirebase } from '../data/firebase/FirebaseContext';
import { useRouter } from 'next/router';
import { compose } from 'redux';
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import { urlObjectKeys } from "next/dist/next-server/lib/utils";

import Head from 'next/head';

function HowItWorks(props) {

    const [companies, setCompanies] = useState([]);
    const topPicture = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/landing%20photos%2Fstream-mobile.png?alt=media";
    const secondPicture = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Finteract.png?alt=media";

    useEffect(() => {
        props.firebase.getCompanies().then( querySnapshot => {
            var companiesList = [];
            querySnapshot.forEach(doc => {
                let companies = doc.data();
                companies.id = doc.id;
                companiesList.push(companies);
            });
            setCompanies(companiesList);
        });
    }, []);

    let companyPreviewElements = companies.filter(company => company.rank === 1).map( (company, index) => {
        return (
            <Grid.Column computer='2' mobile='3' key={index}>
                <div className='overviewPreviewLogoContainer'>
                    <div>
                        <Image style={{ maxHeight: '40px', filter: 'brightness(0) invert(0.9)', margin: '0 auto' }} src={company.logoUrl}/>
                    </div>
                        <style jsx>{`
                            .overviewPreviewLogoContainer div {
                                width: 80%;
                                margin: 0 auto;
                                text-align: center;
                                padding: 20px 0;
                            }
                        `}</style>
                </div>
            </Grid.Column>
        );
    })

    function goToRoute(route) {
        router.push(route);
    }

    return (
        <Fragment>
            <Head>
                <title key="title">CareerFairy | How it works</title>
            </Head>
            <Header color='teal'/>
            <div className='introFullPage' style={{ backgroundImage: 'url(' + topPicture + ')' }}>
                <div className='intro-mask'>
                    <Container>
                        <div className='mainTagline'>
                            <h1>Watch and interact with employees from great companies</h1>
                        </div>
                    </Container>   
                </div>
            </div>
            <div className='top-icons'>
                <Container>
                    <div className='company-icons-label'>What is CareerFairy?</div>
                    <div className='company-icons-sublabel'>From your laptop or smartphone, meet employees who share your background.<br/> Ask any question and get the answer during the livestream!</div>
                    <Image id='meet-companies-image' style={{ width: '80%', maxWidth: '900px', margin: '0 auto 50px auto'}} src={secondPicture}/>
                    <div className='company-icons-sublabel'>Discover their work, see their office, get answers to all your questions and find out how you could join them in the future.</div>
                    <Grid centered textAlign='center'>
                    </Grid>
                </Container>     
            </div>
            <div className='company-icons'>
                <Container>
                <div className='company-icons-label'>How it works</div>
                <Grid stackable centered>
                        <Grid.Row>
                            <Grid.Column textAlign='center' style={{ padding: '0 25px' }} width={4}>
                                <h1 style={{ fontSize: '4em', color: 'rgb(0, 210, 170)'}}>1</h1>
                                <h2 className='careerStep'>Register to your favorite events</h2>
                                {/* <Image className='stepImage' src={planning} style={{ width: '40%', margin: '30px auto'}}/> */}
                                <div>We’ll notify you shortly before the live stream starts to ensure that you don’t miss anything!</div>                
                            </Grid.Column>
                            <Grid.Column textAlign='center' style={{ padding: '0 25px' }} width={4}>
                                <h1 style={{ fontSize: '4em', color: 'rgb(0, 210, 170)'}}>2</h1>
                                <h2 className='careerStep'>Join live stream & ask questions</h2>
                                {/* <Image className='stepImage' src={digitalMarketing}  style={{ width: '40%', margin: '30px auto'}}/> */}
                                <div>Be anonymous or show the company that you’re interested. Ask your written questions or just listen to the speaker. It’s up to you.</div>
                            </Grid.Column>
                            <Grid.Column textAlign='center' style={{ padding: '0 25px' }} width={4}>
                                <h1 style={{ fontSize: '4em', color: 'rgb(0, 210, 170)'}}>3</h1>
                                <h2 className='careerStep'>If convinced, join the talent pool</h2>
                                {/* <Image className='stepImage' src={value}  style={{ width: '40%', margin: '30px auto'}}/> */}
                                <div>In one click, let the company know you’re interested and be contacted if there’s an opportunity for you at any point in the future.</div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>     
            </div>
            <div className='company-icons'>
                <Container>
                    <div className='company-icons-label' style={{ margin: '60px 0'}}>FAQ</div>
                    <div className='company-faq-title'>Where the hell will my data go?</div>
                    <div className='company-faq-answer'>Very good question! We know that you don’t want to be spamed by recruiters. That is why we will only share your data with companies that you explicitely name us and we will remind you every time that you are about to do so.</div>
                    <div className='company-faq-title'>Will I be filmed during the live stream?</div>
                    <div className='company-faq-answer'>No, this is not a skype call! Live streams are video broadcast of the employees (generally through their webcam at their office) set in an informal and authentic atmosphere. You can send your written questions  and upvote questions from your peers, before and during the stream. This ensures that the stream is as relevant as possible for the entire community.</div>
                    <div className='company-faq-title'>What do I need to take part in the stream?</div>
                    <div className='company-faq-answer'>Just your laptop! Open the live stream in your browser and start engaging with our streamers. You can also use your smartphone’s browser, but the experience might not be optimal yet. </div>
                </Container>     
            </div>
            <style jsx>{`
                .introFullPage {
                    position: relative;
                    width: 100%;
                    padding-top: 40%;
                    min-height: 400px;
                    box-shadow: 0 0 5px grey;
                    background-size: cover;
                    background-position: center center;
                }

                .intro-mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    background-color: rgba(0, 210, 170, 0.8);
                }

                .mainTagline {
                    position: absolute;
                    width: 90%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .mainTagline h1 {
                    color: white;
                    font-size: calc(1.2em + 2vw);
                    font-weight: 700;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .mainTagline h3 {
                    color: white;
                    font-size: 1.7em;
                    text-align: center;
                    font-weight: 300;
                }

                .previewLogos {
                    width: 100%;
                    position: absolute;
                    bottom: 10px;
                    left: 0;
                    text-align: center;
                    color: white;
                }

                .company-faq-title {
                    font-size: 1.7em;
                    margin: 50px 0 30px 0;
                }

                .company-faq-answer {
                    font-size: 1.3em;
                    color: grey;
                    width: 80%;
                    margin: 0 auto;
                    line-height: 1.7em;
                }

                .overviewLogoContainer {
                    width: 100%;
                }

                .overviewLogoContainer div {
                    width: 70%;
                    margin: 0 auto;
                    text-align: center;
                    padding: 20px 0;
                }

                #landing-video {
                    min-width: 100%;
                    min-height: 100%;

                    width: auto;
                    height: auto;

                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    z-index: -9999;
                    background-color: black;
                }

                .company-icons {
                    margin: 70px 0;
                    width: 100%;
                    text-align: center;
                }

                .company-icons-label {
                    margin: 80px 0 60px 0;
                    font-size: 2em;
                    line-height: 1.4em;
                    font-weight: 500;
                    text-align: center;
                    color: rgb(0, 210, 170);
                }

                .company-icons-sublabel {
                    width: 80%;
                    margin: 0 auto 40px auto;
                    font-size: 1.5em;
                    line-height: 1.5em;
                    font-weight: 300;
                    text-align: center;
                }

                .noSpeakerSelected {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-transform: uppercase;
                    font-size: 1.2em;
                    font-weight: 700;
                    padding: 30px 0;
                    color: white;
                    width: 100%;
                    text-align: center;
                }

                .noSpeakerSelected span {
                    margin: 0 10px;
                }

                .speakerDetailsWindow {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    z-index: 9999;
                    box-shadow: 0 0 5px grey;
                    background-color: white;
                    padding: 30px 0;
                    margin: 0 auto;
                    background-color: rgb(0, 210, 170);
                }

                .fixedContainer {
                    max-width: 150px;
                    padding: 0;
                }

                .stepImageFixed {
                    width: 100px;
                    height: 100px;
                    max-width: 100%;
                    max-height: 100%;
                    background-size: cover;
                    background-position: center center;
                    border-radius: 50%;
                    margin: 0 auto;
                    box-shadow: 0 0 2px grey;
                }

                .overviewPreviewLogoContainer div {
                    width: 80%;
                    margin: 0 auto;
                    text-align: center;
                    padding: 20px 0;
                }

                .stepMentorDescription {
                    color: white;
                    font-weight: 700;
                    font-size: 1.2em;
                }

                .stepMentorDescription .light {
                    font-weight: 300;
                }

                .hidden {
                    display: none
                }
            `}</style>
            <Footer/>
        </Fragment>
    );
}

export default withFirebase(HowItWorks);