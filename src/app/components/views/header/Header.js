import {useEffect, useState, Fragment, useContext} from 'react'
import {withFirebase} from "context/firebase";
import {Icon} from "semantic-ui-react";
import AuthenticatedHeader from "./authenticated-header/AuthenticatedHeader";
import NonAuthenticatedHeader from "./non-authenticated-header/NonAuthenticatedHeader";
import {compose} from "redux"

import Link from 'next/link';
import {useRouter, withRouter} from 'next/router';
import LandingHeader from './landing-header/LandingHeader';
import {Button} from "@material-ui/core";
import UserContext from "../../../context/user/UserContext";

function Header(props) {
    const [authenticated, setAuthenticated] = useState(false);
    const [sidebarState, setSidebarState] = useState("unopened");
    const {userData, authenticatedUser} = useContext(UserContext)
    console.log("userData in header", userData);

    const {push} = useRouter()

    useEffect(() => {
        if (userData) {
            setAuthenticated(true);
        } else {
            setAuthenticated(false);
        }
    }, [userData]);

    const handleLogout = () => {
        props.firebase.doSignOut().then(
            push("/login")
        )
    }

    const ConstantSideHeader = () => {
        return (
            <div className='sidebar'>
                <Icon name='times circle outline' size='big' onClick={toggleSideBar} style={{cursor: 'pointer'}}/>
                <ul>
                    <li><Link href='/next-livestreams'><a>Next Live Streams</a></Link></li>
                    <li><Link href='/discover'><a>Past Live Streams</a></Link></li>
                    <li><Link href='/companies'><a>Companies</a></Link></li>
                    <li><Link href='/wishlist'><a>Wishlist</a></Link></li>
                    <li><a href='https://corporate.careerfairy.io/companies'>For Companies</a></li>
                    <li><a href='https://corporate.careerfairy.io/career-center'>For Career Centers</a></li>
                    <li><Link
                        href={authenticated ? '/profile' : '/login'}><a>{authenticated ? 'My Profile' : 'Log in'}</a></Link>
                    </li>
                    {authenticated &&
                    <li><Button onClick={handleLogout} variant="contained" color="primary">Logout</Button></li>}

                </ul>
                <style jsx>{`
                    .sidebar {
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 300px;
                        background-color: rgba(30,30,30, 0.95);
                        z-index: 9999;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }

                    .sidebar.hidden {
                        display: none;
                    }

                    .sidebar ul {
                        margin-top: 50px;
                        list-style-type: none;
                        padding: 0;
                    }

                    .sidebar ul li {
                        font-size: 1.2em;
                        margin-top: 30px;
                    }

                    .sidebar a, .sidebar div {
                        font-weight: 600;
                        color: white;
                        text-transform: uppercase;
                    }

                    .sidebar a:hover, .sidebar div:hover {
                        cursor: pointer;
                        color: rgb(28,184, 149);
                    }

                    @media screen and (max-width: 992px) {
                        #sidebar-toggle {
                            display: inline-block;
                        }
                    }

                    @media screen and (max-width: 600px) {
                        .sidebar {
                            width: 100%;
                        }
                    }
                `}</style>
            </div>
        );
    }

    function toggleSideBar() {
        if (sidebarState === "unopened" || sidebarState === "closed") {
            setSidebarState("opened");
        } else {
            setSidebarState("closed");
        }
    }

    let TopHeader = null;

    if (props.page === 'landing') {
        TopHeader = (props) => {
            return (
                <LandingHeader {...props} toggleSideBar={toggleSideBar} authenticated={authenticated}/>
            );
        }
    } else if (authenticated) {
        TopHeader = (props) => {
            return (
                <AuthenticatedHeader {...props} toggleSideBar={toggleSideBar}/>
            );
        }
    } else {
        TopHeader = (props) => {
            return (
                <NonAuthenticatedHeader {...props} toggleSideBar={toggleSideBar}/>
            );
        }
    }

    return (
        <Fragment>
            <div id="mainHeader" className={props.classElement}>
                <TopHeader {...props}/>
            </div>
            <div
                className={sidebarState === "unopened" ? 'sidebar hidden' : sidebarState === "opened" ? 'sidebar animated slideInLeft faster' : 'sidebar animated slideOutLeft faster'}>
                <Icon name='times circle outline' size='big' onClick={toggleSideBar} style={{cursor: 'pointer'}}/>
                <ul>
                    <li><Link href='/next-livestreams'><a>Next Live Streams</a></Link></li>
                    <li><Link href='/discover'><a>Past Live Streams</a></Link></li>
                    <li><Link href='/companies'><a>Companies</a></Link></li>
                    <li><Link href='/wishlist'><a>Wishlist</a></Link></li>
                    <li><a href='https://corporate.careerfairy.io/companies'>For Companies</a></li>
                    <li><a href='https://corporate.careerfairy.io/career-center'>For Career Centers</a></li>
                    <li><Link
                        href={authenticated ? '/profile' : '/login'}><a>{authenticated ? 'My Profile' : 'Log in'}</a></Link>
                    </li>
                    {authenticated && <li><Button onClick={handleLogout} color="primary">Logout</Button></li>}
                </ul>
            </div>
            <style jsx>{`
                #mainHeader header #signupLink:hover, #mainHeader header #wishlistLink:hover {
                    background-color: rgb(0,210,170);
                }
                
                header {
                    padding: 15px 20px;
                    text-align: left;
                    height: 80px;
                }

                i {
                    cursor: pointer;
                }

                i:hover {
                    color: rgba(220,220,220);
                }

                .sidebar {
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 300px;
                        background-color: rgba(30,30,30, 0.95);
                        z-index: 9999;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }

                    .sidebar.hidden {
                        display: none;
                    }

                    .sidebar ul {
                        margin-top: 50px;
                        list-style-type: none;
                        padding: 0;
                    }

                    .sidebar ul li {
                        font-size: 1.2em;
                        margin-top: 30px;
                    }

                    .sidebar a, .sidebar div {
                        font-weight: 600;
                        color: white;
                        text-transform: uppercase;
                    }

                    .sidebar a:hover, .sidebar div:hover {
                        cursor: pointer;
                        color: rgb(28,184, 149);
                    }

                    @media screen and (max-width: 992px) {
                        #sidebar-toggle {
                            display: inline-block;
                        }
                    }

                    @media screen and (max-width: 600px) {
                        .sidebar {
                            width: 100%;
                        }
                    }
            `}</style>
        </Fragment>
    );
}

export default compose(withFirebase, withRouter)(Header);