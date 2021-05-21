import PropTypes from 'prop-types'
import React, {useState} from 'react';
import { Button} from "@material-ui/core";
import { makeStyles} from "@material-ui/core/styles";
import GroupJoinModal from "../../profile/GroupJoinModal";
import {useRouter} from "next/router";
import Avatar from "@material-ui/core/Avatar";
import {getResizedUrl} from "../../../helperFunctions/HelperFunctions";


const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column"
    },
}))

const LogoElement = ({careerCenter, userData, userFollows, livestreamId, hideFollow, className}) => {
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
            <Avatar
                variant="rounded"
                key={careerCenter.id}
                className={className}
                src={getResizedUrl(careerCenter.logoUrl)}
                alt={careerCenter.universityName}
            />
            {(!userFollows && !hideFollow) &&
                <Button size="small" onClick={handleJoin} className={classes.followButton} variant="outlined"
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

LogoElement.propTypes = {
  careerCenter: PropTypes.object,
  className: PropTypes.string,
  hideFollow: PropTypes.bool,
  livestreamId: PropTypes.string,
  userData: PropTypes.object,
  userFollows: PropTypes.bool
}

export default LogoElement;

