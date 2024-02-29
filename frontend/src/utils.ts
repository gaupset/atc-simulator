/* eslint-disable @typescript-eslint/no-explicit-any */
import { Airport, Plane } from "./models";
import { GeoTypes, PixelsTypes, Point3DType } from "./types";

export function posToPixels(x:number, y:number, pixels:PixelsTypes, geo:GeoTypes):[number,number] {
  const pixelX = (x / geo.realwidth ) * pixels.pixelwidth;
  const pixelY = (y / geo.realheight) * pixels.pixelheight;
  return [pixelX, pixelY];
 }

export function lenToPixels(length:number, pixels:PixelsTypes, geo:GeoTypes):number {
  const pixellength = (length / geo.realwidth ) * pixels.pixelwidth;
  return pixellength;
}

export function calculateRadAngleBetweenPoints(pointA: Point3DType, pointB: Point3DType, origin: Point3DType): number {
  const vectorA = {
    x: pointA.x - origin.x,
    y: pointA.y - origin.y,
    z: pointA.z - origin.z,
  };

  // Vector from origin to point B
  const vectorB = {
    x: pointB.x - origin.x,
    y: pointB.y - origin.y,
    z: pointB.z - origin.z,
  };

  // Calculate dot product of vectorA and vectorB
  const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;

  // Calculate magnitude (length) of vectorA
  const magnitudeA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2 + vectorA.z ** 2);

  // Calculate magnitude (length) of vectorB
  const magnitudeB = Math.sqrt(vectorB.x ** 2 + vectorB.y ** 2 + vectorB.z ** 2);

  // Calculate the angle in radians between vectorA and vectorB
  const angleRadians = Math.acos(dotProduct / (magnitudeA * magnitudeB));

  return angleRadians; // Returns angle in radians
}

export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}


export function degToRad(degrees: number): number {
  return (degrees+270) * (Math.PI / 180);
}

export function radToDeg(radians: number): number {
  let degrees = radians * (180 / Math.PI);
  degrees = (degrees) % 360;
  if (degrees < 0) degrees += 360;
  return degrees;
}

