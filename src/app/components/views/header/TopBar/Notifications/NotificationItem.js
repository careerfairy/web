import React, {useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import {Card, CardActionArea, CardContent, Typography} from "@mui/material";
import {getBaseUrl, timeAgo} from '../../../../helperFunctions/HelperFunctions';
import {populate} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {useRouter} from "next/router";
import {useSnackbar} from "notistack";
import {GENERAL_ERROR} from "../../../../util/constants";
import {withFirebase} from "../../../../../context/firebase/FirebaseServiceContext";

const useStyles = makeStyles(theme => ({
    root: {
        maxWidth: 345,
    },
}));

const NotificationItem = ({
                              created,
                              type = "",
                              updated,
                              firebase,
                              id,
                              handleClose
                          }) => {

    const classes = useStyles()

    const [loading, setLoading] = useState(false);

    const getDate = () => {
        const date = updated || created
        return timeAgo(date.toDate())
    }

    function getNotificationType() {
        switch (type) {
            case "draftApprovalRequest":
                return <ApprovalRequest
                    handleClose={handleClose}
                    notificationId={id}
                    loading={loading}
                    firebase={firebase}
                    setLoading={setLoading}
                    timeAgo={getDate()}
                />

            default:
                return <div/>;
        }
    }

    return (
        <Card elevation={0} className={classes.root}>
            {getNotificationType()}
        </Card>
    );
};

NotificationItem.prototypes = {
    created: PropTypes.object,
    details: PropTypes.object,
    receiver: PropTypes.string.isRequired,
    requester: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    updated: PropTypes.object,
    handleClose: PropTypes.func.isRequired
}

const ApprovalRequest = ({timeAgo, notificationId, firebase, loading, setLoading, handleClose}) => {
    const populates = [
        {child: 'requester', root: 'userData', childAlias: 'userData'}
    ]
    const {enqueueSnackbar} = useSnackbar()
    const {push} = useRouter()
    const approvalRequest = useSelector(state => populate(state.firestore, `notifications.${notificationId}`, populates))
    const groupId = useSelector(state => state.firestore.data.group.groupId)
    const onClick = async () => {
        try {
            setLoading(true)
            await firebase.deleteNotification(notificationId)
            const baseUrl = getBaseUrl()
            const streamId = approvalRequest.details.draftId
            await push(`${baseUrl}/group/${groupId}/admin/drafts?livestreamId=${streamId}`)
            handleClose()
        } catch (e) {
            console.error("error in approval request", e)
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true
            })
        }
        setLoading(false)
    }
    const getMessage = () => {
        const {details: {userData}} = approvalRequest
        const displayName = userData ? `${userData.firstName} ${userData.lastName}` : "A user"
        return `${displayName} has submitted a draft for approval`
    }

    return (
        <CardActionArea disabled={loading} onClick={onClick}>
            <CardContent>
                <Typography gutterBottom variant="body1" component="h2">
                    {getMessage()}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {timeAgo}
                </Typography>
            </CardContent>
        </CardActionArea>
    )
}

export default withFirebase(NotificationItem);
