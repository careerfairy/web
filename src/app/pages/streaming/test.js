import {useState, useEffect} from 'react';
import { Container, Header as SemanticHeader, Button } from "semantic-ui-react";

import { withFirebasePage } from 'context/firebase';

import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from 'components/views/header/Header';

function TestStreamingPage(props) {

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    async function createTestLivestream() {
        const testChatEntries = [{
            authorEmail: 'john@ethz.ch',
            authorName: 'John C',
            message: 'Hello!',
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:24:00')
        },{
            authorEmail: 'marco@ethz.ch',
            authorName: 'Marco D',
            message: 'Thank you for having us!',
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:34:00')
        },{
            authorEmail: 'david@ethz.ch',
            authorName: 'David P',
            message: 'Hi there!',
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:44:00')
        }];
        const testQuestionsEntries = [{
            author: 'john@ethz.ch',
            type: 'new',
            title: 'What is your interview process like?',
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:24:00'),
            votes: 24
        },{
            author: 'john@ethz.ch',
            type: 'new',
            title: 'How has the company changed due to COVID?',
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:34:00'),
            votes: 20
        }];
        const testPolls = [{
            question: 'What should we discuss next?',
            state: 'upcoming',
            options: [{
                index: 0,
                name: 'Our next product',
                votes: 0
            }, {
                index: 1,
                name: 'What our internships look like',
                votes: 0
            }, {
                index: 2,
                name: 'Our personal story',
                votes: 0
            }],
            timestamp: props.firebase.getFirebaseTimestamp('March 17, 2020 03:24:00'),
            voters: []
        }];
        try {
            setLoading(true);
            const livestreamRef = await props.firebase.createTestLivestream();
            return props.firebase.setupTestLivestream(livestreamRef.id, testChatEntries, testQuestionsEntries, testPolls).then(() => {
                router.push('/streaming/' + livestreamRef.id + '/main-streamer');
            })
        } catch(e) {
            console.log(e)
        }
    }
    return (
        <div>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <Header color="teal"/>
            <Container style={{ padding: '10% 0 0 0'}}>
                <div>
                    <SemanticHeader as='h1' style={{ width: '60%'}}>Prepare your livestream</SemanticHeader>
                    <p style={{ width: '60%'}}>
                        Make sure that you can connect to the CareerFairy streaming server and get familiar with 
                        our interactive features. 
                    </p>
                    <p style={{ width: '60%', margin: '0 0 5% 0'}}>Let's make sure that you're ready when it is time for your stream to start!</p>
                    <Button primary loading={loading} onClick={createTestLivestream}>Test the streaming connection</Button>
                </div>
            </Container>
            <style jsx>{`
               
            `}</style>
        </div>
    );
}

export default withFirebasePage(TestStreamingPage);