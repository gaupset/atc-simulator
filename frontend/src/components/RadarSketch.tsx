/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Sketch from 'react-p5';
import { Airport, Plane } from '../models';
import { GeoTypes, PixelsTypes } from '../types.ts';
import { drawAirport, drawPlane } from '../utils.ts';

interface RadarSketchProps {
    viewwidth: number
    viewheight: number
    planes: Plane[] | null
    selectedPlane: Plane | null
    pixels:PixelsTypes
    geo:GeoTypes
    airports:Airport[]
    onClick: (mouseX:number, mouseY:number, pixels:PixelsTypes, geo:GeoTypes) => void
}

const RadarSketch: React.FC<RadarSketchProps> = ({viewwidth,viewheight,planes,selectedPlane,pixels,geo,onClick,airports}) => {
    
    const setup = (p5: any, canvasParentRef: any) => {
        p5.createCanvas(viewwidth, viewheight).parent(canvasParentRef);
    };

    const mouseClicked = (p5: any) => {
        onClick(p5.mouseX, p5.mouseY, pixels, geo)
    };

    

    const draw = (p5: any) => {
        p5.background(0);

        //p5.createDiv("<p style='font-size: 40px;'>This is a div!</p>").position(300,300).style('color','white')
        const framerate=30
        
        airports.forEach(airport => {
            drawAirport(p5, airport, geo, pixels)
        })
        
        
        p5.frameRate(framerate);
        planes?.forEach(plane => {
            drawPlane(plane,p5, pixels, geo, selectedPlane);
        });
    };

    return(<Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />);
};

export default RadarSketch;