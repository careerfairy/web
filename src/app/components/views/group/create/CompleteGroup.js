import React, {Fragment, useState} from 'react'
import {Button, Container, Typography} from "@material-ui/core";


const CompleteGroup = ({baseGroupInfo, careerCenterRef, createCareerCenter}) => {
    const [submitting, setSubmitting] = useState(false)


    const handleFinalize = async () => {
        try {
            setSubmitting(true)
            const response = await createCareerCenter()
            console.log(response)
            setSubmitting(false)
        } catch (e) {
            console.log("error", e)
            setSubmitting(false)
        }
    }

    return (
        <Fragment>
            <Container>
                <h1 className='content-title'>Last Check</h1>
                <div>
                    <Typography align="center">
                        Your group {baseGroupInfo.universityName} is about to be created
                    </Typography>
                    <div className="action-wrapper">
                        <Typography align="center">
                            Click here to Manage you group and setup events
                        </Typography>
                        <Button onClick={handleFinalize}
                                color="primary"
                                disabled={submitting}
                                variant="contained"
                                size="large">
                            Finish
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

export default CompleteGroup;
