import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import Card from 'react-bootstrap/Card';
import { Plane } from "../models";

interface SortableItemProps {
    children?: ReactNode;
    id: string; // Assuming id is a string as per @dnd-kit documentation; adjust if necessary
    arrival: Plane;
}

export function SortableItem({ id, arrival, children }: SortableItemProps) {
    const { listeners, setNodeRef, transform, transition } = useSortable({
      id: id, 
    });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    } as React.CSSProperties;
  
    return (
      <div ref={setNodeRef} style={style} {...listeners}>
        <Card body className="m-3">{arrival.callsign}</Card>
      </div>
    );
  }
  
  