import React, {Fragment} from 'react';
import "./index.css";
import "slick-carousel/slick/slick.css";

import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick"


const GroupsCarousel = () => {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    }

    return (
        <Fragment>
            <Slider {...settings}>
                <div>
                    <h3>1</h3>
                </div>
                <div>
                    <h3>2</h3>
                </div>
                <div>
                    <h3>3</h3>
                </div>
                <div>
                    <h3>4</h3>
                </div>
                <div>
                    <h3>5</h3>
                </div>
                <div>
                    <h3>6</h3>
                </div>
            </Slider>
            <style jsx>{`
                  .App {
                     text-align: center;
                     min-width: 375px;
                     max-width: 100%;
                 
                 }
                 
                 .App-logo {
                     height: 40vmin;
                 }
                 
                 .slick-current.slick-active.slick-center {
                     opacity: 1;
                     filter: brightness(1) !important;
                 }
                 
                 
                 .App-header {
                 
                     min-height: 100vh;
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
                     font-size: calc(10px + 2vmin);
                 }
                 
                 .App-link {
                     color: #222222;
                 }
                 
                 .slides .slick-prev,
                 .slides .slick-next {
                 
                     position: absolute;
                     top: 50%;
                     z-index: 2;
                 }
                 
                 .slick-arrow {
                     filter: invert(0%) sepia(21%) saturate(1636%) hue-rotate(31deg) brightness(107%) contrast(73%) !important;
                 }
                 
                 .slides {
                     position: relative;
                 }
                 
                 
                 
                 .slides .slick-prev,
                 .slides .slick-next {
                 
                     position: absolute;
                     top: 50%;
                     z-index: 2;
                 }
                 
                 .slides .slick-prev {
                     left: 5%;
                 }
                 
                 .slides .slick-next {
                     right: 5%;
                 }
                        
            `}</style>
        </Fragment>
    )

};

export default GroupsCarousel;
