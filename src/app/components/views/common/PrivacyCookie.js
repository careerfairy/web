import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {Button} from "@material-ui/core";
import * as actions from '../../../store/actions'
import {useDispatch} from "react-redux";

const PrivacyCookie = () => {

    const dispatch = useDispatch()
    const [cookieMessageVisible, setCookieMessageVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('hideCookieMessage') === 'yes') {
            setCookieMessageVisible(false);
        } else {
            setCookieMessageVisible(true)
        }
    }, []);

    useEffect(() => {
        if (cookieMessageVisible) {
            dispatch(actions.enqueueSnackbar({
                message: <p>We use cookies to improve your experience. By continuing to use our website, you agree to
                    our and
                    our <Link href='/privacy'><a>privacy policy</a></Link>.</p>,
                options: {
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                    },
                    key: "privacyCookie",
                    style:{
                        maxWidth: "360px",
                    },
                    preventDuplicate: true,
                    variant: "info",
                    persist: true,
                    action: <Button onClick={hideCookieMessage}>
                        I agree
                    </Button>
                }
            }))
        }

    }, [cookieMessageVisible])

    function hideCookieMessage() {
        dispatch(actions.closeSnackbar("privacyCookie"))
        localStorage.setItem('hideCookieMessage', 'yes');
        setCookieMessageVisible(false);
    }

    return null
};

export default PrivacyCookie;
