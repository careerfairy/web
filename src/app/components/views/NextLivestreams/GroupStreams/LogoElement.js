import React, {useState} from 'react';
import {Box, Button, makeStyles} from "@material-ui/core";
import GroupJoinModal from "../../profile/GroupJoinModal";
import {useRouter} from "next/router";
import {grey} from "@material-ui/core/colors";


const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column"
    },
    logoImage: {
        maxWidth: "100%",
        maxHeight: "65%"
    },
    imageWrapper: {
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: grey[50],
        boxShadow: ({cardHovered}) => cardHovered && theme.shadows[24]
    },
    followButton:{
        marginTop: theme.spacing(1)
    }
}))

const LogoElement = ({careerCenter, userData, userFollows, livestreamId}) => {
    const classes = useStyles()
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
        <div className={classes.root}>
            <div className={classes.imageWrapper}>
                <img className={classes.logoImage} alt={`${careerCenter.universityName} logo`}
                     src={careerCenter.logoUrl}/>
            </div>
            {userFollows ? null :
                <Button onClick={handleJoin} className={classes.followButton} variant="outlined"
                        color="primary"> Follow </Button>}
            <GroupJoinModal
                open={openJoinModal}
                group={careerCenter}
                alreadyJoined={false}
                userData={userData}
                closeModal={handleCloseJoinModal}
            />
        </div>
    );
};

export default LogoElement;
