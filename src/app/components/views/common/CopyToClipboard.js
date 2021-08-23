import React, {useEffect, useState} from "react"
import {IconButton, Tooltip} from "@material-ui/core";
import ShareIcon from '@material-ui/icons/Share';
import {getBaseUrl} from "../../helperFunctions/HelperFunctions";

const CopyToClipboard = ({value, color, children, ...props}) => {

    const [copySuccess, setCopySuccess] = useState(false)
    const [url, setUrl] = useState("")

    useEffect(() => {
        if (value && value.length) {
            setUrl(`${getBaseUrl()}${value}`)
        }
    }, [value])

    useEffect(() => {
        if (copySuccess) {
            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        }
    }, [copySuccess])


    function copyStringToClipboard() {
        // Create new element
        let el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = url;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
        setCopySuccess(true)
    }

    return (
        <div {...props}>
            <Tooltip
                title="Copied!"
                placement="top"
                open={copySuccess}
                enterDelay={500}
                leaveDelay={200}
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                <IconButton onClick={() => copyStringToClipboard()}>
                    <ShareIcon fontSize="large" style={{color: color || "inherit"}} color="inherit"/>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default CopyToClipboard;