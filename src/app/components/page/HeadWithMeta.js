import PropTypes from 'prop-types'
import React from 'react';
import Head from "next/head";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({}));

const HeadWithMetaData = ({title, description, image, fullPath, twitterCardType}) => {

    const classes = useStyles()

    return (
        <Head>

            {/*Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title}/>
            <meta name="description" content={description}/>

            {/*Open Graph / Facebook */}
            <meta property="og:type" content="website"/>
            <meta property="og:url" content={fullPath}/>
            <meta property="og:title" key="title" content={title}/>
            <meta property="og:site_name" content="CareerFairy"/>
            <meta property="og:description" content={description}/>
            {image && <meta property="og:image" content={image}/>}

            {/*Twitter*/}
            <meta property="twitter:card" content={twitterCardType}/>
            {/*<meta property="twitter:card" content="summary_large_image"/>*/}
            <meta property="twitter:url" content={fullPath}/>
            <meta property="twitter:title" content={title}/>
            <meta property="twitter:description" content={description}/>
            {image && <meta property="twitter:image" content={image}/>}

        </Head>
    );
};

HeadWithMetaData.propTypes = {
    description: PropTypes.string.isRequired,
    fullPath: PropTypes.string.isRequired,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    twitterCardType: PropTypes.oneOf(["summary_large_image", "app", "player"])
}

HeadWithMetaData.defaultProps = {
    twitterCardType: "summary_large_image"
}
export default HeadWithMetaData;

