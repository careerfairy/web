import React, {useState} from 'react';
import LazyLoad from "react-lazyload";
import {Box, Button} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import GroupJoinModal from "../../profile/GroupJoinModal";
import {Image} from "semantic-ui-react";
import {useRouter} from "next/router";


const LogoSkeleton = () => <Skeleton variant="rect" width={50} height={50}/>


const LogoElement = ({careerCenter, userData, user, livestreamId}) => {

    const router = useRouter()

    const linkToStream = `/feed?careerCenterId=${careerCenter.groupId}&livestreamId=${livestreamId}`

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

    const checkIfUserFollows = (careerCenter) => {
        if (user && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }
    return (
        <Box display="flex" justifyContent="space-between" flexDirection="column" alignItems="center"
             style={{margin: '0 auto', width: '65px', height: "100%"}}>
            <LazyLoad placeholder={<LogoSkeleton/>}>
                <Image alt={`${careerCenter.universityName} logo`} src={careerCenter.logoUrl}/>
                {checkIfUserFollows(careerCenter) ? null :
                    <Button onClick={handleJoin} style={{marginTop: 10}} variant="outlined" color="primary"> Follow </Button>}
                <GroupJoinModal
                    open={openJoinModal}
                    group={careerCenter}
                    alreadyJoined={false}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
            </LazyLoad>
        </Box>
    );
};

export default LogoElement;
