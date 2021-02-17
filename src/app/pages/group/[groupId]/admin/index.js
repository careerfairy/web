import React, {useEffect} from "react";
import {useRouter} from "next/router";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import Page from "../../../../components/page";

// the /admin page is just a redirect for now it also eareses it self from the browser history
const AdminPage = () => {
    const {replace, asPath} = useRouter();
    useEffect(() => {
        // replace(`${asPath}/upcoming-livestreams`)

    }, [asPath])

    return (
        <Page title="CareerFairy | Admin">
            <div/>
        </Page>
    )
};

AdminPage.layout = GroupDashboardLayout

export default AdminPage;
