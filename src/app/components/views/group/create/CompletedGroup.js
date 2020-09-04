import React, {Fragment} from 'react'
import {Button, Container, Typography} from "@material-ui/core";
import {useRouter} from "next/router";


const CompletedGroup = ({baseGroupInfo: {name},careerCenterRef}) => {
    const router = useRouter();

    const handleSendToAdmin = () => {
        router.push('/group/' + careerCenterRef.id + '/admin')
    }

    return (
        <Fragment>
            <Container>
                <h1 className='content-title'>Congrats!</h1>
                <div>
                    <Typography>
                        Your group {name} has now been created
                    </Typography>
                    <div className="action-wrapper">
                        <Typography>
                            Click here to Manage you group and setup events
                        </Typography>
                        <Button onClick={handleSendToAdmin}
                                color="primary"
                                variant="contained"
                                size="large">
                            Explore
                        </Button>
                    </div>

                </div>
            </Container>
            <style jsx>{`
                .content-title {
                    text-align: center;
                    font-weight: 300;
                    color: rgb(0, 210, 170);
                    font-size: calc(1.2em + 1.5vw);
                }
                
                .action-wrapper {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: space-between;
                }
            `}</style>
        </Fragment>
    );
};

export default CompletedGroup;
