import { useEffect, useState } from "react";

/**
 * Component to display all received heartbeats, marking the active node and if they are considered alive (received heartbeat within the last 3s).
 * @param {Record<string, { sender_id: string; tick: number; active: boolean; timestamp: number, timestamp_received: number }>} receivedHeartbeats - Record containing the last heartbeats received in the network.
 */
export default function HeartbeatIndicator({
  receivedHeartbeats,
}: {
  receivedHeartbeats: Record<string, { sender_id: string; tick: number; active: boolean; timestamp: number; timestamp_received: number }>;
}) {
  // Tracking now to rerender every second
  const [now, setNow] = useState(Date.now() / 1000);
  // Defining the maximum time in seconds to pass between two subsequent heartbeats before the node is consideres unalive
  const maxTimeBetweenHeartbeats = 1.5;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const nodeHeartbeats = Object.values(receivedHeartbeats).map((heartbeat, index) => {
    const nodeOnline = now - heartbeat.timestamp_received < maxTimeBetweenHeartbeats;
    return (
      <div
        key={"nodeHeartbeats_wrapper_" + index}
        className={"p-2 flex justify-center items-center text-sm" + (nodeOnline ? " font-bold" : " text-gray-400")}
      >
        <p key={"nodeHeartbeats_name_" + index} className="mr-2">
          {heartbeat.sender_id}
        </p>

        {heartbeat.active && nodeOnline ? (
          <svg key={"nodeHeartbeats_circle_svg_" + index} width="10" height="10" xmlns="http://www.w3.org/2000/svg">
            <circle key={"nodeHeartbeats_circle_" + index} cx="5" cy="5" r="4" fill="green" />
          </svg>
        ) : (
          <div key={"nodeHeartbeats_circle_spacer_" + index} className="w-[10px]" />
        )}
      </div>
    );
  });

  return <div className="flex flex-col items-start justify-center border shadow bg-white">{nodeHeartbeats}</div>;
}
