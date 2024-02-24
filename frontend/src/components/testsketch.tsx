/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Sketch from 'react-p5';

interface RadarSketchProps {
    viewwidth: number
    viewheight: number
}

const Testsketch: React.FC<RadarSketchProps> = ({ viewwidth, viewheight }) => {
    const setup = (p5: any, canvasParentRef: any) => {
        // Use viewwidth and viewheight for the canvas dimensions
        p5.createCanvas(viewwidth, viewheight).parent(canvasParentRef);
    };

    const draw = (p5: any) => {
        p5.background(255, 120, 255);
        p5.ellipse(100, 100, 100);
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default Testsketch;