import React, {useEffect} from "react";

import Header from "components/views/header/Header";
import { Container, Typography, Button } from "@material-ui/core";
import TransparentHeaderWithLinks from "../header/misc/TransparentHeaderWithLinks";

function CompanyLandingPage(props) {

    useEffect(() => {
            registerEventListenersForVideoPlayback();
        return () => {
            unregisterEventListenersForVideoPlayback();
        };
    });

    function registerEventListenersForVideoPlayback() {
        let scrollEvents = ['scroll', 'touchmove', 'wheel'];
        scrollEvents.forEach( event => {
            window.addEventListener(event, playVideoInFirstSection);
        });
    }

    function unregisterEventListenersForVideoPlayback() {
        let scrollEvents = ['scroll', 'touchmove', 'wheel'];
        scrollEvents.forEach( event => {
            window.removeEventListener(event, playVideoInFirstSection);
        });
    }

    function playVideoInFirstSection() {
        let video = document.getElementById("background-video");
        if (props.fullpageApi && props.fullpageApi.getActiveSection().isFirst && video.paused) {
            video.play();
        }
    }

    return (
        <div id='landingSection'>
            <div className='mask'>
                <TransparentHeaderWithLinks/>
                <div className='maskContent'>
                    <Container className="titleContainer" style={{ paddingTop: '8%', position: 'relative', color: 'white', minHeight: 'calc(100vh - 100px)', textAlign: 'center' }}>
                        <Typography variant='h1' style={{ color: 'white', fontSize: '4.5vw', fontFamily: '"Poppins", sans-serif', fontWeight: '500', margin: 50 }}>
                            { props.company.name }
                        </Typography>
                        <Typography variant='h3' style={{ color: 'white', fontSize: '1.4em', fontFamily: '"Poppins", sans-serif' }}>
                            { props.company.headline }
                        </Typography>
                        <Typography variant='h5' id='headline' style={{ color: 'white', fontSize: '1.2em', fontWeight: '200', width: '60%', fontFamily: '"Poppins", sans-serif', margin: '5% auto 5% auto' }}>
                            { props.company.description }
                        </Typography>
                        <Button style={{ display: 'inline', width: '55%', margin: '5px auto' }} size='large' color='primary' variant='outlined' onClick={() => props.scrollToSecond()}>Discover {props.company.name}</Button>
                        <Button style={{ display: 'inline', width: '55%', margin: '5px auto' }} color='primary' size='large' variant='contained' onClick={() => props.scrollToThird()}>Watch {props.company.name}</Button>
                    </Container>
                </div>
                <video id="background-video" key={props.company.backgroundUrl} autoPlay muted loop playsInline>
                    <source src={props.company.backgroundUrl} type="video/mp4"/>
                </video>
            </div>
            <style jsx>{`
                    .mask {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    background-color: rgba(10,10,10,0.67);
                    text-align: center;
                }

                #companySelector {
                    float: right;
                    display: inline-block;
                }

                .titleContainer {
                    padding-top: 3%;
                    position: relative;
                    color: white;
                    min-height: calc(100vh - 200px);
                }

                .titleContainer #mainTitle {
                    color: white;
                    font-size: 3.5vw;
                    font-family: 'Poppins', sans-serif;
                }

                .titleContainer #subTitle {
                    color: white;
                    font-size: 1.4em;
                    font-family: 'Poppins', sans-serif;
                }

                .titleContainer #headline {
                    color: white;
                    width: 60%;
                    font-weight: 200;
                    font-size: 1.2em;
                    font-family: 'Poppins', sans-serif;
                    margin: 5% auto 5% auto;
                }

                .titleFooter {
                    cursor: pointer;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                }

                .titleFooter #footer, .landingFooter #footer {
                    font-family: 'Poppins', sans-serif;
                    font-size: 1.3em;
                    color: white;
                    margin-bottom: 0;
                }

                .titleFooter #footer_icon, .landingFooter #footer_icon {
                    color: white;
                    margin-bottom: 10px;
                }

                #landingSection {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                #background-video {
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

                .companySwitcher {
                    position: absolute;
                    color: white;
                    font-family: 'Poppins', sans-serif;
                    cursor: pointer;

                    top: 50%;
                    transform: translateY(-50%);
                    -ms-transform: translateY(-50%);
                    -moz-transform: translateY(-50%);
                    -webkit-transform: translateY(-50%);
                    -o-transform: translateY(-50%);
                }

                .companySwitcher.left {
                    left: 0;

                }

                .companySwitcher.right {
                    right: 0;
                }

                #discover_button, #watch_button {
                    display: inline;
                    width: 55%;
                    margin: 5px auto;
                }

                @media screen and (max-width: 992px) {
                    .companySwitcher {
                        top: 95%;
                    }

                    .titleContainer #mainTitle {
                        font-size: 4em;
                    }

                    .titleContainer #subTitle {
                        font-size: 1.2em;
                    }

                    .titleContainer #headline {
                        width: 70%;
                        font-size: 1em;
                    }
                }

                @media screen and (max-width: 600px) {
                    .companySwitcher span {
                        display: none;
                    }

                    .titleContainer {
                        margin-top: 20%;
                    }

                    .titleContainer #mainTitle {
                        font-size: 2.5em;
                    }

                    .titleContainer #subTitle {
                        font-size: 1em;
                    }

                    .titleContainer #headline {
                        width: 80%;
                        font-size: 1em;
                    }

                    .titleFooter #footer {
                        font-size: 1.3em;
                    }
                }
            `}</style>
        </div>
    );
}

export default CompanyLandingPage;