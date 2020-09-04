import React, {Fragment} from 'react'
import {Button, Container, Typography} from "@material-ui/core";


const CompletedGroup = ({baseGroupInfo: {name}}) => {
    return (
        <Fragment>
            <Container>
                <h1 className='content-title'>Congrats!</h1>
                <div>
                    <Typography>
                        Your group {name} has now been created
                    </Typography>
                    <div></div>
                    <Typography>
                        Click here to Manage you group and setup events
                    </Typography>
                    <Button>
                        Click here
                    </Button>

                </div>
            </Container>
            <style jsx>{`
                .content-title {
                    text-align: center;
                    font-weight: 300;
                    color: rgb(0, 210, 170);
                    font-size: calc(1.2em + 1.5vw);
                }
            `}</style>
        </Fragment>
    );
};

export default CompletedGroup;
