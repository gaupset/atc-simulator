import { GeoTypes, PixelsTypes, Point3DType, StatusType } from "./types.ts";
import { calculateDistance, calculateRadAngleBetweenPoints, degToRad, feetToMeters, findClosestWaypointToPlane, posToPixels, radToDeg } from "./utils.ts";

export class Airport {
   xstart: number
   ystart: number
   angle: number
   name: string
   length: number
   runways!: {
    pos:Point3DType
    waypoints:Point3DType[]
  }[]
 
   constructor(xstart: number, ystart: number, angle: number, name: string, length: number, pixels: PixelsTypes, geo: GeoTypes) {
     this.xstart = xstart;
     this.ystart = ystart;
     this.angle = angle;
     this.name = name
     this.length = length
     this.runways = []

     const runwayx = this.xstart + this.length * Math.cos(degToRad(this.angle));
     const runwayy = this.ystart + this.length * Math.sin(degToRad(this.angle));
    
      //Runway 1:
      let runwayPoint: Point3DType = {x: this.xstart, y: this.ystart, z: 0}
      let waypoints: Point3DType[] = []

      for (let index = 1; index <= 8; index++) {
        const waypointx = runwayx + 0.5 * index * this.length * Math.cos(degToRad(this.angle));
        const waypointy = runwayy + 0.5 * index * this.length * Math.sin(degToRad(this.angle));
        waypoints.push({ x: waypointx, y: waypointy, z: 0 })
      }
      this.runways.push({
        pos: runwayPoint,
        waypoints: waypoints
      })



      //For both runways
      runwayPoint  = {x: this.xstart, y: this.ystart, z: 0}
      waypoints = []

      for (let index = 1; index <= 8; index++) {
        const waypointx = this.xstart + 0.5 * index * this.length * Math.cos(degToRad(this.angle-180));
        const waypointy = this.ystart + 0.5 * index * this.length * Math.sin(degToRad(this.angle-180));
        waypoints.push({ x: waypointx, y: waypointy, z: 0 })
      }
      this.runways.push({
        pos: runwayPoint,
        waypoints: waypoints
      })
   }
 }

 
export class Plane {
  id: number
  x: number
  y: number
  callsign:string
  squawk: string

  heading: number
  altitude: number
  speed:number

  theading: number
  taltitude: number
  tspeed:number

  selectedPlane: boolean
  prevpos!: { x: number; y: number }[];

  status: number
  statusText!: string

  turntime!: Date

  approaching!: {
    pos:Point3DType
    waypoints:Point3DType[]
  }

  constructor(id:number, x: number, y: number, callsign: string, squawk: string, heading: number, altitude: number, speed: number, theading: number, taltitude: number, tspeed: number, status:number) {
     this.id = id
     this.x = x;
     this.y = y;
     this.callsign = callsign;
     this.squawk = squawk;

     this.heading = heading;
     this.altitude = altitude;
     this.speed = tspeed;

     this.theading = theading;
     this.taltitude = taltitude;
     this.tspeed = tspeed;

     this.selectedPlane = false
     this.prevpos = [{ x: this.x, y: this.y }];
     this.status = status //1 Cruise, (1) Descent, (1) Climbing, 2 Hold, 3 Aproach, 4 Go Around
     this.turntime = new Date()
     this.statusText = "Not defined yet"
   }

