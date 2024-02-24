import { Plane } from './models.ts';

export type PixelsTypes = {
   pixelwidth: number;
   pixelheight: number;
   pixellength: number;
   planeradius: number;
 };
 
export type GeoTypes = {
   realwidth: number;
   realheight: number;
 };

export type MenuType = {
  visible: number,
  plane: Plane,
  pixelx: number,
  pixely: number
}

export type Point3DType = {
  x: number;
  y: number;
  z: number;
};

export type StatusType = {
  id: number;
  text?: string;
};