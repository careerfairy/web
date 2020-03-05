import {Icon, Grid, Container} from "semantic-ui-react";

import Link from 'next/link';

function Footer(props) {
    return (
        <div className='footer'>
        <Container>
            <Grid columns="equal" stackable>
                <Grid.Row>
                    <Grid.Column>
                        <Grid centered>
                            <Grid.Row>
                                <Grid.Column width={2}>
                                    <div className='social-icon-container'>
                                        <a href='https://www.linkedin.com/company/careerfairy/' target='_blank' rel="noopener noreferrer"><Icon name='linkedin alternate' style={{ color: 'rgb(44, 66, 81)', fontSize: '1.8em' }} size='big'/></a>
                                    </div>
                                </Grid.Column>
                                <Grid.Column width={2}>
                                    <div className='social-icon-container'>
                                        <a href='https://www.facebook.com/careerfairy' target='_blank' rel="noopener noreferrer"><Icon name='facebook' size='big' style={{ color: 'rgb(44, 66, 81)', fontSize: '1.8em' }}/></a>
                                    </div>
                                </Grid.Column>
                                <Grid.Column width={2}>
                                    <div className='social-icon-container'>
                                        <a href='https://www.instagram.com/careerfairy/' target='_blank' rel="noopener noreferrer"><Icon name='instagram' size='big' style={{ color: 'rgb(44, 66, 81)', fontSize: '1.8em' }}/></a>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <div className='name-container'>LIVE STREAMING CAREER INSPIRATION</div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <div className='footerListContainer'>
                            <div className='footerList'>
                                <div><Link href='/'><a>For Students</a></Link></div>
                                <div><a href='https://corporate.careerfairy.io/companies'>For Companies</a></div>
                                <div><a href='https://corporate.careerfairy.io/career-center'>For Career Centers</a></div>
                            </div>
                        </div>  
                    </Grid.Column>
                    <Grid.Column>
                        <div className='footerListContainer'>
                            <div className='footerList'>
                                <div><Link href='/terms'><a>Terms and Conditions</a></Link></div>
                                <div><Link href='/privacy'><a>Privacy Policy</a></Link></div>
                                <div><Link href='/cookies'><a>Cookie Policy</a></Link></div>
                            </div>
                        </div>  
                    </Grid.Column>
                    <Grid.Column>
                        <div className='footerListContainer'>
                            <div className='footerList'>
                                <div><Link href='/discover'><a>Discover</a></Link></div>
                                <div><Link href='/companies'><a>Companies</a></Link></div>
                                <div><Link href='/wishlist'><a>Wishlist</a></Link></div>
                            </div>
                        </div>      
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <div className='icons-credit'>Icons made by <a href='https://www.flaticon.com/authors/wanicon' target='_blank' rel="noopener noreferrer">wanicon</a> from <a href='https://www.flaticon.com/' target='_blank'rel="noopener noreferrer">flaticon.com</a></div>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <div>2020 - CareerFairy GmbH - All Rights Reserved - Made in Zurich, Switzerland</div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
        <style jsx>{`
            .footer {
                background-color: white;
                color: rgb(44, 66, 81);
                padding: 50px 0 50px 0;
                text-align: center;
            }

            .social-icon-container {
                width: 100%;
                text-align: center;
            }

            .social-icon-container div {
                display: inline-block;
                border-radius: 5px;
                padding: 5px;
                text-align: center;
            }

            .social-icon-container a i {
                color:rgb(44, 66, 81);
                font-size: 1.2em;
            }

            .footerListContainer {
                width: 100%;
                text-align: center;
            }

            .footerList {
                margin: 0 auto;
                list-style-type: none;
                display: inline-block;
                text-align: center;
            }

            .footerList div a {
                cursor: pointer;
                margin: 5px;
                color: rgb(44, 66, 81);
            }

            .footerList div a:hover {
                cursor: pointer;
                margin: 5px;
                color: rgb(25, 37, 46);
            }

            .name-container {
                text-align: center;
                font-weight: 600;
                font-size: 1.2em;
                color: rgb(44, 66, 81);
                letter-spacing: 3px;
                margin: 20px 0 20px 0;
            }

            .icons-credit {
                margin-top: 30px;
                font-size: 0.85em;
            }
        `}</style>
    </div>
    );
}

export default Footer;