   updatePosition(deltaTime: number): void {

    const now: Date = new Date();

    // Convert heading to radians for calculation
    const angleRad = degToRad(this.heading);
    
    if (this.status == 1) {
      if (this.taltitude > this.altitude) {
        this.statusText = "Climbing"
      } else if (this.taltitude < this.altitude) {
        this.statusText = "Descending"
      } else if (this.taltitude == this.altitude) {
        this.statusText = "Cruise"
      }
    } else if (this.status == 2) {
      this.statusText = "Holding"
    } else if (this.status == 3) {
        this.statusText = "Approaching"
        //Check if angle less than 20

        const headingVectorX = this.x + Math.cos(angleRad) * 1000;
        const headingVectorY = this.y + Math.sin(angleRad) * 1000;
    
        const headingToAirportAngle:number  = calculateRadAngleBetweenPoints(
          { x: headingVectorX, y: headingVectorY, z:0 }, 
          { x: this.approaching.pos.x, y: this.approaching.pos.y, z: 0 }, 
          { x: this.x, y: this.y, z: 0}
        )
        
        //If angle betweem airport and plane horizontally less than 30 deg
        if (Math.abs(headingToAirportAngle) < Math.PI/9) {
          
          const verticaldistanceToRunway = feetToMeters(this.altitude)
          const horizontaldistanceToRunway = calculateDistance(this.x, this.y, 0, this.approaching.pos.x, this.approaching.pos.y, 0)

          //Adjust glideslope
          if (horizontaldistanceToRunway < verticaldistanceToRunway*3) {
            if (horizontaldistanceToRunway < verticaldistanceToRunway*3 && horizontaldistanceToRunway < 10000) {
              //Too high - go around
              this.status = 4
              this.taltitude = Math.max(7000, this.altitude)
            } else {
              //Too high - go lower
              this.taltitude = 0
            }
          } else {
            //Too low
            this.taltitude = Infinity
          }

          //Head to closest waypoint
          const closestWaypoint: Point3DType = findClosestWaypointToPlane(this, this.approaching.waypoints)
          const headingToClosestWaypoint: number = calculateRadAngleBetweenPoints(
            { x: headingVectorX, y: headingVectorY, z:0 },
            { x: closestWaypoint.x, y: closestWaypoint.y, z: 0 },
            { x: this.x, y: this.y, z: 0}
          )
          console.log("theading: ",this.theading,"heading:",this.heading,"headingtoclosest:(deg)",radToDeg(headingToClosestWaypoint),"headingtoclosest:(rad)",headingToClosestWaypoint)
          this.theading = this.heading + radToDeg(headingToClosestWaypoint)
          
          //If distance to closest waypoint less than 1000, remove waypoint from list!!!


          
        } else { 
          //Too tight angle for approach
          this.status = 1
        }

        //If yes, find closest waypoint, aim for it
        //If len airplane airport less than 2x airstrip, "Final approach" 
    } else if (this.status == 4) {
      this.statusText = "Going around"
    }
    
    //Make hold turn
    if (now > this.turntime && this.status == 2) {
      this.turntime = new Date(now.getTime());
      this.turntime.setSeconds(this.turntime.getSeconds() + 20);
      this.theading=this.heading+180%360
    }

    //Go around done
    if (this.status == 4 && this.taltitude == this.altitude) {
      this.status = 1
    }

    //Landed
    //...

    const headingDifference = this.calculateDifference(this.heading, this.theading, 360);
    const altitudeDifference = this.taltitude - this.altitude;
    const speedDifference = this.tspeed - this.speed;

    const maxHeadingChange = 1* 3 * deltaTime; // 180 degrees per minute
    const maxAltitudeChange = 2 * 33.33 * deltaTime; // 2000 feet per minute
    const maxSpeedChange = 2 * 5 * deltaTime; // 5 m/s^2

    this.heading += Math.sign(headingDifference) * Math.min(Math.abs(headingDifference), maxHeadingChange);
    this.heading = this.heading % 360
    if (this.heading <= 0) {
        this.heading = 360;
    }
    this.altitude += Math.sign(altitudeDifference) * Math.min(Math.abs(altitudeDifference), maxAltitudeChange);
    this.speed += Math.sign(speedDifference) * Math.min(Math.abs(speedDifference), maxSpeedChange);

     
 
     // Calculate the distance moved in each direction in meters
     //this.callsign == "GOFAST" ? console.log("Speed:",this.speed,"Deltatime",deltaTime,"Cos",Math.sin(angleRad),"Y",this.y,"X",this.x) : null  
     
     const distanceX = this.speed * Math.cos(angleRad) * deltaTime;
     const distanceY = this.speed * Math.sin(angleRad) * deltaTime;
 
     // Update the plane's position
     this.x += distanceX;
     this.y += distanceY;

     this.prevpos.push({ x: this.x, y:this.y })
     if (this.prevpos.length > 4000) {
      this.prevpos.shift();  
      }
    
   }

    startApproach(airport: Airport) {
      this.status = 3
      const distanceToRunway1 = calculateDistance(this.x, this.y, 0, airport.runways[0].pos.x, airport.runways[0].pos.y, 0)
      const distanceToRunway2 = calculateDistance(this.x, this.y, 0, airport.runways[1].pos.x, airport.runways[1].pos.y, 0)

      if (distanceToRunway1 < distanceToRunway2) {
        this.approaching = airport.runways[0]
      } else {
        this.approaching = airport.runways[1]
      }
    }

    goAround() {
      this.status = 4
    }

    startHold() {
      this.status = 2
      this.taltitude = this.altitude,
      this.theading = this.heading
      this.tspeed = this.speed 
   }

   private calculateDifference(current: number, target: number, mod: number): number {
    const diff = (target - current + mod) % mod;
    return diff > mod / 2 ? diff - mod : diff;
  }
}