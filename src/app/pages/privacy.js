import Header from "../components/views/header/Header";
import { withFirebase } from '../context/firebase';

import Head from 'next/head';
import { Container } from "@material-ui/core";

const PrivacyPolicy = (props) => {
    return (
        <div>
            <Head>
                <title key="title">CareerFairy | Privacy Policy</title>
            </Head>
            <Header color="teal"/>
            <div className='cookies-background'>
                <Container>
                <h1>Privacy policy</h1> 
                <p>Welcome to CareerFairy!  CareerFairy is an online platform that is designed to build a bridge between the new generation of talents and employees at work.  It is owned and operated by CareerFairy GmbH, a Swiss limited liability company, based at Zurlindenstrasse 45, Zurich, Switzerland.  In this Privacy Policy, CareerFairy GmbH will be referred to as “CareerFairy” or “we”, and the user of the website located at <a href='https://careerfairy.io'>https://careerfairy.io</a> (CareerFairy Website) will be referred to as “user” or “you”.</p>
                    <p>This Privacy Policy explains the choices you have regarding our use of your personal information (<em>personal data</em>) and how you can access and update this information on the CareerFairy Website.  CareerFairy is the data controller for the purposes of this data protection policy.</p>
                    <h2>Automatic collection of information</h2>
                    <p>When you visit the Website our servers automatically record information that your browser sends. This data may include information such as your device's IP address, browser type and version, operating system type and version, language preferences or the webpage you were visiting before you came to our Website, pages of our Website that you visit, the time spent on those pages, information you search for on our Website, access times and dates, and other statistics.</p>
                    <p>This information is used only to identify potential abuse and to gather statistical information about usage of the CareerFairy Website. This statistical information is not aggregated in a way that would identify individual visitors to the CareerFairy Website.</p>
                    <h2>Collection of personal data</h2>
                    <p>You can visit the CareerFairy Website without revealing any information by which we or anyone else could identify you. If, however, you wish to create or log in to an account on the CareerFairy Website, you will be asked to provide the following personal data:</p>
                    <ul>
                        <li>First name</li>
                        <li>Family name</li>
                        <li>Email address</li>
                        <li>Study subject</li>
                        <li>Level of qualification you are studying for (BSc / MSc / PhD)</li>
                        <li>University you are studying at</li>
                    </ul>
                    <p>You can choose not to provide us with personal data, but then you will not be able to create an account, upload your CV, be notified of scheduled livestreams or rewatch past livestreams.</p>
                    <h2>Managing personal data</h2>
                    <p>If you would like to update or your profile information, you can do so by directly amending the information in the “My Profile” section of your account. If you would like to delete your personal data or permanently delete your account, you can do so by contacting us by email at privacy@careerfairy.io</p>
                    <h2>Storing personal data</h2>
                    <p>We will keep and use your personal data for as long as we need to for compliance with our legal obligations, to resolve disputes, and enforce our agreements.</p>
                    <p>Any data we do hold onto will be anonymous. Any personally identifiable information such as your name and e-mail address will be deleted after a defined period. The rest of the data is therefore anonymous and will be used to analyse general market and website trends but without an identifiable personal information.</p>
                    <p>When creating an account on CareerFairy, we will hold on to your personal data for a maximum duration of 36 months after your last participation in a Career Live Stream, as most students will have completed their studies by then. After this period, we will delete your personal data and your personal account.</p>
                    <h2>Use and processing of collected data</h2>
                    <p>The personal data we hold about you is collected directly from you.  We may use it for the following purposes:</p>
                    <ul>
                    <li>To create and manage your account on the CareerFairy Website</li>
                    <li>To send you information about forthcoming livestream events</li>
                    <li>To respond to your enquiries and offer support</li>
                    <li>To request your feedback on our service</li>
                    <li>To improve your user experience</li>
                    <li>To ensure that your account is kept up to date</li>
                    <li>To provide information about you to potential employers, with your permission</li>
                    </ul>
                    <h2>Transfer and storage of personal data</h2>
                    <p>Personal data collected by CareerFairy are transferred to and stored on a secure server in Frankfurt am Main, Germany.  The server is hosted by Google Germany GmbH which safeguards personal data in accordance with CareerFairy’s instructions.</p>
                    <h2>Sharing your data with potential employers</h2>
                    <p>If you agree to share your personal data with a potential employer, CareerFairy will transfer a copy of your personal data to that employer.</p>
                    <p>We work with employers both within and outside the European Economic Area, Switzerland and the United Kingdom.  Employers within the European Economic Area, Switzerland and the United Kingdom are subject to the same or similar data protection rules as CareerFairy.  Employers outside these countries, however, may not be subject to data protection rules</p>
                    <p>Where we work with an employer located outside the European Economic Area, Switzerland and the United Kingdom, we take appropriate steps to ensure that they protect your personal data.  These steps may include: </p>
                    <ul>
                    <li>signing a contract which requires the protection of your personal data in accordance with the standards that apply in your home country.</li>
                    <li>a code of conduct approved by a data protection authority located in the EU.</li>
                    <li>requiring an approved certification such as the EU-US or Switzerland-US Privacy Shield.</li>
                    </ul>
                    <p>If you do not want your personal data to be shared with potential employers outside the European Economic Area, Switzerland and the United Kingdom, please do not sign up for those employers’ talent pools.</p>
                    <p>We will not share your personal data with any potential employer unless you have given your consent by joining the talent pool of a specific company. If you change your mind, you can untick the box at any time.</p>
                    <p>Once a potential employer has a copy of your personal data, the employer is responsible for its own handling of that personal data.  If you have concerns about the privacy practices of a potential employer, or if you wish to have your personal data deleted from the records of a potential employer, please contact that employer directly.</p>
                    <h2>Your rights</h2>
                    <ul style={{ listStyleType: 'none' }}>
                    <p>You have the following rights over your personal data that we process.  In particular, you have the right to:</p>
                        <li>(i)	withdraw consent to processing for which you have previously given consent; </li>
                        <li>(ii)	object to processing which we carry out on a legal basis other than consent; </li>
                        <li>(iii)	request confirmation of whether we are processing your personal data; </li>
                        <li>(iv)	receive a  copy of your personal data processed by us;</li>
                        <li>(v)	ask why we are processing your personal data, to whom we have disclosed it and which countries they are in, </li>
                        <li>(vi)	know how long we will keep your personal data; </li>
                        <li>(vii)	check the accuracy of your personal data and ask us to update or correct it; </li>
                        <li>(viii)	complain to a data protection authority about our data processing;</li>
                        <li>(ix)	request that we delete your personal data if we are processing it illegally, if we no longer need it, or if you object to us processing it for marketing purposes; and</li>
                        <li>(x)	ask that we transfer your personal data to another data controller.</li>

                    </ul>
                    <h2>How to exercise your rights</h2>
                    <p>If you wish to exercise any of these rights, please notify us at <a href='mailto:privacy@careerfairy.io'>privacy@careerfairy.io</a>. In addition, if you no longer want us to process your personal data, you can delete your account at any time by sending us an e-mail at privacy@careerfairy.io. Deleting your account will erase all copies of your personal data collected via the CareerFairy Website.</p>
                    <h2>Children</h2>
                    <p>We do not knowingly collect any personal data from children. If you are under the age of 18, please do not create an account on the CareerFairy Website.</p>
                    <h2>Aggregated data</h2>
                    <p>We may use aggregated and anonymous data derived from or incorporating your personal data after you update or delete it, as long as we are no longer able to identify you.</p>
                    <h2>Mailshots</h2>
                    <p>We offer mailshots as part of our service.  All e-mails sent from CareerFairy will clearly state who the e-mail is from and provide clear information on how to contact the sender.  You may choose to stop receiving our marketing emails by altering the privacy settings in your account or by contacting us at privacy@careerfairy.io. However, you will continue to receive essential transactional emails unless you delete your account.</p>
                    <h2>Cookies</h2>
                    <p>A cookie is a text file that is placed on your computer by a web server.  Cookies cannot be used to run programs or to deliver viruses to your computer. Cookies are uniquely assigned to your computer, and can only be read by a web server in the domain that issued the cookie to your computer.</p>
                    <p>The CareerFairy Website uses the following cookies:</p>
                    <h2>The Cookies We Set</h2>
                    <ul>
                        <li><h3>Account related cookies</h3></li>
                        <p>If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.</p>
                        <li><h3>Login related cookies</h3></li>
                        <p>We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.</p>
                        <li><h3>Forms related cookies</h3></li>
                        <p>When you submit data to through a form such as those found on contact pages or comment forms cookies may be set to remember your user details for future correspondence.</p>
                        <li><h3>Site preferences cookies</h3></li>
                        <p>In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this information can be called whenever you interact with a page is affected by your preferences.</p>
                    </ul>
                    <h2>Third Party Cookies</h2>
                    <p>In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.</p>
                    <ul>
                        <li><p>This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</p></li>        
                    </ul>
                    <p>For more information on Google Analytics cookies, see the official Google Analytics page.</p>
                    <p>You can accept or decline cookies, but if you choose to decline cookies, some parts of the CareerFairy Website may not work properly on your computer. To learn more about cookies and how to manage them, visit <a href='https://www.allaboutcookies.org'>allaboutcookies.org</a>. </p>
                    <h2>Do Not Track signals</h2>
                    <p>Some browsers incorporate a Do Not Track feature that signals to websites you visit that you do not want to have your online activity tracked. The CareerFairy Website does not track its visitors over time or across third party websites.</p>
                    <h2>Links to other websites</h2>
                    <p>The CareerFairy Website contains links to websites that are not owned or controlled by us. We are not responsible for the privacy practices of third parties’ websites and recommend that you review the privacy policies of those websites before you start to browse them.</p>
                    <h2>Security and performance</h2>
                    <p>We use Google Firebase to help maintain the security and performance of the CareerFairy website.</p>
                    <h2>Data breach</h2>
                    <p>If the security of the CareerFairy Website is compromised or your personal data is disclosed to third parties as a result of external activity, including, but not limited to, security attacks or fraud, we will  take appropriate measures including, but not limited to, investigation and reporting, as well as notification to and cooperation with data protection authorities as required by law.  We will notify you by email if we believe that there is a significant risk of harm to you as a result of the breach.</p>
                    <h2>Disclosure of personal data</h2>
                    <p>If we are required to disclose your personal data in connection with a request by a government authority we will – provided that we are permitted to do so – notify you first.</p>
                    <h2>Changes to this Privacy Policy</h2>
                    <p>We keep this Privacy Policy under regular review to ensure that it is up to date and correct.</p>
                    <p>This document was last updated on February 22nd, 2020.</p>
                    <h2>Contacting us</h2>
                    <p>If you would like to contact us to understand more about this Privacy Policy or to exercise any of the rights described in it, please send an email to privacy@careerfairy.io.  </p>
                </Container>
            </div>
            <style jsx>{`
                .cookies-background {
                    background-color: rgb(253,253,253);
                    padding: 30px 0;
                    color: rgb(60,60,60);
                }

                .cookies-background li {
                    margin-bottom: 10px;
                }

                .cookies-background h1 {
                    color: rgb(0, 210, 170);
                }
            `}</style>
        </div>
    );
}

export default withFirebase(PrivacyPolicy);