import { useState } from "react"

import { withFirebasePage } from "context/firebase/FirebaseServiceContext"
import { v4 as uuid } from "uuid"

import { useRouter } from "next/router"
import Head from "next/head"
import Header from "components/views/header/Header"
import { Button, Container, Typography, CircularProgress } from "@mui/material"

function TestStreamingPage(props) {
   const router = useRouter()

   const [loading, setLoading] = useState(false)

   async function createTestLivestream() {
      const testChatEntries = [
         {
            authorEmail: "john@ethz.ch",
            authorName: "John C",
            message: "Hello!",
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
         },
         {
            authorEmail: "marco@ethz.ch",
            authorName: "Marco D",
            message: "Thank you for having us!",
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:34:00"
            ),
         },
         {
            authorEmail: "david@ethz.ch",
            authorName: "David P",
            message: "Hi there!",
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:44:00"
            ),
         },
      ]
      const testQuestionsEntries = [
         {
            author: "john@ethz.ch",
            type: "new",
            title: "What is your interview process like?",
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
            votes: 24,
         },
         {
            author: "john@ethz.ch",
            type: "new",
            title: "How has the company changed due to COVID?",
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:34:00"
            ),
            votes: 20,
         },
      ]
      const testPolls = [
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
            timestamp: props.firebase.getFirebaseTimestamp(
               "March 17, 2020 03:24:00"
            ),
         },
      ]
      try {
         setLoading(true)
         const livestreamRef = await props.firebase.createTestLivestream()
         return props.firebase
            .setupTestLivestream(
               livestreamRef.id,
               testChatEntries,
               testQuestionsEntries,
               testPolls
            )
            .then(() => {
               router.push("/streaming/" + livestreamRef.id + "/main-streamer")
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
               <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  endIcon={
                     loading && <CircularProgress color="inherit" size={20} />
                  }
                  disabled={loading}
                  onClick={createTestLivestream}
               >
                  Open a new test room
               </Button>
            </div>
         </Container>
      </div>
   )
}

export default withFirebasePage(TestStreamingPage)
