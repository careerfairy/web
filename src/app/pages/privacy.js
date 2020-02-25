import { Container } from 'semantic-ui-react'

import Header from "../components/views/header/Header";
import { withFirebase } from '../data/firebase';

const PrivacyPolicy = (props) => {
    return (
        <div>
            <Header color="teal"/>
            <div className='cookies-background'>
                <Container>
                <h1>Privacy policy</h1> 
                <p>Welcome to CareerFairy!  CareerFairy is an online platform that is designed to build a bridge between the new generation of talents and employees at work.  It is owned and operated by CareerFairy GmbH, a Swiss limited liability company, based at Zurlindenstrasse 45, Zurich, Switzerland.  In this Privacy Policy, CareerFairy GmbH will be referred to as “CareerFairy” or “we”, and the user of the website located at <a href='https://careerfairy.io'>https://careerfairy.io</a> (CareerFairy Website) will be referred to as “user” or “you”..</p>
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
                    <p>If you would like to update, amend or delete your personal data or permanently delete your account, you can do so by contacting us by email at privacy@careerfairy.io.</p>
                    <h2>Storing personal data</h2>
                    <p>We will keep and use your personal data for as long as we need to for compliance with our legal obligations, to resolve disputes, and enforce our agreements.</p>
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
                    <h2>The right to object to processing</h2>
                    <p>Where Personal Information is processed for the public interest, in the exercise of an official authority vested in us or for the purposes of the legitimate interests pursued by us, you may object to such processing by providing a ground related to your particular situation to justify the objection. You must know that, however, should your Personal Information be processed for direct marketing purposes, you can object to that processing at any time without providing any justification. To learn, whether we are processing Personal Information for direct marketing purposes, you may refer to the relevant sections of this document.</p>
                    <h2>How to exercise these rights</h2>
                    <p>Any requests to exercise User rights can be directed to the Owner through the contact details provided in this document. These requests can be exercised free of charge and will be addressed by the Owner as early as possible.</p>
                    <h2>California privacy rights</h2>
                    <p>In addition to the rights as explained in this Privacy Policy, California residents who provide Personal Information (as defined in the statute) to obtain products or services for personal, family, or household use are entitled to request and obtain from us, once a calendar year, information about the Personal Information we shared, if any, with other businesses for marketing uses. If applicable, this information would include the categories of Personal Information and the names and addresses of those businesses with which we shared such personal information for the immediately prior calendar year (e.g., requests made in the current year will receive information about the prior year). To obtain this information please contact us.</p>
                    <h2>Privacy of children</h2>
                    <p>We do not knowingly collect any Personal Information from children under the age of 13. If you are under the age of 13, please do not submit any Personal Information through our Website or Service. We encourage parents and legal guardians to monitor their children's Internet usage and to help enforce this Policy by instructing their children never to provide Personal Information through our Website or Service without their permission.</p>
                    <p>If you have reason to believe that a child under the age of 13 has provided Personal Information to us through our Website or Service, please contact us. You must also be at least 16 years of age to consent to the processing of your Personal Information in your country (in some countries we may allow your parent or guardian to do so on your behalf).</p>
                    <h2>Newsletters</h2>
                    <p>We offer electronic newsletters to which you may voluntarily subscribe at any time. We are committed to keeping your e-mail address confidential and will not disclose your email address to any third parties except as allowed in the information use and processing section or for the purposes of utilizing a third-party provider to send such emails. We will maintain the information sent via e-mail in accordance with applicable laws and regulations.</p>
                    <p>In compliance with the CAN-SPAM Act, all e-mails sent from us will clearly state who the e-mail is from and provide clear information on how to contact the sender. You may choose to stop receiving our newsletter or marketing emails by following the unsubscribe instructions included in these emails or by contacting us. However, you will continue to receive essential transactional emails.</p>
                    <h2>Cookies</h2>
                    <p>The Website uses &quot;cookies&quot; to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you.</p>
                    <p>We may use cookies to collect, store, and track information for statistical purposes to operate our Website and Services. You have the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. If you choose to decline cookies, you may not be able to fully experience the features of the Website and Services. To learn more about cookies and how to manage them, visit <a target="_blank" rel="noopener noreferrer" href="https://www.internetcookies.org">internetcookies.org</a></p>
                    <h2>Do Not Track signals</h2>
                    <p>Some browsers incorporate a Do Not Track feature that signals to websites you visit that you do not want to have your online activity tracked. Tracking is not the same as using or collecting information in connection with a website. For these purposes, tracking refers to collecting personally identifiable information from consumers who use or visit a website or online service as they move across different websites over time. Our Website does not track its visitors over time and across third party websites. However, some third party sites may keep track of your browsing activities when they serve you content, which enables them to tailor what they present to you.</p>
                    <h2>Links to other websites</h2>
                    <p>Our Website contains links to other websites that are not owned or controlled by us. Please be aware that we are not responsible for the privacy practices of such other websites or third-parties. We encourage you to be aware when you leave our Website and to read the privacy statements of each and every website that may collect Personal Information.</p>
                    <h2>Information security</h2>
                    <p>We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in its control and custody. However, no data transmission over the Internet or wireless network can be guaranteed. Therefore, while we strive to protect your Personal Information, you acknowledge that (i) there are security and privacy limitations of the Internet which are beyond our control; (ii) the security, integrity, and privacy of any and all information and data exchanged between you and our Website cannot be guaranteed; and (iii) any such information and data may be viewed or tampered with in transit by a third-party, despite best efforts.</p>
                    <h2>Data breach</h2>
                    <p>In the event we become aware that the security of the Website has been compromised or users Personal Information has been disclosed to unrelated third parties as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities. In the event of a data breach, we will make reasonable efforts to notify affected individuals if we believe that there is a reasonable risk of harm to the user as a result of the breach or if notice is otherwise required by law. When we do, we will send you an email.</p>
                    <h2>Legal disclosure</h2>
                    <p>We will disclose any information we collect, use or receive if required or permitted by law, such as to comply with a subpoena, or similar legal process, and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</p>
                    <h2>Changes and amendments</h2>
                    <p>We may update this Privacy Policy from time to time in our discretion and will notify you of any material changes to the way in which we treat Personal Information. When changes are made, we will send you an email to notify you. We may also provide notice to you in other ways in our discretion, such as through contact information you have provided. Any updated version of this Privacy Policy will be effective immediately upon the posting of the revised Privacy Policy unless otherwise specified. Your continued use of the Website or Services after the effective date of the revised Privacy Policy (or such other act specified at that time) will constitute your consent to those changes. However, we will not, without your consent, use your Personal Data in a manner materially different than what was stated at the time your Personal Data was collected. Policy was created with <a target="_blank"  rel="noopener noreferrer" title="Sample privacy policy template" href="https://www.websitepolicies.com/blog/sample-privacy-policy-template">WebsitePolicies</a>.</p>
                    <h2>Acceptance of this policy</h2>
                    <p>You acknowledge that you have read this Policy and agree to all its terms and conditions. By using the Website or its Services you agree to be bound by this Policy. If you do not agree to abide by the terms of this Policy, you are not authorized to use or access the Website and its Services.</p>
                    <h2>Contacting us</h2>
                    <p>If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Information, you may send an email to &#116;hom&#97;s&#64;car&#101;e&#114;&#102;&#97;&#105;r&#121;&#46;&#105;o</p>
                    <p>This document was last updated on January 13, 2020</p>
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