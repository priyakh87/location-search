import React, { useState } from "react";
import { CarIcon, ManeuverIcon } from "./SVGIcons"; // Assuming you have SVG icons 

interface Step {
  instruction: string;
  road_name?: string;
  distance: number;
  maneuver?: string; // e.g., "turn-left", "turn-right"
}

interface Props {
  steps: Step[];
  summary: { duration: number; distance: number };
  originName?: string;
  destinationName?: string;
}

const DirectionsPanel: React.FC<Props> = ({ steps, summary, originName, destinationName }) => {
  const [expanded, setExpanded] = useState(true);
console.log(originName, destinationName, steps, summary,"directions panel");

  if (!steps?.length) return null;

  // Calculate ETA
  const now = new Date();
  const arrival = new Date(now.getTime() + summary.duration * 1000);
  const arrivalStr = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`p-4 bg-white rounded shadow mt-4 max-h-[40rem] overflow-auto transition-all duration-300 ${
        expanded ? "opacity-70" : "border-l-4 border-l-blue-500"
      }`}>
      {/* Header with car icon, start/end, and collapse button */}
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center'>
          <CarIcon />
          <span className='font-bold text-blue-700'>{originName}</span>
          <span className='mx-2 text-gray-400'>→</span>
          <span className='font-bold text-green-700'>{destinationName}</span>
        </div>
      </div>
      <div className='mb-3 text-sm text-gray-700'>
        <button
          className='text-l text-blue-600 hover:bg-blue-100 rounded px-4 py-4 focus:outline-none'
          onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Summary" : "Details"}
        </button>
        <span className='mr-4'>
          Distance: <b>{(summary.distance / 1000).toFixed(2)} km</b>
        </span>
      </div>
      <div className='mb-3 text-sm text-gray-700'>
        <span className='mr-4'>
          Duration: <b>{(summary.duration / 3600).toFixed(1)} hours</b>
        </span>
        <span>
          ETA: <b>{arrivalStr}</b>
        </span>
      </div>
      {expanded && (
        <div className='relative pl-6'>
          <div className='absolute left-2 top-6 bottom-2 w-0.5 bg-gray-200 z-0'></div>
          <ol className='space-y-4'>
            {steps.map((step, idx) => (
              <li key={idx} className='relative flex items-start z-10'>
                <span className='absolute -left-7 top-1'>
                  <ManeuverIcon type={step.maneuver} />
                </span>
                <div>
                  <div className='font-medium'>{step.instruction}</div>
                  {step.road_name && (
                    <div className='text-xs text-gray-500'>
                      via {step.road_name}
                    </div>
                  )}
                  <div className='text-xs text-gray-400'>
                    {(step.distance / 1000).toFixed(2)} km
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default DirectionsPanel;