export function calculateDistance(x1: number, y1: number, z1:number, x2: number, y2: number, z2:number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

export function altitudeToFlightLevel(feet: number) {
  if (feet < 3000) {
    return (Math.round(feet/100) * 100).toString(); // Return the altitude in feet if below 100 feet
  } else {
    const fl = Math.floor(feet / 100); // Calculate flight level
    return "FL" + fl; // Return as a flight level string
  }
}

export function findPlaneClosestToMouseXY(mouseX: number, mouseY: number, pixels: PixelsTypes, geo: GeoTypes, planes: Plane[]): Plane | null {
  let closestPlane: Plane | null = null;
  let minDistance = Infinity;

  planes.forEach(plane => {
    const [planeX, planeY] = posToPixels(plane.x, plane.y, pixels, geo); 
    const distance = calculateDistance(mouseX, mouseY, 0, planeX, planeY, 0);

    if (distance < pixels.planeradius * 3 && distance < minDistance) {
      closestPlane = plane;
      minDistance = distance;
    }
  });
  return closestPlane;
}

export function findClosestWaypointToPlane(plane: Plane, waypoints: Point3DType[]): Point3DType {
  let closestWaypoint: Point3DType | null = null;
  let minDistance = Infinity;

  waypoints.forEach(waypoint => {
    const [planeX, planeY] = [plane.x, plane.y]; 
    const distance = calculateDistance(plane.x, plane.y, 0, waypoint.x, waypoint.y, 0);

    if (distance < minDistance) {
      closestWaypoint = waypoint;
      minDistance = distance;
    }
  });
  return closestWaypoint;
}

export function drawAirport(p5: any, airport: Airport, geo: GeoTypes, pixels: PixelsTypes) {
  p5.strokeWeight(5);
  p5.stroke(255)
  p5.fill(255)
  const [startx, starty] = posToPixels(airport.xstart, airport.ystart, pixels, geo);

  const deltax = airport.length * Math.cos(degToRad(airport.angle));
  const deltay = airport.length * Math.sin(degToRad(airport.angle));

  const deltaxlong = 10*airport.length * Math.cos(degToRad(airport.angle));
  const deltaylong = 10*airport.length * Math.sin(degToRad(airport.angle));

  // Calculate end position by adding Δx and Δy to the start position
  const [endx, endy] = posToPixels(
    airport.xstart + deltax, 
    airport.ystart + deltay, 
    pixels, 
    geo
  );

  p5.line(startx, starty, endx, endy);
  p5.strokeWeight(0.3);

  const [startxlong, startylong] = posToPixels(
    airport.xstart + deltax/2 - deltaxlong/2, 
    airport.ystart + deltay/2 - deltaylong/2, 
    pixels, 
    geo
  );

  const [endxlong, endylong] = posToPixels(
    airport.xstart + deltax/2 + deltaxlong/2, 
    airport.ystart + deltay/2 + deltaylong/2, 
    pixels, 
    geo
  );
  p5.line(startxlong, startylong, endxlong, endylong);

  p5.noStroke(); // No stroke around the text
  p5.textSize(12); // Text size, adjust as needed

  // Position for the airport name text, adjust the offsets as needed
  const textX = endx+40; // Offset a bit to the right of the runway end
  const textY = endy+40; // Offset a bit below the runway end

  p5.text(airport.name, textX, textY);

  airport.runways.forEach(runway => {
    runway.waypoints.forEach(waypoint => {
      const [pixelx, pixely] = posToPixels(waypoint.x, waypoint.y, pixels, geo)
      p5.circle(pixelx, pixely,1)
    })
  })
}

export function drawPlane(plane: Plane, p5: any, pixels: PixelsTypes, geo: GeoTypes, selectedPlane: Plane | null):void {
  p5.noStroke()
  p5.fill(255)
  if(selectedPlane == plane) {
    plane.prevpos.forEach(prevpos => {
      const prevpixels = posToPixels(prevpos.x,prevpos.y,pixels,geo)
      p5.fill(255)
      p5.circle(prevpixels[0],prevpixels[1],1);
    });
  }
  
  const [pixelX, pixelY] = posToPixels(plane.x, plane.y, pixels, geo);
  
  if (plane == selectedPlane) {
    p5.fill(0,98,255)
  } else if (plane.squawk == "7500" || plane.squawk == "7600" || plane.squawk == "7700") {
    p5.fill(255,0,0)
  }
  p5.noStroke();
  

  //Plane
  p5.circle(pixelX, pixelY, pixels.planeradius); // Draw the plane as a rectangle
 
  //Text
  p5.textSize(20);


  const textPlaneSeparation = 2.5
  //Right text  -Callsign and swuawk
  p5.textAlign(p5.LEFT)
  p5.text(plane.callsign, pixelX + pixels.planeradius*textPlaneSeparation, pixelY-pixels.planeradius);
  p5.text(plane.squawk, pixelX + pixels.planeradius*textPlaneSeparation, pixelY+pixels.planeradius);
  
  //Left text - Heading and flight level
  p5.textAlign(p5.RIGHT); // Align text to the right
  p5.text(Math.round(plane.heading,0), pixelX - pixels.planeradius*textPlaneSeparation,  pixelY-pixels.planeradius);
  p5.text(altitudeToFlightLevel(plane.altitude), pixelX - pixels.planeradius*textPlaneSeparation, pixelY+pixels.planeradius);
  
  //Draw heading
  const lineLength = 20; // Length of the line representing the heading
  const angle = degToRad(plane.heading); // Convert heading to radians
  const endX = pixelX + lineLength * Math.cos(angle);
  const endY = pixelY + lineLength * Math.sin(angle);
  
  p5.stroke(255)
  if (plane == selectedPlane) {
    p5.stroke(0,98,255)
  } else if (plane.squawk == "7500" || plane.squawk == "7600" || plane.squawk == "7700") {
    p5.stroke(255,0,0)
  }

  p5.strokeWeight(2); // Set a thicker stroke weight to ensure visibility
  p5.line(pixelX, pixelY, endX, endY); // Draw the line

  
}