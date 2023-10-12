import { withFirebase } from "../../context/firebase/FirebaseServiceContext"

import Head from "next/head"
import { Box, Button, Container, Link } from "@mui/material"
import GeneralLayout from "../../layouts/GeneralLayout"
import { useEffect } from "react"
import { getWindow } from "../../util/PathUtils"

const DataProtection = () => {
   useEffect(() => {
      // Refresh Usercentrics Privacy UI
      // There is a race condition where this page loads after the UC script
      // We need to request UC to redraw again
      getWindow()?.UC_UI?.restartEmbeddings()
   }, [])

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Data Protection Notice</title>
         </Head>
         <GeneralLayout>
            <Container>
               <TextContent />
            </Container>
         </GeneralLayout>
      </>
   )
}

const TextContent = () => {
   const resetCookieConsent = () => {
      getWindow()?.UC_UI?.showSecondLayer()
   }
   return (
      <Box
         sx={{
            fontSize: "1.1rem",
            "> p": {
               marginBottom: 4,
            },
            "div > p": {
               marginBottom: 4,
            },

            ol: {
               fontSize: 16,
            },
         }}
      >
         <p>
            <span>
               EN | <Link href={"/data-protection/DE"}>DE</Link>
            </span>
         </p>
         <ol start={1}>
            <li>
               <b>
                  <span>What is this Data Protection Notice about? </span>
               </b>
            </li>
         </ol>
         <p>
            <span>The </span>
            <b>
               <span>CareerFairy AG </span>
            </b>
            <span>(also &laquo;</span>
            <b>
               <span>we</span>
            </b>
            <span>&raquo;, &laquo;</span>
            <b>
               <span>us</span>
            </b>
            <span>
               &raquo;) collects and processes personal data that concern you
               but also other individuals (&laquo;
            </span>
            <b>
               <span>third parties</span>
            </b>
            <span>&raquo;). We use the word &laquo;</span>
            <b>
               <span>data</span>
            </b>
            <span>&raquo; here interchangeably with &laquo;</span>
            <b>
               <span>personal data</span>
            </b>
            <span>&raquo;.&nbsp;</span>
         </p>
         <p>
            <span>
               In this Data Protection Notice, we describe what we do with your
               data when you use{" "}
            </span>
            <b>
               <span>careerfairy.io, careerfairy.com,</span>
            </b>
            <span> our other websites or apps (collectively &laquo;</span>
            <b>
               <span>website</span>
            </b>
            <span>
               &raquo;), obtain services or products from us, interact with us
               in relation to a contract, communicate with us or otherwise deal
               with us.{" "}
            </span>
            <span>
               When appropriate we will provide a just-in-time notice to cover
               any additional processing activities not mentioned in this Data
               Protection Notice.{" "}
            </span>
            <span>
               In addition, we may inform you about the processing of your data
               separately, for example in consent forms, terms and conditions,
               additional privacy notices, forms and other notices.
            </span>
         </p>
         <p>
            <span>
               If you disclose data to us or share data with us about other
               individuals, such as family members, co-workers, etc., we assume
               that you are authorized to do so and that the relevant data is
               accurate. When you share data about others with us, you confirm
               that. Please make sure that these individuals have been informed
               about this Data Protection Notice.
            </span>
         </p>
         <p>
            <span>
               This Data Protection Notice is aligned with the EU General Data
               Protection Regulation (&laquo;
            </span>
            <b>
               <span>GDPR</span>
            </b>
            <span>&raquo;), the Swiss Data Protection Act (&laquo;</span>
            <b>
               <span>DPA</span>
            </b>
            <span>&raquo;) and the revised Swiss Data Protection (&laquo;</span>
            <b>
               <span>revDPA</span>
            </b>
            <span>
               &raquo;. However, the application of these laws depends on each
               individual case.
            </span>
         </p>

         <div>
            <ol start={2}>
               <li>
                  <p>
                     <strong>
                        Who is the controller for processing your data?
                     </strong>
                  </p>
               </li>
            </ol>

            <p>
               <span>The </span>
               <b>
                  <span>
                     CareerFairy AG, Technoparkstrasse 1, 8005 Z&uuml;rich,
                     Switzerland{" "}
                  </span>
               </b>
               <span>(the &laquo;</span>
               <b>
                  <span>CareerFairy AG</span>
               </b>
               <span>&raquo;) is the controller for the CareerFairy AG</span>
               <span>
                  processing under this Data Protection Notice, unless we tell
                  you otherwise in an individual case, for example in additional
                  privacy notices, on a form or in a contract.&nbsp;
               </span>
            </p>

            <p>
               You may contact us for data protection concerns and to exercise
               your rights under Section 11 as follows:&nbsp;
            </p>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               CareerFairy AG&nbsp;
               <br />
               Technoparkstrasse 1&nbsp;
               <br />
               8005 Z&uuml;rich&nbsp;
               <br />
               Switzerland&nbsp;
               <br />
               privacy@careerfairy.io&nbsp;
            </p>

            <p style={{ marginBottom: 0 }}>
               We have appointed the following additional positions:&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     Data Protection Officer according to articles 37 et seq.
                     GDPR:&nbsp;
                  </p>
               </li>
            </ul>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               Priverion GmbH&nbsp;
               <br />
               Europaallee 41&nbsp;
               <br />
               8021 Z&uuml;rich&nbsp;
               <br />
               Switzerland&nbsp;
            </p>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               privacy@careerfairy.io&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     Data Protection Representative in the EU according to
                     article 27 GDPR:&nbsp;
                  </p>
               </li>
            </ul>

            <p style={{ marginLeft: "40px" }}>
               SIDD Datenschutz Deutschland UG (haftungsbeschr&auml;nkt)&nbsp;
               <br />
               Schellingstr. 109a&nbsp;
               <br />
               80798 M&uuml;nchen&nbsp;
               <br />
               Germany&nbsp;
            </p>

            <p>You can also contact these parties for privacy concerns.</p>
         </div>

         <div>
            <ol start={3}>
               <li>
                  <p>
                     <strong>What data do we process?</strong> &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We process various categories of data about you. The main
               categories of data are the following:&nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Technical data</strong>: When you use our website
                     or other online offerings (for example free Wi-Fi), we
                     collect the IP address of your terminal device and other
                     technical data in order to ensure the functionality and
                     security of these offerings. This data includes logs with
                     records of the use of our systems. We generally keep
                     technical data for [6] months. In order to ensure the
                     functionality of these offerings, we may also assign an
                     individual code to you or your terminal device (for example
                     as a cookie, see Section 12). Technical data as such does
                     not permit us to draw conclusions about your identity.
                     However, technical data may be linked with other categories
                     of data (and potentially with your person) in relation to
                     user accounts, registrations, access controls or the
                     performance of a contract.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Registration data</strong>: Certain offerings, for
                     example competitions, and services (such as login areas of
                     our website, newsletters, free WLAN access, etc.) can only
                     be used with a user account or registration, which can
                     happen directly with us or through our third-party login
                     service providers. In this regard you must provide us with
                     certain data, and we collect data about the use of the
                     offering or service. If you redeem a voucher with us, we
                     may require certain data from you at the time of
                     redemption. If we issue a voucher to you for one of our
                     contractual partners, we may share or receive some of your
                     registration data from the relevant contractual partner
                     (see Section 7). Registration data may be required in
                     relation to access control to certain facilities,
                     potentially including biometric data, depending on the
                     control system. We generally keep registration data for 12
                     months from the date the use of the service ceases or the
                     user account is closed.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               If you choose to create an account on the CareerFairy website or
               log in to an account, you will be asked to provide the following
               personal information:&nbsp;
            </p>

            <ul>
               <li>
                  <p>First Name&nbsp;</p>
               </li>
               <li>
                  <p>Last Name&nbsp;</p>
               </li>
               <li>
                  <p>Email address&nbsp;</p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     University and country you are studying or have studied
                     at&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               You can choose not to provide us with any personal information,
               but then you will not be able to create an account or participate
               in live stream events.&nbsp;
            </p>

            <p>
               In addition to this information, an organization (organizer) that
               hosts Live Stream Events on CareerFairy (e.g., a university
               career service) may also request additional (personal) data when
               you register for the events, which is necessary for you to
               participate in that organizer&#39;s Live Stream Events. For
               example, this may include the following data:&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     Field of study [if selected by your Career Service].&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     Qualification level to which you are studying (BSc / MSc /
                     PhD) [if selected by your Career Service].&nbsp;
                  </p>
               </li>
               <li>
                  <p>Other open questions&nbsp;</p>
               </li>
            </ul>

            <p>
               The organization (organizer) is exclusively responsible for this
               data collection. For this purpose, the data protection notice of
               the organization (organizer) will be made available to you at the
               event signup.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Communication data</strong>: When you are in
                     contact with us via the contact form, by e-mail, telephone
                     or chat, or by letter or other means of communication, we
                     collect the data exchanged between you and us, including
                     your contact details and the metadata of the communication.
                     If we record or listen in on telephone conversations or
                     video conferences, for example for training and quality
                     assurance purposes, we will tell you specifically. Such
                     recordings may only be made and used in accordance with our
                     internal policies. You will be informed if and when such
                     recordings take place, for example by an indication during
                     the video conference in question. If you do not want to be
                     recorded, please notify us or leave the (video) conference.
                     If you simply do not want your image to be recorded, please
                     turn off your camera. If we have to determine your
                     identity, for example in relation to a request for
                     information, a request for press access, etc., we collect
                     data to identify you (for example a copy of an ID
                     document). We generally keep this data for 12 months from
                     the last exchange between us. This period may be longer
                     where required for evidentiary purposes, to comply with
                     legal or contractual requirements, or for technical
                     reasons. E-mails in personal mailboxes and written
                     correspondence are generally kept for at least 10 years.
                     Recordings of (video) conferences we will usually keep for
                     36 months. Chats are generally stored for 2 years.&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Hand-raising</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               When you join a Live Stream Event as a spectator, the other
               participants cannot see or hear you. During the live stream
               event, you have the opportunity to use the hand-raising
               functionality to tell the company&#39;s speakers that you would
               like to join the live stream using your video camera and
               microphone. The resulting live videos will not be recorded by us,
               unless the organizer explicitly informs you in this regard before
               the start of the event and obtains your consent.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Master data</strong>: With master data we mean the
                     basic data that we need, in addition to contract data (see
                     below), for the performance of our contractual and other
                     business relationships or for marketing and promotional
                     purposes, such as name and contact details, and information
                     about, for example, your role and function, your bank
                     details, your date of birth, customer history, powers of
                     attorney, signature authorizations and declarations of
                     consent. We process your master data if you are a customer
                     or other business contact or work for one (for example as a
                     contact person of the business partner), or because we wish
                     to address you for our own purposes or for the purposes of
                     a contractual partner (for example as part of marketing and
                     advertising, with invitations to events, with vouchers,
                     with newsletters, etc.). We receive master data from you
                     (for example when you make a purchase or as part of a
                     registration), from parties you work for, or from third
                     parties such as contractual partners, associations and
                     address brokers, and from public sources such as public
                     registers or the internet (websites, social media, etc.).
                     We may also process health data and information about third
                     parties as part of master data. We may also collect master
                     data from our shareholders and investors. We generally keep
                     master data for 10 years from the last exchange between us
                     or from the end of the contract. This period may be longer
                     if required for evidentiary purposes, to comply with legal
                     or contractual requirements, or for technical reasons. For
                     contacts used only for marketing and advertising, the
                     retention period is usually much shorter, usually no more
                     than 2 years from the last contact. &nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Contract data</strong>: This means data that is
                     collected in relation to the conclusion or performance of a
                     contract, for example information about the contracts and
                     the services provided or to be provided, as well as data
                     from the period leading up to the conclusion of a contract,
                     information required or used for performing a contract, and
                     information about feedback (for example complaints,
                     feedback about satisfaction, etc.). We generally collect
                     this data from you, from contractual partners and from
                     third parties involved in the performance of the contract,
                     but also from third-party sources (for example credit
                     information providers) and from public sources. We
                     generally keep this data for 10 years from the last
                     contract activity or from the end of the contract. This
                     period may be longer where necessary for evidentiary
                     purposes, to comply with legal or contractual requirements,
                     or for technical reasons. &nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Behavioral and preference data</strong>: Depending
                     on our relationship with you, we try to get to know you
                     better and to tailor our products, services and offers to
                     you. For this purpose, we collect and process data about
                     your behavior and preferences. We do so by evaluating
                     information about your behavior in our domain, and we may
                     also supplement this information with third-party
                     information, including from public sources. Based on this
                     data, we can for example determine the likelihood that you
                     will use certain services or behave in a certain way. The
                     data processed for this purpose is already known to us (for
                     example where and when you use our services), or we collect
                     it by recording your behavior (for example how you navigate
                     our website). We anonymize or delete this data when it is
                     no longer relevant for the purposes pursued, which may be
                     &ndash; depending on the nature of the data &ndash; between
                     6 and 24 months (for product and service preferences). This
                     period may be longer where necessary for evidentiary
                     purposes, to comply with legal or contractual requirements,
                     or for technical reasons. We describe how tracking works on
                     our website in Section 12. &nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Other data</strong>: We also collect data from you
                     in other situations. For example, data that may relate to
                     you (such as files, evidence, etc.) is processed in
                     relation to administrative or judicial proceedings. We may
                     also collect data for health protection (for example as
                     part of health protection concepts). We may obtain or
                     create photos, videos and sound recordings in which you may
                     be identifiable (for example at events, with security
                     cameras, etc.). We may also collect data about who enters
                     certain buildings, and when or who has access rights
                     (including in relation to access controls, based on
                     registration data or lists of visitors, etc.), who
                     participates in events or campaigns (for example
                     competitions) and who uses our infrastructure and systems
                     and when. Moreover, we collect and process data about our
                     shareholders and other investors, in addition to master
                     data, including information for registers, in relation to
                     the exercise of their rights and events (for example
                     general meetings). The retention period for this data
                     depends on the processing purpose and is limited to what is
                     necessary. This ranges from a few days for many security
                     cameras, to a few weeks for contact tracing and visitor
                     data, which is usually kept for 6 months, to several years
                     or more for reports about events with images. Data relating
                     to you as a shareholder or investor is kept in accordance
                     with corporate law, but in any case for as long as you are
                     invested.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Much of the data set out in this Section 3 is provided to us by
               you (through forms, when you communicate with us, in relation to
               contracts, when you use the website, etc.). You are not obliged
               or required to disclose data to us except in certain cases, for
               example within the framework of binding health protection
               concepts (legal obligations). If you wish to enter into contracts
               with us or use our services, you must also provide us with
               certain data, in particular master data, contract data and
               registration data, as part of your contractual obligation under
               the relevant contract. When using our website, the processing of
               technical data cannot be avoided. If you wish to gain access to
               certain systems or buildings, you must also provide us with
               registration data. However, in the case of behavioral and
               preference data, you generally have the option of objecting or
               not giving consent.&nbsp;
            </p>

            <p>
               We do not knowingly collect any personal data from children. If
               you are under the age of 18, please do not create an account on
               the CareerFairy Website as this violates our Terms of
               Service.&nbsp;
            </p>

            <p>
               As far as it is not unlawful we also collect data from public
               sources (for example debt collection registers, land registers,
               commercial registers, the media, or the internet including social
               media) or receive data from public authorities and from other
               third parties (such as credit agencies, address brokers,
               associations, contractual partners, internet analytics services,
               etc.).&nbsp;&nbsp;
            </p>
         </div>

         <div>
            <ol start={4}>
               <li>
                  <p>
                     <strong>For what purposes do we process your data?</strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We process your data for the purposes explained below. Further
               information is set out in Sections 12 and 13 for online services.
               These purposes and their objectives represent interests of us and
               potentially of third parties. You can find further information on
               the legal basis of our processing in Section 5.&nbsp;
            </p>

            <p>
               We process your data for purposes related to{" "}
               <strong>communication</strong> with you, in particular in
               relation to responding to inquiries and the{" "}
               <strong>exercise of your rights</strong> (Section 11) and to
               enable us to contact you in case of queries. For this purpose, we
               use in particular communication data and master data, and
               registration data in relation to offers and services that you
               use. We keep this data to document our communication with you,
               for training purposes, for quality assurance and for follow-up
               inquiries. &nbsp;
            </p>

            <p>
               We process data for the conclusion, administration and
               performance of <strong>contractual relationships</strong>
               .&nbsp;&nbsp;
            </p>

            <p>
               We process data for <strong>marketing purposes</strong> and{" "}
               <strong>relationship management</strong>, for example to send our
               customers and other contractual partners personalized advertising
               for products and services from us and from third parties (for
               example from advertising partners). This may happen in the form
               of newsletters and other regular contacts (electronically, by
               e-mail or by telephone), through other channels for which we have
               contact information from you, but also as part of marketing
               campaigns (for example events, contests, etc.) and may also
               include free services (for example invitations, vouchers, etc.).
               You can object to such contacts at any time (see at the end of
               this Section 4) or refuse or withdraw consent to be contacted for
               marketing purposes. With your consent, we can target our online
               advertising on the internet more specifically to you (see Section
               12). Finally, we also wish to enable our contractual partners to
               contact our customers and other contractual partners for
               marketing purposes (see Section 7).&nbsp;
            </p>

            <p>
               We further process your data for <strong>market research</strong>
               , to <strong>improve our services and operations</strong>, and
               for <strong>product development</strong>.&nbsp;&nbsp;
            </p>

            <p>
               We may also process your data for <strong>security</strong> and{" "}
               <strong>access control purposes</strong>.&nbsp;&nbsp;
            </p>

            <p>
               We process personal data to <strong>comply with laws</strong>,{" "}
               <strong>
                  directives and recommendations from authorities and internal
                  regulations (&laquo;Compliance&raquo;)
               </strong>
               .&nbsp;&nbsp;
            </p>

            <p>
               We also process data for the purposes of our{" "}
               <strong>risk management</strong> and as part of our{" "}
               <strong>corporate governance</strong>, including business
               organization and development.&nbsp;&nbsp;
            </p>

            <p>
               We may process your data for <strong>further purposes</strong>,
               for example as part of our internal processes and administration
               or for quality assurance purposes and trainings.&nbsp;&nbsp;
            </p>
         </div>

         <div>
            <ol start={5}>
               <li>
                  <b>
                     <span>On what basis do we process your data? </span>
                  </b>
               </li>
            </ol>
            <p>
               <span>Where we ask for your </span>
               <b>
                  <span>consent </span>
               </b>
               <span>for</span>
               <span>
                  certain processing activities (for example for the processing
                  of sensitive personal data, for marketing mailings, for
                  personalized motion profiles and for advertising management
                  and behavior analysis on the website), we will inform you
                  separately about the relevant processing purposes. You may
                  withdraw your consent at any time with effect for the future
                  by providing us written notice (by mail) or, unless otherwise
                  noted or agreed, by sending an e-mail to us; see our contact
                  details in Section{" "}
               </span>
               <span>2</span>
               <span>
                  . For withdrawing consent for online tracking, see Section{" "}
               </span>
               <span>12</span>
               <span>
                  . Where you have a user account, you may also withdraw consent
                  or contact us also through the relevant website or other
                  service, as applicable. Once we have received notification of
                  withdrawal of consent, we will no longer process your
                  information for the purpose(s) you consented to, unless we
                  have another legal basis to do so. Withdrawal of consent does
                  not, however, affect the lawfulness of the processing based on
                  the consent prior to withdrawal.
               </span>
            </p>
            <p>
               <span>
                  Where we do not ask for consent for processing, the processing
                  of your personal data relies on the requirement of the
                  processing for{" "}
               </span>
               <b>
                  <span>initiating</span>
               </b>
               <b>
                  <span>or performing a contract </span>
               </b>
               <span>
                  with you (or the entity you represent) or on our or a
                  third-party{" "}
               </span>
               <b>
                  <span>legitimate interest </span>
               </b>
               <span>
                  in the particular processing, in particular in pursuing the
                  purposes and objectives set out in Section{" "}
               </span>
               <span>4</span>
               <span>
                  {" "}
                  and in implementing related measures. Our legitimate interests
                  also include compliance with{" "}
               </span>
               <b>
                  <span>legal regulations</span>
               </b>
               <span>
                  , insofar as this is not already recognized as a legal basis
                  by applicable data protection law (for example in the case of
                  the GDPR, the laws in the EEA and in the case of the DPA,
                  Swiss law). This also includes the marketing of our products
                  and services, the interest in better understanding our markets
                  and in managing and further developing our company, including
                  its operations, safely and efficiently.
               </span>
            </p>

            <p>
               Where we receive sensitive personal data (for example health
               data, data about political opinions, religious or philosophical
               beliefs, and biometric data for identification purposes), we may
               process your data on other legal basis, for example, in the event
               of a dispute, as required in relation to a potential litigation
               or for the enforcement or defense of{" "}
               <strong>legal claims</strong>. In some cases, other legal basis
               may apply, which we will communicate to you separately as
               necessary.&nbsp;
            </p>
         </div>

         <div>
            <ol start={6}>
               <li>
                  <p>
                     <strong>
                        What applies in case of profiling and automated
                        individual decisions?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We may automatically evaluate personal aspects relating to you
               (&laquo;profiling&raquo;) based on your data (Section 3) for the
               purposes set out in Section 4, where we wish to determine
               preference data, but also in order to detect misuse and security
               risks, to perform statistical analysis or for operational
               planning. We may also create profiles for these purposes, i.e. we
               may combine behavioral and preference data, but also master data,
               contract data and technical data relating to you in order to
               better understand you as a person with your various interests and
               other characteristics. &nbsp;
            </p>

            <p>
               In both cases, we pay attention to the proportionality and
               reliability of the results and take measures against misuse of
               these profiles or profiling. Where these can produce legal
               effects concerning you or similarly significantly affect you, we
               generally ensure human review. &nbsp;
            </p>
         </div>

         <div>
            <ol start={7}>
               <li>
                  <p>
                     <strong>With whom do we share your data?</strong>
                     &nbsp;&nbsp;
                  </p>
               </li>
            </ol>

            <p>
               In relation to our contracts, the website, our services and
               products, our legal obligations or otherwise with protecting our
               legitimate interests and the other purposes set out in Section 4,
               we may disclose your personal data to third parties, in
               particular to the following categories of recipients:&nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Service providers</strong>: We work with service
                     providers in Switzerland and abroad who process your data
                     on our behalf or as joint controllers with us or who
                     receive data about you from us as separate controllers (for
                     example IT providers, shipping companies, advertising
                     service providers, login service providers, cleaning
                     companies, security companies, banks, insurance companies,
                     debt collection companies, credit information agencies, or
                     address verification providers). This may include health
                     data. For the service providers used for the website, see
                     Section 12. Key service providers in the IT area are Google
                     Ireland Ltd. and Amazon Web Services EMEA SARL.&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Event Hosts (Organizers)</strong>: On taking part
                     in a event which is hosted by a <strong>Organizer</strong>,
                     information on the participants will be transferred to the{" "}
                     <strong>Organizer</strong>. The participants will receive
                     an notice on signup to a event which will inform them of
                     the information which is transferred as well as the Hosts
                     Privacy Notice. The <strong>Organizers</strong> act as
                     separate controllers.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               If you agree to pass on your personal data to a potential
               employer (so-called organizer) by joining their talent pool on
               CareerFairy, CareerFairy will provide a copy of your personal
               data to that organizer. The functionality of the talent pool can
               be switched off individually by each organizer.&nbsp;
            </p>

            <p>
               We work with organizers inside and outside the European Economic
               Area, Switzerland and the United Kingdom. Organizers within the
               European Economic Area and Switzerland are subject to the same or
               similar data protection laws as CareerFairy.&nbsp;
            </p>

            <p>
               However, organizers outside these countries may not be subject to
               the same data protection laws and thus data protection
               levels.&nbsp;
            </p>

            <p>
               Before the data is transferred to the respective organizer,
               explicit reference will be made to the organizer&#39;s data
               protection notice. As an independent controller, the organizer
               processes your data with its own means and for its own
               purpose.&nbsp;
            </p>

            <p>
               If you do not want your personal data to be transferred to the
               Organizer outside the European Economic Area, Switzerland and the
               United Kingdom, please do not register with that Organizer&#39;s
               talent pools.&nbsp;
            </p>

            <p>
               We will not share your personal data with Organizers unless you
               have given your explicit consent by joining the talent pool of a
               particular company. You may opt out of a company&#39;s talent
               pool at any time by clicking on the appropriate button.&nbsp;
            </p>

            <p>
               Once an Organizer has received a copy of your Personal
               Information, the Organizer is responsible for handling that
               Personal Information. If you have concerns about an
               Organizer&#39;s data protection practices or if you wish to have
               your Personal Information deleted from an Organizer&#39;s
               records, please contact that Organizer directly. Contact
               information can be found in the data protection notices of the
               respective organizer.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Sharing your data with potential employers</strong>
                     : If you agree to share your personal data with a potential
                     employer, CareerFairy will transfer a copy of your personal
                     data to that employer.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               We work with employers both within and outside the European
               Economic Area, Switzerland and the United Kingdom. Employers
               within the European Economic Area, Switzerland and the United
               Kingdom are subject to the same or similar data protection rules
               as CareerFairy. Employers outside these countries, however, may
               not be subject to data protection rules. If you do not want your
               personal data to be shared with potential employers outside the
               European Economic Area, Switzerland and the United Kingdom,
               please do not sign up for those employers&rsquo; talent
               pools.&nbsp;
            </p>

            <p>
               We will not share your personal data with any potential employer
               unless you have given your consent by joining the talent pool of
               a specific company. If you change your mind, you can untick the
               box at any time.&nbsp;
            </p>

            <p>
               Once a potential employer has a copy of your personal data, the
               employer is responsible for its own handling of that personal
               data. If you have concerns about the privacy practices of a
               potential employer, or if you wish to have your personal data
               deleted from the records of a potential employer, please contact
               that employer directly.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Contractual partners including customers</strong>:
                     This refers to customers (for example service recipients)
                     and our other contractual partners as this data disclosure
                     results from these contracts. For example, they receive
                     registration data in relation to issued and redeemed
                     vouchers, invitations, etc. If you work for one of these
                     contractual partners, we may also disclose data about you
                     to that partner in this regard. These recipients also
                     include contractual partners with whom we cooperate or who
                     carry out advertising for us and to whom we may therefore
                     disclose data about you for analysis and marketing purposes
                     (these may again be service recipients, but also sponsors
                     and online advertising providers). We require these
                     partners to send you or display advertising based on your
                     data only with your consent (for online advertising, see
                     Section 12). Our main cooperation partners are listed here
                     [link], and our online advertising partners are listed in
                     Section 12.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Authorities</strong>: We may disclose personal data
                     to agencies, courts and other authorities in Switzerland
                     and abroad if we are legally obliged or entitled to make
                     such disclosures or if it appears necessary to protect our
                     interests. This may include health data. These authorities
                     act as separate controllers.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Other persons</strong>: This means other cases
                     where interactions with third parties follows from the
                     purposes set out in Section 4, for example service
                     recipients, the media and associations in which we
                     participate or if you are included in one of our
                     publications.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               All these categories of recipients may involve third parties, so
               that your data may also be disclosed to them. We can restrict the
               processing by certain third parties (for example IT providers),
               but not by others (for example authorities, banks, etc.).&nbsp;
            </p>

            <p>
               We reserve the right to make such disclosures even of secret data
               (unless we have expressly agreed with you that we will not
               disclose such data to certain third parties, except if we are
               required to do so by law). Notwithstanding the foregoing, your
               data will continue to be subject to adequate data protection in
               Switzerland and the rest of Europe, even after disclosure. For
               disclosure to other countries, the provisions of Section 8 apply.
               If you do not wish certain data to be disclosed, please let us
               know so that we can review if and to what extent we can
               accommodate your concern (Section 2).&nbsp;
            </p>

            <p>
               In addition, we enable <strong>certain third parties</strong> to
               collect <strong>personal data from you</strong> on our website
               and at events organized by us (for example press photographers,
               providers of tools on our website, etc.). Where we have no
               control over these data collections, these third parties are sole
               controllers. If you have concerns or wish to exercise your data
               protection rights, please contact these third parties directly.
               See Section 12 for the website.
            </p>
         </div>

         <div>
            <ol start={8}>
               <li>
                  <p>
                     <strong>Is your personal data disclosed abroad?</strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               As explained in section 7, we disclose data to other parties.
               These are not all located in Switzerland. Your data may therefore
               be processed both in Europe and in the USA; in exceptional cases,
               in any country in the world.&nbsp;&nbsp;
            </p>

            <p>
               If a recipient is located in a country without adequate statutory
               data protection, we require the recipient to undertake to comply
               with data protection (for this purpose, we use the revised
               European Commission&rsquo;s standard contractual clauses, which
               can be accessed here:{" "}
               <a
                  href="https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj
               </a>
               ?), unless the recipient is subject to a legally accepted set of
               rules to ensure data protection and unless we cannot rely on an
               exception. An exception may apply for example in case of legal
               proceedings abroad, but also in cases of overriding public
               interest or if the performance of a contract requires disclosure,
               if you have consented or if data has been made available
               generally by you and you have not objected against the
               processing.&nbsp;&nbsp;
            </p>

            <p>
               Please note that data exchanged via the internet is often routed
               through third countries. Your data may therefore be sent abroad
               even if the sender and recipient are in the same country.&nbsp;
            </p>

            <ol start={9}>
               <li>
                  <p>
                     <strong>How long do we process your data?</strong> &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We process your data for as long as our processing purposes, the
               legal retention periods and our legitimate interests in
               documentation and keeping evidence require it or storage is a
               technical requirement. You will find further information on the
               respective storage and processing periods for the individual data
               categories in Section 3, and for cookies in Section 12. If there
               are no contrary legal or contractual obligations, we will delete
               or anonymize your data once the storage or processing period has
               expired as part of our usual processes. &nbsp;
            </p>

            <ol start={10}>
               <li>
                  <p>
                     <strong>How do we protect your data?</strong> &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We take appropriate security measures in order to maintain the
               required security of your personal data and ensure its
               confidentiality, integrity and availability, and to protect it
               against unauthorized or unlawful processing, and to mitigate the
               risk of loss, accidental alteration, unauthorized disclosure or
               access. &nbsp;
            </p>
         </div>

         <div>
            <ol start={11}>
               <li>
                  <p>
                     <strong>What are your rights? &nbsp;</strong>
                  </p>
               </li>
            </ol>

            <p>
               <strong>
                  Applicable data protection laws grant you the right to object
                  to the processing of your data in some circumstances, in
                  particular for direct marketing purposes, for profiling
                  carried out for direct marketing purposes and for other
                  legitimate interests in processing.&nbsp;
               </strong>
            </p>

            <p>
               To help you control the processing of your personal data, you
               have the following rights in relation to our data processing,
               depending on the applicable data protection law:&nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     The right to request information from us as to whether and
                     what data we process from you;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     The right to have us correct data if it is
                     inaccurate;&nbsp;
                  </p>
               </li>
               <li>
                  <p>The right to request erasure of data;&nbsp;</p>
               </li>
               <li>
                  <p>
                     The right to request that we provide certain personal data
                     in a commonly used electronic format or transfer it to
                     another controller;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     The right to withdraw consent, where our processing is
                     based on your consent;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     The right to receive, upon request, further information
                     that is helpful for the exercise of these rights;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     The right to express your point of view in case of
                     automated individual decisions (Section 6) and to request
                     that the decision be reviewed by a human.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               <strong>
                  If you wish to exercise the above-mentioned rights in relation
                  to us
               </strong>
               , please contact us in writing, at our premises or, unless
               otherwise specified or agreed, by e-mail; you will find our
               contact details in Section 2. In order for us to be able to
               prevent misuse, we need to identify you (for example by means of
               a copy of your ID card, unless identification is not possible
               otherwise).&nbsp;&nbsp;
            </p>

            <p>
               You also have these rights in relation to other parties that
               cooperate with us as separate controllers &ndash; please contact
               them directly if you wish to exercise your rights in relation to
               their processing. You will find information on our key partners
               and service providers in Section7 and additional information in
               Section 12. &nbsp;
            </p>

            <p>
               Please note that conditions, exceptions or restrictions apply to
               these rights under applicable data protection law (for example to
               protect third parties or trade secrets). We will inform you
               accordingly where applicable.&nbsp;
            </p>

            <p>
               If you do not agree with the way we handle your rights or with
               our data protection practices, please let us or our Data
               Protection Officers (Section 2) know. If you are located in the
               EEA, the United Kingdom or in Switzerland, you also have the
               right to lodge a complaint with the competent data protection
               supervisory authority in your country. You can find a list of
               authorities in the EEA here:{" "}
               <a
                  href="https://edpb.europa.eu/about-edpb/board/members_en"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://edpb.europa.eu/about-edpb/board/members_en
               </a>
               . You can reach the UK supervisory authority here:{" "}
               <a
                  href="https://ico.org.uk/global/contact-us/"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://ico.org.uk/global/contact-us/
               </a>
               . You can reach the Swiss supervisory authority here:{" "}
               <a
                  href="https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html
               </a>
               .&nbsp;
            </p>

            <p>
               If you wish to update your profile information, you may do so by
               directly modifying the information in the &quot;My Profile&quot;
               section of your account. If you wish to delete your personal
               information or permanently delete your account, you may do so by
               contacting us via email at privacy@careerfairy.io.&nbsp;
            </p>
         </div>

         <div>
            <ol start={12}>
               <li>
                  <p>
                     <strong>
                        Do we use online tracking and online advertising
                        techniques?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We use various techniques on our website that allow us and third
               parties engaged by us to recognize you during your use of our
               website, and possibly to track you across several visits. This
               Section informs you about this.&nbsp;
            </p>

            <p>
               In essence, we wish to distinguish access by you (through your
               system) from access by other users, so that we can ensure the
               functionality of the website and carry out analysis and
               personalization. We do not intend to determine your identity,
               even if that is possible where we or third parties engaged by us
               can identify you by combination with registration data.&nbsp;
               However, even without registration data, the technologies we use
               are designed in such a way that you are recognized as an
               individual visitor each time you access the website, for example
               by our server (or third-party servers ) that assign a specific
               identification number to you or your browser (so-called
               &laquo;cookie&raquo;).&nbsp;&nbsp;
            </p>

            <p>
               We use these technologies on our website and may allow certain
               third parties to do so as well. However, depending on the purpose
               of these technologies, we may ask for consent before they are
               used. You can access your current settings
               <Button onClick={resetCookieConsent}>here</Button>. You can also
               set your browser to block or deceive certain types of cookies or
               alternative technologies, or to delete existing cookies. You can
               also add software to your browser that blocks certain third-party
               tracking. You can find more information on the help pages of your
               browser (usually with the keyword &laquo;Privacy&raquo;) or on
               the websites of the third parties set out below.&nbsp;
            </p>

            <p>
               We distinguish the following categories of &laquo;cookies&raquo;
               (including other technologies such as fingerprinting):&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Essential cookies:</strong> Some cookies are
                     necessary for the functioning of the website or for certain
                     features. For example, they ensure that you can move
                     between pages without losing information that was entered
                     in a form. They also ensure that you stay logged in. These
                     cookies exist temporarily only (&laquo;session
                     cookies&raquo;). If you block them, the website may not
                     work properly. Other cookies are necessary for the server
                     to store options or information (which you have entered)
                     beyond a session (i.e. a visit to the website) if you use
                     this function (for example language settings, consents,
                     automatic login functionality, etc.). These cookies have an
                     expiration date of up to 24 months.&nbsp;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Functional cookies</strong>: In order to optimize
                     our website and related offers and to better adapt them to
                     the needs of the users, we use cookies to record and
                     analyze the use of our website, potentially beyond one
                     session. We use third-party analytics services for this
                     purpose. We have listed them below. Before we use such
                     cookies, we ask for your consent. You can withdraw consent
                     at any time through the cookie settings{" "}
                     <Button onClick={resetCookieConsent}>here</Button>.
                     Performance cookies also have an expiration date of up to
                     24 months. Details can be found on the websites of the
                     third-party providers.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Marketing Cookies</strong>: We and our advertising
                     partners have an interest in targeting advertising as
                     precisely as possible, i.e. only showing it to those we
                     wish to address. We have listed our advertising partners
                     below. For this purpose, we and our advertising partners
                     &ndash; if you consent &ndash; use cookies that can record
                     the content that has been accessed or the contracts that
                     have been concluded. This allows us and our advertising
                     partners to display advertisements that we think will
                     interest you on our website, but also on other websites
                     that display advertisements from us or our advertising
                     partners. These cookies have an expiration period of a few
                     days to 24 months, depending on the circumstances. If you
                     consent to the use of these cookies, you will be shown
                     related advertisements. If you do not consent to them, you
                     will not see less advertisements, but simply any other
                     advertisement.&nbsp;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Account-related cookies</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               When you create an account with us, we will use cookies to manage
               the login process and for general administration. These cookies
               are usually deleted when you log out. However, in some cases,
               they may remain thereafter to store your website preferences when
               you log out.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Login-related cookies</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               We use cookies when you are logged in so that we can remember
               that fact. This prevents you from having to log in each time you
               visit a new page. These cookies are usually removed or deleted
               when you log out to ensure that you can only access limited
               features and areas when you are logged in.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Form-related cookies</strong>
                  </p>
               </li>
            </ul>

            <p>
               When you submit data through a form, such as contact pages or
               comment forms, cookies may be set to store your user information
               for future correspondence.&nbsp;
            </p>

            <p>&nbsp;</p>

            <p>
               We may also integrate additional third-party offers on our
               website, in particular from social media providers. These offers
               are deactivated by default. As soon as you activate them (for
               example by clicking a button), these providers can determine that
               you are using our website. If you have an account with that
               social media provider, it can assign this information to you and
               thereby track your use of online offers. These social media
               providers process this data as separate controllers. &nbsp;
            </p>

            <p>
               We currently use offers from the following service providers and
               advertising partners (where they use data from you or cookies set
               on your computer for advertising purposes):&nbsp;
            </p>

            <div
               className="uc-embed"
               // eslint-disable-next-line react/no-unknown-property
               uc-data="all"
               // eslint-disable-next-line react/no-unknown-property
               uc-embedding-type="category"
               // eslint-disable-next-line react/no-unknown-property
               uc-styling="true"
            ></div>
         </div>

         <div>
            <ol start={13}>
               <li>
                  <p>
                     <strong>
                        What data do we process on our social network pages?{" "}
                     </strong>
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               We may operate pages and other online presences (&laquo;fan
               pages&raquo;, &laquo;channels&raquo;, &laquo;profiles&raquo;,
               etc.) on social networks and other platforms operated by third
               parties and collect the data about you described in Section 3 and
               below. We receive this data from you and from the platforms when
               you interact with us through our online presence (for example
               when you communicate with us, comment on our content or visit our
               online presence). At the same time, the platforms analyze your
               use of our online presences and combine this data with other data
               they have about you (for example about your behavior and
               preferences). They also process this data for their own purposes,
               in particular for marketing and market research purposes (for
               example to personalize advertising) and to manage their platforms
               (for example what content they show you) and, to that end, they
               act as separate controllers.&nbsp;&nbsp;
            </p>

            <p>
               We process this data for the purposes set out in Section 4, in
               particular for communication, for marketing purposes (including
               advertising on these platforms, see Section 12) and for market
               research. You will find information about the applicable legal
               basis in Section 5. We may disseminate content published by you
               (for example comments on an announcement), for example as part of
               our advertising on the platform or elsewhere. We or the operators
               of the platforms may also delete or restrict content from or
               about you in accordance with their terms of use (for example
               inappropriate comments).&nbsp;&nbsp;
            </p>

            <p>
               For further information on the processing of the platform
               operators, please refer to the privacy information of the
               relevant platforms. There you can also find out about the
               countries where they process your data, your rights of access and
               erasure of data and other data subjects rights and how you can
               exercise them or obtain further information. We currently use the
               following platforms:&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Facebook</strong>: On Facebook we operate the page
                     www.facebook.com/careerfairy The controller for the
                     operation of the platform for users from Europe is Facebook
                     Ireland Ltd., Dublin, Ireland. Their privacy notice is
                     available at www.facebook.com/policy. Some of your data
                     will be transferred to the United States. You can object to
                     advertising here: www.facebook.com/settings?tab=ads. With
                     regard to the data collected and processed when visiting
                     our site for &laquo;page insights&raquo;, we are joint
                     controllers with Facebook Ireland Ltd., Dublin, Ireland. As
                     part of page insights, statistics are created about the
                     actions visitors perform on our site (comment on posts,
                     share content, etc.). This is explained at{" "}
                     <a
                        rel="noreferrer noopener"
                        target="_blank"
                        href="www.facebook.com/legal/terms/information_about_page_insights_data"
                     >
                        Facebook Insights Data.
                     </a>
                     It helps us understand how our page is used and how to
                     improve it. We receive only anonymous, aggregated data. We
                     have agreed our data protection responsibilities according
                     to the information on{" "}
                     <a
                        rel="noreferrer noopener"
                        target="_blank"
                        href="www.facebook.com/legal/terms/page_controller_addendum"
                     >
                        Facebook Page Controller.
                     </a>
                  </p>
               </li>
            </ul>
         </div>

         <div>
            <ol start={14}>
               <li>
                  <p>
                     <strong>
                        Can we update this Data Protection Notice ? &nbsp;
                     </strong>
                  </p>
               </li>
            </ol>

            <p>
               This Data Protection Notice is not part of a contract with you.
               We can change this Data Protection Notice at any time. The
               version published on this website is the current version. &nbsp;
            </p>

            <p>Last updated: 04.04.2023 &nbsp;</p>
         </div>
      </Box>
   )
}

export default withFirebase(DataProtection)
