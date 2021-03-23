import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import StatisticsOverview from "../../components/views/admin/Statistics";
import AdminDashboardLayout from "../../layouts/AdminDashboardLayout";

const useStyles = makeStyles(theme => ({}));

const StatisticsPage = ({}) => {

    const classes = useStyles()

    return (
        <AdminDashboardLayout>
            <StatisticsOverview/>
        </AdminDashboardLayout>
    );
};

export default StatisticsPage;
