import React, {useState} from 'react';
import LazyLoad from "react-lazyload";
import {Box, Button} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import GroupJoinModal from "../../profile/GroupJoinModal";
import {Image} from "semantic-ui-react";
import {useRouter} from "next/router";


const LogoElement = ({careerCenter, userData, userfollows, livestreamId}) => {

    const router = useRouter()

    const linkToStream = `/next-livestreams?careerCenterId=${careerCenter.groupId}&livestreamId=${livestreamId}`

    const [openJoinModal, setOpenJoinModal] = useState(false);

    const handleCloseJoinModal = () => {
        setOpenJoinModal(false);
    };
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true);
    };

    const handleJoin = () => {
        if (userData) {
            handleOpenJoinModal()
        } else {
            return router.push({pathname: "/login", query: {absolutePath: linkToStream}})
        }
    }


    return (
        <Box display="flex" justifyContent="space-between" flexDirection="column" alignItems="center"
             style={{margin: '0 auto', width: '65px', height: "100%"}}>
                <Image alt={`${careerCenter.universityName} logo`} src={careerCenter.logoUrl}/>
                {userfollows ? null :
                    <Button onClick={handleJoin} style={{marginTop: 10}} variant="outlined" color="primary"> Follow </Button>}
                <GroupJoinModal
                    open={openJoinModal}
                    group={careerCenter}
                    alreadyJoined={false}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
        </Box>
    );
};

export default LogoElement;
