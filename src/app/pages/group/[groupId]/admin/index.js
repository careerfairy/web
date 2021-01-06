import React, {useContext, useEffect, useState} from "react";
import {useRouter} from "next/router";
import Header from "../../../../components/views/header/Header";
import Head from "next/head";
import Footer from "../../../../components/views/footer/Footer";
import AdminHeader from "../../../../components/views/group/admin/AdminHeader";
import GroupNav from "../../../../components/views/group/admin/GroupNav";
import {withFirebase} from "../../../../context/firebase";
import Loader from "../../../../components/views/loader/Loader";
import {isEmptyObject} from "../../../../components/helperFunctions/HelperFunctions";
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout";
import {useAuth} from "../../../../HOCs/AuthProvider";
import {Container} from "@material-ui/core";

const JoinGroup = ({props}) => {
    const router = useRouter();
    // console.log("-> props", props);

    const {authenticatedUser: user, userData, loading} = useAuth();

    const [group, setGroup] = useState({});
    const [menuItem, setMenuItem] = useState("settings");

    const unAuthorized = () => {
        return Boolean(
            (!isEmptyObject(group) && user && userData)
            && (user.email !== group.adminEmail) && !userData.isAdmin
        )
    }

    // if (user === null || userData === null || loading === true || unAuthorized()) {
    //     return <Loader/>;
    // }


    return (
        <>
            <Head>
                <title key="title">CareerFairy | Admin</title>
            </Head>
            <Container maxWidth="lg">
                <div>hi</div>
            </Container>
        </>
    )
    {/*<Header classElement="relative white-background"/>*/
    }
    {/*<AdminHeader group={group} menuItem={menuItem}/>*/
    }
    {/*<GroupNav*/
    }
    {/*    group={group}*/
    }
    {/*    groupId={groupId}*/
    }
    {/*    userData={userData}*/
    }
    {/*    user={user}*/
    }
    {/*/>*/
    }
    {/*<Footer/>*/
    }
    {/*<style jsx>{`*/
    }
    {/*  .hidden {*/
    }
    {/*    display: none;*/
    }
    {/*  }*/
    }

    {/*  .greyBackground {*/
    }
    {/*    display: flex;*/
    }
    {/*    flex-direction: column;*/
    }
    {/*    background-color: rgb(250, 250, 250);*/
    }
    {/*    height: 100%;*/
    }
    {/*    min-height: 100vh;*/
    }
    {/*  }*/
    }

    {/*  .white-box {*/
    }
    {/*    padding: 10px;*/
    }
    {/*    margin: 10px 0 10px 0;*/
    }
    {/*    text-align: left;*/
    }
    {/*  }*/
    }

    {/*  .title-container {*/
    }
    {/*    display: flex;*/
    }
    {/*    align-items: center;*/
    }
    {/*  }*/
    }

    {/*  .image-container {*/
    }
    {/*    position: relative;*/
    }
    {/*    width: 100%;*/
    }
    {/*    padding-top: 95%;*/
    }
    {/*    border-radius: 50%;*/
    }
    {/*    border: 5px solid rgb(0, 210, 170);*/
    }
    {/*    background-color: white;*/
    }
    {/*    margin: 0 auto;*/
    }
    {/*    box-shadow: 0 0 5px rgb(200, 200, 200);*/
    }
    {/*  }*/
    }

    {/*  .field-error {*/
    }
    {/*    margin-top: 10px;*/
    }
    {/*    color: red;*/
    }
    {/*  }*/
    }

    {/*  .join-group-title {*/
    }
    {/*    text-align: left;*/
    }
    {/*    margin: 0 0 30px 0;*/
    }
    {/*    font-weight: 700;*/
    }
    {/*    font-size: 1.3em;*/
    }
    {/*    color: rgb(80, 80, 80);*/
    }
    {/*  }*/
    }

    {/*  .sublabel {*/
    }
    {/*    margin: 40px 0 15px 0;*/
    }
    {/*    text-align: center;*/
    }
    {/*  }*/
    }

    {/*  #profileContainer {*/
    }
    {/*    padding: 30px 0;*/
    }
    {/*  }*/
    }
    {/*`}</style>*/
    }

    ;
};

JoinGroup.layout = GroupDashboardLayout

export default JoinGroup;
