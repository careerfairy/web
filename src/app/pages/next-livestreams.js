import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";

import NextLivestreams from "../components/views/NextLivestreams/NextLivestreams";
import {useTheme} from "@material-ui/core/styles";


const nextLivestreams = () => {
    const theme = useTheme()
    const isSSR = typeof window === 'undefined';

    return !isSSR && (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <div style={{background: theme.palette.navyBlue.main, zIndex: 999999}}>
                <Header color="white"/>
            </div>
            <NextLivestreams/>
            <Footer/>
        </GreyBackground>
    );
};

export default nextLivestreams;
