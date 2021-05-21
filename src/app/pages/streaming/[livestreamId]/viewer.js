import React from 'react';
import ViewerLayout from "../../../layouts/ViewerLayout";
import ViewerOverview from "../../../components/views/viewer";
import Head from "next/head";


const ViewerPage = () => {
    return (
        <React.Fragment>
            <Head>
                <title>CareerFairy | Watch live streams. Get hired.</title>
                <meta name="google" content="notranslate"/>
            </Head>
            <ViewerLayout>
                <ViewerOverview/>
            </ViewerLayout>
        </React.Fragment>
    )
}


export default ViewerPage;
