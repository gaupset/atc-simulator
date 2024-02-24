import {
  DndContext,
  MouseSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
} from "@dnd-kit/sortable";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import './App.css';
import RadarSketch from './components/RadarSketch';
import { SortableItem } from './components/SortableItem';
import { Airport, Plane } from './models';
import { GeoTypes, PixelsTypes, Point3DType, StatusType } from './types';
import { feetToMeters, findPlaneClosestToMouseXY } from './utils';


function App() {
  
  const width = window.innerWidth, height = window.innerHeight

  const pixels: PixelsTypes = {
    pixelwidth: width,
    pixelheight: height-452,
    pixellength: 150,
    planeradius: 10,
  };

  const geo: GeoTypes = {
      realwidth: pixels.pixelwidth * pixels.pixellength,
      realheight: pixels.pixelheight * pixels.pixellength,
  }

  const [planes, setPlanes] = useState<Plane[] | null>([
    new Plane(1, 40000, 8000, "ABC123", "1500", 90, 30000, 250, 90, 30000, 250, 1),
    //new Plane(2, 40000, 16000, "G-ABCD", "2160", 270, 32500, 350, 270, 32500, 350, 1),
    //new Plane(3, 40000, 24000, "EJ1234", "1500", 180, 31999, 650,180, 31999, 650, 2),
    //new Plane(4, 40000, 32000, "GOFAST", "7700", 180, 37000, 600, 90, 30000, 600, 1),
    //new Plane(5, 40000, 36000, "YEEET", "1500", 180, 31999, 650,180, 31999, 650, 2),
    //new Plane(6, 40000, 40000, "15ZOOM", "1500", 180, 20000, 600, 90, 30000, 600, 1),
    new Plane(7, 40000, 44000, "12RAPIDO", "1500", 180, 31999, 650,180, 31999, 650, 2),
    new Plane(8, 40000, 90000, "78SCHNELL", "1500", 20, 20000, 600, 20, 30000, 1200, 1)
  ])

  const [airports, setAirports] = useState<Airport[]>([
    new Airport(60000,40000,20,"OSL",3962,pixels,geo)
  ])

  const [selectedPlane,updateSelectedPlane] = useState<Plane | null>(planes[0])
  const [selectedHeading, setHeading] = useState<string>('');
  const [selectedAltitude, setAltitude] = useState<string>('');
  const [selectedStatus, setStatus] = useState<string>('');
  const [selectedCallsign, setCallsign] = useState<string>('');

  const [arrivals, setArrivals] = useState<Plane[] | null>([
    planes![0],
    //planes![1],
    //planes![2],
    //planes![3],
    //planes![4],
    //planes![5]
  ])

  const handleClick = (mouseX: number, mouseY: number, pixels:PixelsTypes, geo: GeoTypes) => {   
    if (mouseY <= pixels.pixelheight) {
      updateSelectedPlane(findPlaneClosestToMouseXY(mouseX, mouseY, pixels, geo, planes))
    }
  };

  const framerate = 5;
  const updateInterval = 1000 / framerate; // Interval in milliseconds
  const speedUp = 5; // Factor to speed up or slow down the simulation

  useEffect(() => {
    if (selectedPlane !== null) {
      setCallsign(selectedPlane.callsign);
      setAltitude(selectedPlane.altitude.toString());
      setStatus(selectedPlane.statusText.toString());
      setHeading(selectedPlane.heading.toString());
    }
  }, [selectedPlane])

  useEffect(() => {
    // Set up an interval to update plane positions
    const interval = setInterval(() => {
      planes?.forEach(plane => {
        const deltaTimeInSeconds = (updateInterval / 1000) * speedUp;
        plane.updatePosition(deltaTimeInSeconds);
      });
    }, updateInterval);

    // Cleanup on component unmount or when dependencies change
    return () => clearInterval(interval);
  }, [planes, updateInterval]); // Dependencies for the effect


  const updateHeading = (newHeading: string) => {
    setHeading(newHeading);
    if (selectedPlane) {
      const newHeadingNotNull = parseFloat(newHeading) === null ? 0: parseFloat(newHeading)
      selectedPlane.theading = newHeadingNotNull;
      selectedPlane.status = 1
    }
  };

  const updateAltitude = (newAltitude: string) => {
    setAltitude(newAltitude);
    if (selectedPlane) {
      const newAltitudeNotNull = parseInt(newAltitude, 10) === null ? 0: parseInt(newAltitude, 10)
      selectedPlane.taltitude = newAltitudeNotNull;
      if (selectedPlane.taltitude > selectedPlane.altitude) {
        setStatus("Climbing")
      } else if (selectedPlane.taltitude < selectedPlane.altitude) {
        setStatus("Descending")
      }
    }
  };

  function handleDragEnd(event) {
      const {active, over} = event;

      if (active.id !== over.id && arrivals !== null) {
          setArrivals((arrivals) => {
              const oldIndex = arrivals!.findIndex(arrival => arrival.id === active.id);
              const newIndex = arrivals!.findIndex(arrival => arrival.id === over.id);

              return arrayMove(arrivals!, oldIndex, newIndex);
          });
      }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10
      }
    })
  );

  function handleApproachClick() {
    if(selectedPlane !== null) {
      //const airplanepos:Point3DType = {x: selectedPlane.x, y:selectedPlane.y, z: feetToMeters(selectedPlane.altitude)}
      //const airplaneposground:Point3DType = {x: selectedPlane.x, y:selectedPlane.y, z: 0}
      selectedPlane.startApproach(airports[0])
    }
  }

  function handleHoldClick() {
    if(selectedPlane !== null) {
      setStatus("Holding")
      selectedPlane.startHold()
    }
  }

  return (
    <div style={{  maxHeight: window.innerHeight, overflow: "hidden" }} className="main container-fluid p-0">
      <div className="row">
        <div className="col-md-12">
          <RadarSketch viewwidth={pixels.pixelwidth} viewheight={pixels.pixelheight} selectedPlane={selectedPlane} geo={geo} pixels={pixels} onClick={handleClick} planes={planes} airports={airports} />
        </div>
      </div>
      <div style={{  maxHeight: 452, overflow: "hidden" }} className="row p-4">
        <div style={{  maxHeight: 452, overflow: "auto" }} className="col-md-4 border-right">
          <form className="">
            <h3>
              {selectedPlane === null ? "No plane selected": selectedPlane.callsign}
              &nbsp;
              <span className={
                selectedPlane?.squawk=="7500" || 
                selectedPlane?.squawk=="7600" || 
                selectedPlane?.squawk=="7700" ? 
                "badge bg-danger": 
                "badge bg-secondary"}>{selectedPlane?.squawk}</span>
            </h3>
            <div className="mb-1">
            <fieldset disabled>
              <label htmlFor="selectedPlane" className="form-label">Selected Plane</label>
              <input type="text" className="form-control" id="selectedPlane" value={selectedCallsign} readOnly />
            </fieldset>
            </div>
            <div className="mb-3">
              <label htmlFor="heading" className="form-label">Heading (degrees)</label>
              <input type="number" className="form-control" id="heading" value={selectedHeading} onChange={(e) => updateHeading(e.target.value)} placeholder="Enter heading" />
            </div>
            <div className="mb-3">
              <label htmlFor="altitude" className="form-label">Altitude (feet)</label>
              <input type="number" className="form-control" id="altitude" value={Math.round(parseInt(selectedAltitude))} onChange={(e) => updateAltitude(e.target.value)} placeholder="Enter altitude" />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label">Status</label>
              <p>{selectedStatus}</p>
              <button type="button" onClick={handleApproachClick} className="btn btn-warning">Initiate approach</button>
              <button type="button" className="btn btn-danger m-2">Cleared to land</button>
              <button type="button" onClick={handleHoldClick} className="btn btn-outline-info">Hold</button>
            </div>
          </form>
        </div>
        <div style={{  maxHeight: 452, overflow: "auto" }}  className="col-md-3 pb-4 border-right">
        <h4 className="">Arrivals</h4>
        <div>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={arrivals}>
              {arrivals?.map((arrival) => (
                <SortableItem key={arrival.callsign} id={arrival.id} arrival={arrival} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      </div>
        
    </div>
  )
}

export default App
