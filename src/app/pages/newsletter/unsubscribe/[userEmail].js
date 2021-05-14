import { Fragment, useEffect, useState } from "react";
import { withFirebasePage } from "context/firebase";
import Loader from "components/views/loader/Loader";
import { useRouter } from "next/router";
import { Container } from "@material-ui/core";

function Unsubscribe(props) {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { userEmail } = router.query;

    useEffect(() => {
        if (userEmail) {
            props.firebase.setUserUnsubscribed(userEmail).then(() => {
                setLoading(false)
            })
        }
    }, [userEmail]);

    if (loading === false) {
        return (
            <Fragment>
                <div className='companies-container'>
                    <Container justify='center' style={{ padding: '100px'}}>
                        <h1 style={{ color: '#00d2aa'}}>CareerFairy</h1>
                        <div>You successfully unsubscribed from our newsletter!</div>
                    </Container>
                </div>
                <style jsx>{`
                    #companies-company-name {
                        margin-top: 5px;
                    }
                `}</style>
            </Fragment>
        );
    } else {
        return <Loader/>;
    }
    
}

export default withFirebasePage(Unsubscribe);