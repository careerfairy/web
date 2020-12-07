import React from 'react'
import Slider from "react-slick";
import LogoElement from "../../LogoElement";


const LogosCarousel = ({logos, checkIfUserFollows, user, userData, livestreamId}) => {


    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
    }

    const logoElements = logos.map(logo => {
        return (
            <LogoElement key={logo.groupId} livestreamId={livestreamId}
                         userFollows={checkIfUserFollows(logo)}
                         careerCenter={logo} userData={userData} user={user}/>
        )
    })

    return (
        <Slider {...settings}>
            {logoElements}
            {logoElements}
            {logoElements}
            {logoElements}
        </Slider>
    )
}

export default LogosCarousel