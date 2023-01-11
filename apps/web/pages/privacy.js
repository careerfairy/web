import { withFirebase } from "../context/firebase/FirebaseServiceContext"

import Head from "next/head"
import { Button, Container } from "@mui/material"
import GeneralLayout from "../layouts/GeneralLayout"
import { useEffect } from "react"
import { getWindow } from "../util/PathUtils"

const PrivacyPolicy = () => {
   const resetCookieConsent = () => {
      getWindow()?.UC_UI?.showSecondLayer()
   }

   useEffect(() => {
      // Refresh Usercentrics Privacy UI
      // There is a race condition where this page loads after the UC script
      // We need to request UC to redraw again
      getWindow()?.UC_UI?.restartEmbeddings()
   }, [])

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Data protection notice</title>
         </Head>
         <GeneralLayout>
            <div className="cookies-background">
               <Container>
                  <h1>Data protection notice</h1>
                  <p>
                     Welcome to CareerFairy! CareerFairy is an online platform
                     that connects the new generation of students with employees
                     in various companies, through university career services.{" "}
                  </p>
                  <p>
                     Responsible for data processing under this data protection
                     notice is:{" "}
                  </p>
                  <p>
                     CareerFairy AG
                     <br />
                     c/o KD Zug-Treuhand
                     <br />
                     Untermüli 7<br />
                     6302 Zug <br />
                     Switzerland
                     <br />
                  </p>
                  <p>privacy@careerfairy.io</p>
                  <p>
                     In this Privacy Notice, CareerFairy AG is referred to as
                     "CareerFairy" or "we", and the user of the
                     https://careerfairy.io website (CareerFairy website) is
                     referred to as the "user" or "you".
                  </p>
                  <p>
                     This Privacy Notice explains the choices you have regarding
                     our use of your personal information and how you can access
                     and update that information on the CareerFairy website.
                     CareerFairy is the data controller for the purposes of this
                     Data Protection Notice.
                  </p>
                  <h2>1. Data processing as an independent data controller</h2>
                  <p>
                     CareerFairy collects and processes your personal data in
                     the course of visiting the website and creating an account
                     and using the services. The processing within the scope of
                     the stream together with the organizers and the related
                     collection of data are carried out in accordance with their
                     data protection notices on behalf of the respective
                     organizer. For this purpose, the respective data protection
                     notices of the organizers will be provided to you in
                     advance.
                  </p>
                  <h4>1.1 Automatic collection of information</h4>
                  <p>
                     When you visit the website, our servers automatically
                     record information that your browser sends. This
                     information may include information such as the IP address
                     of your device, browser type and version, operating system
                     type and version, language preferences or the web page you
                     visited before coming to our website, the pages of our
                     website you visit, the time you spend on those pages,
                     information you search for on our website, access times and
                     dates, and other statistics.
                  </p>
                  <p>
                     This information is used only to identify potential misuse
                     and to collect statistical information about the use of the
                     CareerFairy website. This statistical information is
                     aggregated so that individual visitors to the CareerFairy
                     website cannot be identified. The IP address is deleted
                     after 60 days.
                  </p>
                  <h4>1.2 Collection of personal data</h4>
                  <p>
                     You can visit the CareerFairy website without disclosing
                     any information. However, if you choose to create an
                     account on the CareerFairy website or log in to an account,
                     you will be asked to provide the following personal
                     information:
                  </p>
                  <ul>
                     <li>First Name</li>
                     <li>Last Name</li>
                     <li>Email address</li>
                     <li>
                        University and country you are studying or have studied
                        at
                     </li>
                  </ul>
                  <p>
                     You can choose not to provide us with any personal
                     information, but then you will not be able to create an
                     account or participate in live stream events.
                  </p>
                  <p>
                     In addition to this information, an organization
                     (organizer) that hosts Live Stream Events on CareerFairy
                     (e.g., a university career service) may also request other
                     (personal) data when you register for the events, which is
                     necessary for you to participate in that organizer's Live
                     Stream Events. For example, this may include the following
                     data:
                  </p>
                  <ul>
                     <li>
                        Field of study [if selected by your Career Service].
                     </li>
                     <li>
                        Qualification level to which you are studying (BSc / MSc
                        / PhD) [if selected by your Career Service].
                     </li>
                     <li>Other open questions</li>
                  </ul>
                  <p>
                     The organization (organizer) is exclusively responsible for
                     this data collection. For this purpose, the data protection
                     notice of the organization (organizer) will be made
                     available to you at the event signup.
                  </p>
                  <h4>1.3 Management of personal data</h4>
                  <p>
                     If you wish to update your profile information, you may do
                     so by directly modifying the information in the "My
                     Profile" section of your account. If you wish to delete
                     your personal information or permanently delete your
                     account, you may do so by contacting us via email at
                     privacy@careerfairy.io.
                  </p>
                  <h4>1.3 Storing of personal data</h4>
                  <p>
                     We will retain and use your Personal Data only for as long
                     as necessary to comply with our legal obligations, resolve
                     disputes and enforce our agreements.
                  </p>
                  <p>
                     All data we store is anonymous. Any personally identifiable
                     information, such as your name and email address, will be
                     deleted after the period specified below. The rest of the
                     data is anonymized and is used under our legitimate
                     interests to analyze general market and website trends, but
                     without any identifiable personal information.
                  </p>
                  <p>
                     When you create an account on CareerFairy, we retain your
                     personal information for a maximum period of 36 months
                     after your last participation in a Career Live Stream, as
                     most students will have graduated by then. After this
                     period, we will delete your personal data and your personal
                     account.{" "}
                  </p>
                  <p>
                     The personal data collected by CareerFairy is transferred
                     to and stored on secured servers in Ireland. The server is
                     managed by Google Ireland Ltd. and by Amazon Web Services
                     EMEA SARL, which protect the data contained therein.
                  </p>
                  <h4>1.5 Use and processing of the collected data</h4>
                  <p>
                     The personal data we hold about you is collected directly
                     from you. We use this data for the following purposes:
                  </p>
                  <ul>
                     <li>
                        To create and manage your account on the CareerFairy
                        website.
                     </li>
                     <li>
                        To send you information about upcoming livestream events
                     </li>
                     <li>To respond to your inquiries and provide support</li>
                     <li>To improve your user experience</li>
                     <li>To ensure that your account is kept up to date</li>
                     <li>
                        To share, with your express permission, your personal
                        information with the host of the live stream after a
                        live stream (see "Talent Pool")
                     </li>
                  </ul>
                  <h4>1.6 Hand-raising</h4>
                  <p>
                     When you join a Live Stream Event as a spectator, the other
                     participants cannot see or hear you. During the live stream
                     event, you have the opportunity to use the hand-raising
                     functionality to tell the company's speakers that you would
                     like to join the live stream using your video camera and
                     microphone. The resulting live videos will not be recorded
                     by us, unless the organizer explicitly informs you in this
                     regard before the start of the event and obtains your
                     consent.
                  </p>
                  <h4>1.7 Your rights</h4>
                  <p>You have the following rights:</p>
                  <ul>
                     <li>
                        (i) withdraw your consent to data processing to which
                        you have previously consented;
                     </li>
                     <li>
                        (ii) object to data processing that we carry out on a
                        legal basis other than consent;
                     </li>
                     <li>
                        (iii) request confirmation as to whether we are
                        processing your personal data;
                     </li>
                     <li>
                        (iv) obtain a copy of your personal data that we
                        process;
                     </li>
                     <li>
                        (v) to ask why we are processing your personal data, to
                        whom we have disclosed it and in which countries it is
                        located,
                     </li>
                     <li>
                        (vi) to know how long we will keep your personal data;
                     </li>
                     <li>
                        (vii) verify the accuracy of your personal data and ask
                        us to update or correct it;
                     </li>
                     <li>
                        (ix) request that we delete your personal data if we
                        process it unlawfully, if we no longer need it, or if
                        you object to us processing it for marketing purposes;
                        and
                     </li>
                     <li>
                        (x) request that we transfer your personal data to
                        another data controller.
                     </li>
                  </ul>
                  <h4>1.8 How you can exercise your rights</h4>
                  <p>
                     If you wish to exercise any of these rights, please let us
                     know at privacy@careerfairy.io. In addition, if you no
                     longer want us to process your personal data, you may
                     delete your account at any time by emailing us at
                     privacy@careerfairy.io. Deleting your account will delete
                     all copies of your personal data collected through the
                     CareerFairy website.
                  </p>
                  <h4>1.9 Children</h4>
                  <p>
                     We do not knowingly collect personal information from
                     children. If you are under the age of 18, please do not
                     create an account on the CareerFairy Website.
                  </p>
                  <h4>1.10 Aggregated Data</h4>
                  <p>
                     We use aggregate and anonymous data derived from or
                     including your personal information after you have updated
                     or deleted it, as long as we are no longer able to identify
                     you.
                  </p>
                  <h4>1.11 Emails</h4>
                  <p>
                     If you have signed up for an upcoming live stream event,
                     you will receive a confirmation email from CareerFairy, as
                     well as a reminder email before the live stream begins. If
                     you wish to stop receiving these confirmation and reminder
                     emails, you must delete your account at
                     privacy@careerfairy.io.
                  </p>
                  <h4>1.12 Website</h4>
                  <h4>Cookies</h4>
                  <p>
                     A cookie is a text file placed on your computer by a web
                     server. Cookies cannot be used to run programs or deliver
                     viruses to your computer. Cookies are uniquely assigned to
                     your computer and can only be read by a web server in the
                     domain that issued the cookie to your computer.
                  </p>
                  <h4>Account-related cookies</h4>
                  <p>
                     When you create an account with us, we will use cookies to
                     manage the login process and for general administration.
                     These cookies are usually deleted when you log out.
                     However, in some cases, they may remain thereafter to store
                     your website preferences when you log out.
                  </p>
                  <h4>Login-related cookies</h4>
                  <p>
                     We use cookies when you are logged in so that we can
                     remember that fact. This prevents you from having to log in
                     each time you visit a new page. These cookies are usually
                     removed or deleted when you log out to ensure that you can
                     only access limited features and areas when you are logged
                     in.
                  </p>
                  <h4>Form-related cookies</h4>
                  <p>
                     When you submit data through a form, such as contact pages
                     or comment forms, cookies may be set to store your user
                     information for future correspondence.
                  </p>
                  <h4>Cookies for website preferences</h4>
                  <p>
                     In order to provide you with the best possible experience
                     on this website, we provide you with the functionality to
                     set your preferences regarding the course of this website.
                     In order for us to remember your preferences, we need to
                     set cookies so that this information can be accessed
                     whenever you interact with a page affected by your
                     preferences.
                  </p>
                  <h4>Third Party Cookies</h4>
                  <p>
                     In some special cases, we also use cookies provided by
                     third parties. The following section tells you which third
                     party cookies you may encounter through this website.
                  </p>
                  <p>
                     You can accept or decline cookies, but if you choose to
                     decline cookies, some parts of the CareerFairy website may
                     not function properly on your computer. To learn more about
                     cookies and how to manage them, visit allaboutcookies.org.
                  </p>

                  <Button
                     color="primary"
                     variant="contained"
                     onClick={resetCookieConsent}
                  >
                     Update Privacy Settings
                  </Button>

                  <h4>Other applications</h4>
                  <h4>Google Analytics</h4>
                  <p>
                     On our website we use the tool "Google Analytics" of the
                     company Google Ireland Limited (Google Building Gordon
                     House, 4 Barrow St, Dublin, D04 E5W5, Ireland). For this
                     purpose, a contract for commissioned data processing was
                     concluded with Google. This includes Google LLC (formerly
                     Google Inc.), Google Ireland Limited and all companies
                     affiliated with Google LLC. The locations of Google's data
                     centers can be viewed here:
                     https://www.google.com/about/datacenters/inside/locations/index.html.
                  </p>
                  <p>
                     By means of Google Analytics, we collect information about
                     visitors to our website in order to present them with
                     relevant offers. The legal basis for this is the legitimate
                     interest in providing customers with targeted offers that
                     meet their needs and to minimize the amount of irrelevant
                     and unwanted advertising. Google Analytics collects website
                     cookies, device or browser data, IP addresses and website
                     or app activity. This is used to measure and report on user
                     interactions on the websites and apps that use Google
                     Analytics.
                  </p>
                  <p>
                     Our user analytics also uses Universal Analytics. This
                     allows us to obtain information about the use of our offers
                     on different devices ("Cross Device"). By means of cookie
                     technology, we use a pseudonymized user ID that does not
                     contain any personal data and does not transmit such data
                     to Google. You can object to the collection and storage of
                     data at any time with effect for the future by using a
                     browser plug-in from Google
                     (https://tools.google.com/dlpage/gaoptout?hl=de). You must
                     perform this opt-out on all systems that you use, for
                     example in another browser or on your mobile device.
                  </p>
                  <p>
                     By linking various Google functions within the Google
                     Analytics service with the Google Ads (formerly Google
                     AdWords) service, we are additionally able to conduct
                     retargeting (also called remarketing) based on
                     pseudonymized identification numbers. This allows us to
                     provide you with advertising after you leave our site on
                     various pages of our publishing partner.
                  </p>
                  <p>
                     Opt-Out: You can prevent Google Analytics from collecting
                     data about you within this website by clicking on this
                     link. By clicking on the above link, you will download an
                     "opt-out cookie". Your browser must generally allow cookies
                     to be stored. If you delete your cookies regularly, you
                     will need to click on the link again each time you visit
                     this website.
                  </p>
                  <p>
                     In addition, you can also permanently disable Google
                     Analytics using a plugin. You can find the plugin here:{" "}
                  </p>
                  <ul>
                     <li>https://support.google.com/analytics/answer/181881</li>
                     <li>
                        Terms of use:
                        https://www.google.com/analytics/terms/de.html
                     </li>
                     <li>
                        Data protection notice:
                        https://policies.google.com/privacy?hl=de&gl=de
                     </li>
                  </ul>
                  <p>
                     In addition, we have activated the IP anonymization
                     function, which ensures that your IP address is anonymized.
                     For this purpose, Google uses so-called IP masks. Before
                     anonymization, Google collects the country and city data by
                     means of the IP. At no time do we have access to your IP
                     address via Google Analytics.
                  </p>
                  <h4>Google Firebase</h4>
                  <p>
                     We use the following modules offered by Google's Firebase
                     service: Firebase Authentication, Firebase Firestore,
                     Firebase Storage and Firebase Cloud Functions.
                  </p>
                  <h4>Cloudflare CDN</h4>
                  <p>
                     We use a Content Delivery Network (CDN) from Cloudflare,
                     Inc, 101 Townsend St, San Francisco, CA 94107, USA.{" "}
                  </p>
                  <p>
                     The service of Cloudflare enables a faster delivery of our
                     website as well as a protection against attacks on our
                     website. User data is processed solely for the
                     aforementioned purposes and to maintain the security and
                     functionality of the CDN.
                  </p>
                  <p>
                     The use is based on our legitimate interests, i.e. interest
                     in a secure and efficient provision, analysis and
                     optimization of our online offer pursuant to Art. 6 para. 1
                     lit. f. DSGVO.
                  </p>
                  <p>
                     For more information, please see Cloudflare's data
                     protection notice:
                     https://www.cloudflare.com/security-policy.
                  </p>
                  <h4>Google Tag Manager</h4>
                  <p>
                     To manage the services for usage-based advertising, we also
                     use the Google Tag Manager. The Tag Manager tool itself is
                     a cookie-less domain and does not collect any personal
                     data. Rather, the tool provides for the resolution of other
                     tags, which in turn may collect data.
                  </p>
                  <h4>Google Fonts</h4>
                  <p>
                     We integrate the fonts ("Google Fonts") of the provider
                     Google Ireland Limited, Google Building Gordon House, 4
                     Barrow St, Dublin, D04 E5W5, Ireland. This is done on the
                     basis of our legitimate interests Art. 6 para. 1 lit. f.
                     DSGVO. Here, we have an interest in the optimal
                     presentation of the website and the associated economic
                     operation of our online offer.{" "}
                  </p>
                  <p>
                     Data protection notice:
                     https://www.google.com/policies/privacy/
                  </p>
                  <h4>Google Ads (formerly Google AdWords) & DoubleClick</h4>
                  <p>
                     On our website we use Google Ads from Google (see above).
                     This service enables us to place ads in the Google search
                     results as well as in display networks of Google AdSense
                     and publishing partners. The aim here is to draw attention
                     to our offers with the help of advertising media (so-called
                     Google Ads) on external websites. In relation to the data
                     of the advertising campaigns, we can determine how
                     successful the individual advertising measures are. In this
                     way, we pursue the interest of displaying advertising that
                     is of interest to you, making our website more interesting
                     for you and enabling a calculation of advertising costs.
                  </p>
                  <p>
                     The legal basis for this is the legitimate interest (Art. 6
                     (1) lit. f DSGVO) in efficient marketing of our services.
                  </p>
                  <p>
                     Our websites use the functions of Google Analytics in
                     conjunction with the cross-device functions of Google Ads.
                  </p>
                  <p>
                     This function makes it possible to link the advertising
                     target groups created with Google Analytics with the
                     cross-device functions of Google Ads. In this way,
                     interest-based, personalized advertising messages that have
                     been adapted to you depending on your previous usage and
                     surfing behavior on one end device (e.g. cell phone) can
                     also be displayed on another of your end devices (e.g.
                     tablet or PC).
                  </p>
                  <p>
                     For this purpose, a cookie is set by means of a remarketing
                     tag which includes every visitor to the website
                     (pseudonymized) in a list.
                  </p>
                  <p>
                     If you access our website via a Google ad, Google Ads will
                     store a cookie on your computer. The unique cookie ID, the
                     number of ad impressions per placement (frequency), the
                     last impression (relevant for post-view conversions) and
                     opt-out information (marking that the user no longer wishes
                     to be addressed) are usually stored as analysis values for
                     this cookie.
                  </p>
                  <p>
                     These cookies enable Google to recognize your internet
                     browser. Provided that a user visits certain pages of the
                     website of a Google Ads customer and the cookie stored on
                     his computer has not yet expired, Google and the customer
                     can recognize that the user clicked on the ad and was
                     redirected to this page.
                  </p>
                  <p>
                     You can prevent participation in this tracking process in
                     several ways:
                  </p>
                  <ul>
                     <li>
                        by setting your browser software accordingly -
                        suppressing third-party cookies will result in you not
                        receiving third-party ads.
                     </li>
                     <li>
                        by disabling conversion tracking cookies by setting your
                        browser to block cookies from the
                        www.googleadservices.com domain
                        (https://www.google.de/settings/ads), with this setting
                        being deleted when you delete your cookies
                     </li>
                     <li>
                        by disabling the interest-based ads of the providers
                        that are part of the self-regulatory campaign "About
                        Ads" through the link https://www.aboutads.info/choices,
                        this setting being deleted when you delete your cookies;
                     </li>
                     <li>
                        by permanently disabling them in your Firefox,
                        Internetexplorer or Google Chrome browsers at the link
                        http://www.google.com/settings/ads/plugin.
                     </li>
                  </ul>
                  <p>
                     We would like to point out that in this case you may not be
                     able to use all functions of this offer to their full
                     extent.
                  </p>
                  <h4>Links to other websites </h4>
                  <p>
                     The CareerFairy website contains links to websites that are
                     not owned or controlled by us. We are not responsible for
                     the privacy practices of third party websites and encourage
                     you to review the data protection notices of these websites
                     before you start browsing them. Data security breach If the
                     security of the CareerFairy website is compromised or your
                     personal information is disclosed to a third party as a
                     result of external activities, including but not limited to
                     security attacks or fraud, we will take reasonable steps
                     including but not limited to investigation and reporting as
                     well as notification and Cooperation with data protection
                     authorities as required by law. We will notify you by email
                     if we believe that there is a significant risk of harm to
                     you as a result of the breach.{" "}
                  </p>
                  <h4>Disclosure of Personal Information</h4>
                  <p>
                     If we need to disclose your personal information in
                     connection with a request from a government agency, we will
                     notify you first, if we are authorized to do so.
                  </p>
                  <h2>
                     2. Passing on your data to the organizer as part of your
                     participation in an event / livestream
                  </h2>
                  <h4>Independent processing of your data by organizers.</h4>
                  <p>
                     If you agree to pass on your personal data to a potential
                     employer (so-called organizer) by joining their talent pool
                     on CareerFairy, CareerFairy will provide a copy of your
                     personal data to that organizer. The functionality of the
                     talent pool can be switched off individually by each
                     organizer.{" "}
                  </p>
                  <p>
                     We work with organizers inside and outside the European
                     Economic Area, Switzerland and the United Kingdom.
                     Organizers within the European Economic Area and
                     Switzerland are subject to the same or similar data
                     protection laws as CareerFairy.{" "}
                  </p>
                  <p>
                     However, organizers outside these countries may not be
                     subject to the same data protection laws and thus data
                     protection levels.
                  </p>
                  <p>
                     Before the data is transferred to the respective organizer,
                     explicit reference will be made to the organizer's data
                     protection notice. As an independent controller, the
                     organizer processes your data with its own means and for
                     its own purpose.{" "}
                  </p>
                  <p>
                     If you do not want your personal data to be transferred to
                     the Organizer outside the European Economic Area,
                     Switzerland and the United Kingdom, please do not register
                     with that Organizer's talent pools.
                  </p>
                  <p>
                     We will not share your personal data with Organizers unless
                     you have given your explicit consent by joining the talent
                     pool of a particular company. You may opt out of a
                     company's talent pool at any time by clicking on the
                     appropriate button.{" "}
                  </p>
                  <p>
                     Once an Organizer has received a copy of your Personal
                     Information, the Organizer is responsible for handling that
                     Personal Information. If you have concerns about an
                     Organizer's data protection practices or if you wish to
                     have your Personal Information deleted from an Organizer's
                     records, please contact that Organizer directly. Contact
                     information can be found in the data protection notices of
                     the respective organizer.
                  </p>
                  <h2>3. Changes to this data protection notice</h2>
                  <p>
                     We periodically review this data protection notice to
                     ensure that it is current and accurate.
                  </p>
                  <p>This document was last updated on 10/06/2021.</p>
                  <h2>4. Contact us</h2>
                  <p>
                     If you would like to contact us to learn more about our
                     data processing practices or to exercise any of the rights
                     described herein, please send an email to
                     privacy@careerfairy.io.
                  </p>

                  <h2>Storing personal data</h2>
                  <p>
                     We will keep and use your personal data for as long as we
                     need to for compliance with our legal obligations, to
                     resolve disputes, and enforce our agreements.
                  </p>
                  <p>
                     Any data we do hold onto will be anonymous. Any personally
                     identifiable information such as your name and e-mail
                     address will be deleted after a defined period. The rest of
                     the data is therefore anonymous and will be used to analyse
                     general market and website trends but without an
                     identifiable personal information.
                  </p>
                  <p>
                     When creating an account on CareerFairy, we will hold on to
                     your personal data for a maximum duration of 36 months
                     after your last participation in a Career Live Stream, as
                     most students will have completed their studies by then.
                     After this period, we will delete your personal data and
                     your personal account.
                  </p>
                  <h2>Use and processing of collected data</h2>
                  <p>
                     The personal data we hold about you is collected directly
                     from you. We may use it for the following purposes:
                  </p>
                  <ul>
                     <li>
                        To create and manage your account on the CareerFairy
                        Website
                     </li>
                     <li>
                        To send you information about forthcoming livestream
                        events
                     </li>
                     <li>To respond to your enquiries and offer support</li>
                     <li>To request your feedback on our service</li>
                     <li>To improve your user experience</li>
                     <li>To ensure that your account is kept up to date</li>
                     <li>
                        To provide information about you to potential employers,
                        with your permission
                     </li>
                  </ul>
                  <h2>Transfer and storage of personal data</h2>
                  <p>
                     Personal data collected by CareerFairy are transferred to
                     and stored on a secure server in Frankfurt am Main,
                     Germany. The server is hosted by Google Germany GmbH which
                     safeguards personal data in accordance with CareerFairy’s
                     instructions.
                  </p>
                  <h2>Sharing your data with potential employers</h2>
                  <p>
                     If you agree to share your personal data with a potential
                     employer, CareerFairy will transfer a copy of your personal
                     data to that employer.
                  </p>
                  <p>
                     We work with employers both within and outside the European
                     Economic Area, Switzerland and the United Kingdom.
                     Employers within the European Economic Area, Switzerland
                     and the United Kingdom are subject to the same or similar
                     data protection rules as CareerFairy. Employers outside
                     these countries, however, may not be subject to data
                     protection rules
                  </p>
                  <p>
                     Where we work with an employer located outside the European
                     Economic Area, Switzerland and the United Kingdom, we take
                     appropriate steps to ensure that they protect your personal
                     data. These steps may include:{" "}
                  </p>
                  <ul>
                     <li>
                        signing a contract which requires the protection of your
                        personal data in accordance with the standards that
                        apply in your home country.
                     </li>
                     <li>
                        a code of conduct approved by a data protection
                        authority located in the EU.
                     </li>
                     <li>
                        requiring an approved certification such as the EU-US or
                        Switzerland-US Privacy Shield.
                     </li>
                  </ul>
                  <p>
                     If you do not want your personal data to be shared with
                     potential employers outside the European Economic Area,
                     Switzerland and the United Kingdom, please do not sign up
                     for those employers’ talent pools.
                  </p>
                  <p>
                     We will not share your personal data with any potential
                     employer unless you have given your consent by joining the
                     talent pool of a specific company. If you change your mind,
                     you can untick the box at any time.
                  </p>
                  <p>
                     Once a potential employer has a copy of your personal data,
                     the employer is responsible for its own handling of that
                     personal data. If you have concerns about the privacy
                     practices of a potential employer, or if you wish to have
                     your personal data deleted from the records of a potential
                     employer, please contact that employer directly.
                  </p>
                  <h2>Your rights</h2>
                  <ul style={{ listStyleType: "none" }}>
                     <p>
                        You have the following rights over your personal data
                        that we process. In particular, you have the right to:
                     </p>
                     <li>
                        (i) withdraw consent to processing for which you have
                        previously given consent;
                     </li>
                     <li>
                        (ii) object to processing which we carry out on a legal
                        basis other than consent;
                     </li>
                     <li>
                        (iii) request confirmation of whether we are processing
                        your personal data;
                     </li>
                     <li>
                        (iv) receive a copy of your personal data processed by
                        us;
                     </li>
                     <li>
                        (v) ask why we are processing your personal data, to
                        whom we have disclosed it and which countries they are
                        in,
                     </li>
                     <li>
                        (vi) know how long we will keep your personal data;
                     </li>
                     <li>
                        (vii) check the accuracy of your personal data and ask
                        us to update or correct it;
                     </li>
                     <li>
                        (viii) complain to a data protection authority about our
                        data processing;
                     </li>
                     <li>
                        (ix) request that we delete your personal data if we are
                        processing it illegally, if we no longer need it, or if
                        you object to us processing it for marketing purposes;
                        and
                     </li>
                     <li>
                        (x) ask that we transfer your personal data to another
                        data controller.
                     </li>
                  </ul>
                  <h2>How to exercise your rights</h2>
                  <p>
                     If you wish to exercise any of these rights, please notify
                     us at{" "}
                     <a href="mailto:privacy@careerfairy.io">
                        privacy@careerfairy.io
                     </a>
                     . In addition, if you no longer want us to process your
                     personal data, you can delete your account at any time by
                     sending us an e-mail at privacy@careerfairy.io. Deleting
                     your account will erase all copies of your personal data
                     collected via the CareerFairy Website.
                  </p>
                  <h2>Children</h2>
                  <p>
                     We do not knowingly collect any personal data from
                     children. If you are under the age of 18, please do not
                     create an account on the CareerFairy Website.
                  </p>
                  <h2>Usercentrics Legal Data</h2>
                  <div className="uc-embed" uc-data="all"></div>
               </Container>
            </div>
            <style jsx>{`
               .cookies-background {
                  //background-color: rgb(253,253,253);
                  padding: 30px 0;
                  color: rgb(60, 60, 60);
               }

               .cookies-background li {
                  margin-bottom: 10px;
               }

               .cookies-background h1 {
                  color: rgb(0, 210, 170);
               }
            `}</style>
         </GeneralLayout>
      </>
   )
}

export default withFirebase(PrivacyPolicy)
