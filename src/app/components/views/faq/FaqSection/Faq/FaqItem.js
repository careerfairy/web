import PropTypes from 'prop-types'
import React, {useState, useEffect} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Grow, IconButton, Typography} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import makeStyles from '@mui/styles/makeStyles';
import LinkIcon from '@mui/icons-material/Link';
import {copyStringToClipboard} from "../../../../helperFunctions/HelperFunctions";
import * as actions from "../../../../../store/actions";
import {useDispatch} from "react-redux";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        alignSelf: "center",
    },
    summaryLinkIcon: {
        alignSelf: "center",
    }
}));

const FaqItem = ({answer, href, question}) => {
    const [expanded, setExpanded] = useState(false);
    const [summaryHovered, setSummaryHovered] = useState(false);
    const classes = useStyles();
    const dispatch = useDispatch()
    const {asPath} = useRouter()

    useEffect(() => {
        if (asPath === `/faq#${href}`) {
            setExpanded(true)
        }
    }, [asPath, href])

    const enqueueSnackbar = (...args) => dispatch(actions.enqueueSnackbar(...args))
    const handleCopyFaqLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        const targetPath = `${baseUrl}/faq#${href}`;
        copyStringToClipboard(targetPath);
        const message = "Link has been copied to your clipboard!"
        enqueueSnackbar({
            message,
            options: {
                variant: "success",
                preventDuplicate: true,
                key: message
            }
        });
    }

    const handleClick = () => {
        setExpanded(!expanded)
    }

    return (
        <Accordion
            component="article"
            id={href}
            expanded={expanded}
            onClick={handleClick}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                onMouseEnter={() => setSummaryHovered(true)}
                onMouseLeave={() => setSummaryHovered(false)}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <Typography
                    variant="h6"
                    className={classes.heading}
                >
                    {question}
                </Typography>
                <Grow in={summaryHovered}>
                    <IconButton
                        href={`#${href}`}
                        className={classes.summaryLinkIcon}
                        onClick={handleCopyFaqLink}
                        component="a"
                        size="large">
                        <LinkIcon/>
                    </IconButton>
                </Grow>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    {answer}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
}

FaqItem.propTypes = {
    answer: PropTypes.string.isRequired,
    href: PropTypes.string,
    question: PropTypes.string.isRequired
}
export default FaqItem;

