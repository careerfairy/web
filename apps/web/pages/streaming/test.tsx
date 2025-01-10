import { useState } from "react"

import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { v4 as uuid } from "uuid"

import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import {
   LivestreamChatEntry,
   LivestreamPoll,
   LivestreamQuestion,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Container, Typography } from "@mui/material"
import Header from "components/views/header/Header"
import Head from "next/head"
import { useRouter } from "next/router"
import { generateUniqueId } from "util/CommonUtil"

const TestStreamingPage = () => {
   const router = useRouter()

   const [loading, setLoading] = useState(false)

   const firebaseService = useFirebaseService()

   async function createTestLivestream() {
      const testSpeakers: Speaker[] = [
         {
            roles: [],
            id: generateUniqueId(),
            avatar:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-speakers%2Fmaria.png?alt=media&token=5958bdc4-f90f-4007-939a-5be12dfcacca",
            firstName: "Maria",
            lastName: "Lopez",
            position: "HR Campus Lead",
            background:
               "Hello! I am Maria Lopez, an HR Campus Lead with a passion for nurturing talent and fostering growth. With years of experience in human resources, I excel in creating inclusive environments where everyone can thrive.\nI am dedicated to implementing innovative HR strategies that align with organizational goals and drive employee engagement.",
            email: "maria@acme.com",
            linkedInUrl: "https://www.linkedin.com/in/maria-lopez-123/",
         },
         {
            roles: ["Speaker"],
            id: generateUniqueId(),
            avatar:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-speakers%2Ffabian.png?alt=media&token=66766e0d-3440-46bc-ab79-96ac0af3f020",
            firstName: "John",
            lastName: "Doe",
            position: "Supply Chain Manager",
            background:
               "Greetings! I am John Doe, a seasoned Supply Chain Manager with a knack for optimizing logistics and streamlining operations. My expertise lies in ensuring that supply chains run smoothly and efficiently.\nI am passionate about leveraging technology to enhance supply chain processes and deliver exceptional results.",
            email: "john.doe@acme.com",
            linkedInUrl: "https://www.linkedin.com/in/john-doe-123/",
         },
         {
            roles: ["Speaker"],
            id: generateUniqueId(),
            avatar:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-speakers%2Fjane.png?alt=media&token=613f53f1-bb05-4392-b16f-7f530762f313",
            firstName: "Jane",
            lastName: "Smith",
            position: "Business Development Manager",
            background:
               "Hi! I am Jane Smith, a dynamic Business Development Manager with a passion for driving growth and building strategic partnerships. My focus is on identifying new business opportunities and fostering long-term relationships.\nI thrive in fast-paced environments and am dedicated to achieving ambitious business goals.",
            email: "jane.smith@acme.com",
            linkedInUrl: "https://www.linkedin.com/in/jane-smith-123/",
         },
         {
            roles: ["Speaker"],
            id: generateUniqueId(),
            avatar:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-speakers%2Falice.png?alt=media&token=505b14ba-8544-4ab8-b254-3ad4c7efe37a",
            firstName: "Alice",
            lastName: "Johnson",
            position: "Manager - Tax",
            email: "alice.johnson@acme.com",
            background:
               "Hello! I am Alice Johnson, a dedicated Tax Manager with extensive experience in tax planning and compliance. My goal is to help organizations navigate complex tax regulations and optimize their tax strategies.\nI am committed to providing accurate and timely tax advice to support business success.",
            linkedInUrl: "https://www.linkedin.com/in/alice-johnson-123/",
         },
         {
            roles: ["Speaker"],
            id: generateUniqueId(),
            avatar:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/demo-speakers%2Fbob.png?alt=media&token=b11016e3-9c5b-4b90-a621-e735fec6a134",
            firstName: "Bob",
            lastName: "Brown",
            position: "Talent Acquisition Manager - Tax",
            email: "bob@acme.com",
            background:
               "Greetings! I am Bob Brown, a Talent Acquisition Manager specializing in the tax sector. My expertise lies in identifying and recruiting top talent to meet organizational needs.\nI am passionate about building strong teams and fostering a culture of excellence within the workplace.",
            linkedInUrl: "https://www.linkedin.com/in/bob-brown-123/",
         },
      ]
      const testChatEntries: LivestreamChatEntry[] = [
         {
            authorEmail: "john@ethz.ch",
            authorName: "John C",
            message: "Hello!",
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
            wow: [],
            heart: [],
            thumbsUp: [],
            laughing: [],
            id: generateUniqueId(),
         },
         {
            authorEmail: "marco@ethz.ch",
            authorName: "Marco D",
            message: "Thank you for having us!",
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:34:00"
            ),
            wow: [],
            heart: [],
            thumbsUp: [],
            laughing: [],
            id: generateUniqueId(),
         },
         {
            authorEmail: "david@ethz.ch",
            authorName: "David P",
            message: "Hi there!",
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:44:00"
            ),
            wow: [],
            heart: [],
            thumbsUp: [],
            laughing: [],
            id: generateUniqueId(),
         },
      ]
      const testQuestionsEntries: LivestreamQuestion[] = [
         {
            author: "john@ethz.ch",
            type: "new",
            title: "What is your interview process like?",
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
            votes: 24,
            voterIds: [],
            badges: [],
            id: generateUniqueId(),
         },
         {
            author: "john@ethz.ch",
            type: "new",
            title: "How has the company changed due to COVID?",
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:34:00"
            ),
            votes: 20,
            voterIds: [],
            badges: [],
            id: generateUniqueId(),
         },
      ]
      const testPolls: LivestreamPoll[] = [
         {
            question: "What should we discuss next?",
            state: "upcoming",
            options: [
               {
                  id: uuid(),
                  text: "Our next product",
               },
               {
                  id: uuid(),
                  text: "What our internships look like",
               },
               {
                  id: uuid(),
                  text: "Our personal story",
               },
            ],
            timestamp: firebaseService.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
            voters: [],
            closedAt: firebaseService.getServerTimestamp() as Timestamp,
            id: generateUniqueId(),
         },
      ]
      try {
         setLoading(true)
         const livestreamRef = await firebaseService.createTestLivestream()
         return firebaseService
            .setupTestLivestream(
               livestreamRef.id,
               testChatEntries,
               testQuestionsEntries,
               testPolls,
               testSpeakers
            )
            .then(() => {
               router.push("/streaming/host/" + livestreamRef.id)
            })
      } catch (e) {
         console.log(e)
      }
   }

   return (
      <div>
         <Head>
            <title key="title">CareerFairy | Next Live Streams</title>
         </Head>
         <Header color="teal" />
         <Container style={{ paddingTop: "10%" }}>
            <div>
               <Typography gutterBottom variant="h3" style={{ width: "60%" }}>
                  Prepare your livestream
               </Typography>
               <Typography style={{ width: "60%" }}>
                  Make sure that you can connect to the CareerFairy streaming
                  server and get familiar with our interactive features.
               </Typography>
               <Typography style={{ width: "60%", margin: "0 0 5% 0" }}>
                  Let&apos;s make sure that you&apos;re ready when it is time
                  for your stream to start!
               </Typography>
               <LoadingButton
                  loading={loading}
                  size="large"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  onClick={createTestLivestream}
               >
                  Open a new test room
               </LoadingButton>
            </div>
         </Container>
      </div>
   )
}

export default TestStreamingPage
