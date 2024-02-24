let pixels = {
   pixelwidth: 1250,
   pixelheight: 1000,
   pixellength: 200,
   planeradius: 5,
 };
 
 let geo = {
   realwidth: pixels.pixelwidth * pixels.pixellength,
   realheight: pixels.pixelheight * pixels.pixellength
 }
 
 // Updated Plane constructor to include callsign and squawk
 function Plane(x, y, callsign, squawk, heading, altitude, speed) {
   this.x = x;
   this.y = y;
   this.callsign = callsign; // New property
   this.squawk = squawk; // New property
   this.heading = heading; // New property for heading
   this.altitude = altitude;
   this.speed = speed;
 
   this.display = function() {
     console.log('Plane position: x = ' + this.x + ', y = ' + this.y);
   };
   
   this.updatePosition = function(deltaTime) {
     // Time elapsed per frame, assuming 1 frame per second for simplicity
 
     // Convert heading to radians for calculation
     let angleRad = radians(this.heading);
 
     // Calculate the distance moved in each direction in meters
     let distanceX = this.speed * cos(angleRad) * deltaTime;
     let distanceY = this.speed * sin(angleRad) * deltaTime;
 
     // Convert distance moved from meters to pixels using the scale
     let [pixeldX, pixeldY] = posToPixels(distanceX, distanceY);
 
     // Update the plane's position
     this.x += pixeldX;
     this.y += pixeldY;
   }; 
 }
 
 function Airport(x, y, runwayLength, runwayName, angle) {
   this.x = x;
   this.y = y;
   this.runwayLength = runwayLength; // in meters for real-world scale
   this.runwayName = runwayName;
   this.angle = angle; // in degrees, angle of the runway relative to north
 }
 
 // Example plane with callsign and squawk
 let plane1 = new Plane(50000, 10000, "ABC123", "7500", 90, 30000, 650);
 let plane2 = new Plane(15000, 25000, "G-ABCD", "7700", 270, 32500, 450);
 let plane3 = new Plane(200000, 32000, "EJ1234", "7600", 180, 31999, 350);
 let plane4 = new Plane(150000, 35000, "GOFAST", "2244", 45, 1230, 450);
 
 let airport = new Airport(400, 400, 1500, "09/27", 45)
 
 function posToPixels(x, y) {
   // Adjustments to correctly map real world position to game world pixels
   let pixelX = (x / geo.realwidth) * width;
   let pixelY = (y / geo.realheight) * height;
   return [pixelX, pixelY];
 }
 
 function drawRunway(runway) {
   // Calculate the runway's end points based on its length and angle
   let halfLength = this.runwayLength / 2 / scale.x; // Convert length to pixels and divide by 2 for centering
   let angleRad = radians(this.angle);
   let endX1 = this.x + cos(angleRad + PI / 2) * halfLength;
   let endY1 = this.y + sin(angleRad + PI / 2) * halfLength;
   let endX2 = this.x + cos(angleRad - PI / 2) * halfLength;
   let endY2 = this.y + sin(angleRad - PI / 2) * halfLength;
 
   // Draw the runway as a line
   stroke(255);
   strokeWeight(2);
   line(endX1, endY1, endX2, endY2);
 
   // Draw the runway name
   noStroke();
   textSize(12);
   textAlign(CENTER, CENTER);
   fill(255, 255, 0); // Yellow color for visibility
   text(this.runwayName, this.x, this.y - 10); // Position the name above the runway center
 }
 
 function drawPlane(plane) {
   let [pixelX, pixelY] = posToPixels(plane.x, plane.y);
   fill(255); // Set fill color to white for visibility
   noStroke();
   circle(pixelX, pixelY, pixels.planeradius); // Draw the plane as a rectangle
   
   // Set text properties
   textSize(12);
   fill(255, 255, 255); // Text color white for visibility
   textAlign(LEFT)
   text(plane.callsign, pixelX + pixels.planeradius*2, pixelY-pixels.planeradius); // Display callsign to the right
   text(plane.squawk, pixelX + pixels.planeradius*2, pixelY + 15-pixels.planeradius); // Display squawk below the callsign
   textAlign(RIGHT); // Align text to the right
 
   // Display heading and FL to the left of the plane, text aligned right
   text(plane.heading, pixelX - pixels.planeradius*2,  pixelY-pixels.planeradius); // Heading above the center
   text(altitudeToFlightLevel(plane.altitude), pixelX - pixels.planeradius*2, pixelY + 15-pixels.planeradius); // FL below the center
   
   //Draw heading
   let lineLength = 12; // Length of the line representing the heading
   let angle = radians(plane.heading); // Convert heading to radians
   let endX = pixelX + lineLength * cos(angle);
   let endY = pixelY + lineLength * sin(angle);
   stroke(255); // Explicitly set stroke color to white
   strokeWeight(2); // Set a thicker stroke weight to ensure visibility
   line(pixelX, pixelY, endX, endY); // Draw the line
 
   // Reset text alignment and color for labels
   noStroke(); // No stroke for text
   fill(255); // White text
 }
 
 function altitudeToFlightLevel(feet) {
   if (feet < 3000) {
     return (Math.round(feet/100) * 100).toString(); // Return the altitude in feet if below 100 feet
   } else {
     let fl = Math.floor(feet / 100); // Calculate flight level
     return "FL" + fl; // Return as a flight level string
   }
 }

  function setup() {
   createCanvas(pixels.pixelwidth, pixels.pixelheight); // Adjusted for demonstration purposes
 }
 
 function draw() {
   framerate=30
   frameRate(framerate);
   background(0);
   plane1.updatePosition(plane1.speed/framerate)
   drawPlane(plane1);
   plane2.updatePosition(plane1.speed/framerate)
   drawPlane(plane2);
   plane3.updatePosition(plane1.speed/framerate)
   drawPlane(plane3);
   plane4.updatePosition(plane1.speed/framerate)
   drawPlane(plane4);
 }