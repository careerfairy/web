import React, {useEffect, useState} from 'react';
import {isEmpty, isLoaded} from "react-redux-firebase";
import {useDispatch} from "react-redux";
import * as actions from '../../store/actions'
import {useRouter} from "next/router";
import {useAuth} from "../../HOCs/AuthProvider";


const useDashboardRedirect = (group, firebase, isCompany) => {
    const [joiningGroup, setJoiningGroup] = useState(false);
    const {query: {dashboardInviteId}, pathname, replace} = useRouter()
    const dispatch = useDispatch()
    const {authenticatedUser, userData} = useAuth()

    const enqueueSnackbar = (...args) => dispatch(actions.enqueueSnackbar(...args))
    const enqueueErrorSnackbar = (error) => dispatch(actions.sendGeneralError(error))

    const isAdmin = () => {
        return userData?.isAdmin
            || (group?.adminEmails?.includes(authenticatedUser?.email))
    }

    const analyticsPath = isCompany ? `/company/${group?.id}/admin/analytics` : `/group/${group?.id}/admin/analytics`
    const basePath = isCompany ? "/company/[companyId]/admin" : "/group/[groupId]/admin"

    useEffect(() => {
        (async function () {
            if (joiningGroup) {
                return
            }
            if (isEmpty(group) && isLoaded(group)) {
                await replace("/");
                enqueueSnackbar({
                    message: "The page you tried to visit is invalid",
                    options: {
                        variant: "error",
                        preventDuplicate: true,
                    }
                })
                return
            }
            if (
                pathname === basePath
                && dashboardInviteId
                && isLoggedIn()
                && unAuthorized()
            ) {
                // If you're logged in and are on the base admin page
                await handleJoinDashboard()
                return
            }
            if (unAuthorized() && !joiningGroup) {
                await replace("/");
                return
            }
            if (pathname === basePath && isLoaded(group) && !isEmpty(group) && isAdmin()) {
                await replace(analyticsPath)
            }
        })()
    }, [group, authenticatedUser, userData, pathname]);

    const isLoggedIn = () => authenticatedUser.isLoaded && !authenticatedUser.isEmpty

    const unAuthorized = () => {
        return Boolean(
            ((isLoaded(group) && !isEmpty(group) && authenticatedUser.isLoaded && userData) && !isAdmin())
        )
    }

    const handleJoinDashboard = async () => {
        try {
            const isValidInvite = await firebase.validateDashboardInvite(dashboardInviteId, group.id, isCompany)
            if (!isValidInvite) {
                await replace("/")
                const message = "This invite link provided is no longer valid"
                enqueueSnackbar({
                    message,
                    options: {
                        variant: "error",
                        preventDuplicate: true,
                        key: message
                    }
                })
            } else {
                setJoiningGroup(true)
                await firebase.joinGroupDashboard(group.id, userData.userEmail, dashboardInviteId, isCompany)
                await replace(analyticsPath)
                const message = `Congrats, you are now an admin of ${isCompany ? group.name : group.universityName}`
                enqueueSnackbar({
                    message,
                    options: {
                        variant: "success",
                        preventDuplicate: true,
                        key: message
                    }
                })
            }
        } catch (error) {
            enqueueErrorSnackbar(error)
            setJoiningGroup(false)
        }
    }

    return {joiningGroup}
};

export default useDashboardRedirect;
