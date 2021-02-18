import React from 'react'
import Link from "next/link";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    mainLogo: {
        cursor: 'pointer',
        width: '150px',
        display: 'inline-block',
        marginTop: '10px',
        // marginLeft: '10px'
    }
}))
export const MainLogo = ({white}) => {
    const classes = useStyles()
    return (
        <Link href='/'>
            <a>
                <img alt="CareerFairy Logo"
                     src={white ? '/logo_white.png' : '/logo_teal.png'}
                     className={classes.mainLogo}/>
            </a>
        </Link>
    )
}
export const MiniLogo = ({size = 30}) => {
    return (
        <Link href='/'>
            <a>
                <img alt="CareerFairy Logo"
                     width={size}
                     height={size}
                     src={"/apple-touch-icon-57x57.png"}/>
            </a>
        </Link>
    )
}