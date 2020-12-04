import React, {useEffect, useState} from "react"
import {Button, IconButton, Tooltip} from "@material-ui/core";
import LinkIcon from '@material-ui/icons/Link';


const CopyToClipboard = ({value, ...props}) => {

    const [copySuccess, setCopySuccess] = useState(false)
    const [url, setUrl] = useState("")

    useEffect(() => {
        if (value && value.length) {
            if (isLocalhost) {
                setUrl(`http://localhost:3000${value}`)
            } else {
                setUrl(`https://careerfairy.io${value}`)
            }
        }
    }, [value])

    useEffect(() => {
        if (copySuccess) {
            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        }
    }, [copySuccess])


    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    )

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
                <IconButton  onClick={() => copyStringToClipboard()}>
                    <LinkIcon fontSize="large" color="inherit"/>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default CopyToClipboard;