import { useEffect, useRef, useState } from "react";
import HeartbeatIndicator from "./HeartbeatIndicator";
import FilterMenu from "./FilterMenu";

const BACKEND = import.meta.env.VITE_BACKEND;

export default function SimpleLog() {
  const refLogContainerWrapper = useRef<HTMLDivElement>(null);
  const refLogContainer = useRef<HTMLDivElement>(null);
  const initialAnchorScroll = useRef(false);

  // Tracking filter on log names
  const [logNameFilter, setLogNameFilter] = useState<Array<string>>([]);
  // Tracking filter on log severity level
  const [logSeverityFilter, setLogSeverityFilter] = useState<Array<"INFO" | "WARN" | "ERROR" | "FATAL">>([]);
  // Tracking log names already received
  const receivedLogNames = useRef<Array<string>>([]);
  // Tracking received log messages
  const [receivedLogs, setReceivedLogs] = useState<
    Array<{ timestamp: string; content: { level: "INFO" | "WARN" | "ERROR" | "FATAL"; name: string; msg: string } }>
  >([]);
  // Tracking received heartbeats
  const [receivedHeartbeats, setReceivedHeartbeats] = useState<
    Record<string, { sender_id: string; tick: number; active: boolean; timestamp: number }>
  >({});
  // URL to backend, depending on using SSL
  const wsUrl = (location.protocol == "https:" ? "wss://" : "ws://") + BACKEND;

  // Connect to the websocket for receiving log-messages
  useEffect(() => {
    const socket = new WebSocket(wsUrl, "drone-logging");

    socket.onmessage = async (msgEvt) => {
      const data = await msgEvt.data.text();
      const messages = data.split("\x17");
      const currentDate = new Date();

      messages.pop();

      messages.forEach((elem: string) => {
        const elemJson = JSON.parse(elem.replace("\x17", ""));

        if (elemJson["type"] && elemJson["type"] == "heartbeat") {
          setReceivedHeartbeats((previousHeartbeats) => ({ ...previousHeartbeats, [elemJson.content["sender_id"]]: elemJson.content }));
        } else if (elemJson["type"] && elemJson["type"] == "log") {
          if (!receivedLogNames.current.includes(elemJson.content.name)) {
            receivedLogNames.current.push(elemJson.content.name);
          }
          setReceivedLogs((previousLogs) => [
            ...previousLogs,
            {
              timestamp: currentDate.toLocaleTimeString(),
              content: elemJson.content,
            },
          ]);
        }
      });
    };
    return () => {
      socket.close();
    };
  }, []);

  // Filter log messages according to filters
  const filteredLogs = receivedLogs.filter((elem) => {
    let filterMessage = false;
    logNameFilter.forEach((nameFilter) => {
      if (nameFilter == elem.content.name) filterMessage = true;
    });
    logSeverityFilter.forEach((severityFilter) => {
      if (severityFilter == elem.content.level) filterMessage = true;
    });
    return !filterMessage;
  });

  // Build log JSX-elements from all yet received logs
  const logs = filteredLogs.map((elem, index) => {
    let styleText;
    switch (elem.content.level) {
      case "WARN":
        styleText = "bg-yellow-50";
        break;
      case "ERROR":
        styleText = "bg-red-600";
        break;
      case "FATAL":
        styleText = "bg-red-600 font-bold";
        break;
      default:
        styleText = "";
        break;
    }

    return (
      <p key={"log_" + index} className={styleText} style={{ overflowAnchor: "none" }}>
        {"[" + elem.timestamp + "] "}
        {"(" + elem.content.name + ") "}
        {elem.content.level + ": " + elem.content.msg}
      </p>
    );
  });

  // Check if the container containing the logs exceeds the height of it's wrapper, causing an overflow.
  // If so, we want to do an initial scroll to log with the lower overflow-anchor and keep the view at the most recent log-message.
  if (
    !initialAnchorScroll.current &&
    refLogContainerWrapper.current &&
    refLogContainer.current &&
    refLogContainerWrapper.current.offsetHeight < refLogContainer.current.offsetHeight
  ) {
    refLogContainerWrapper.current.scrollTop += 100;
    initialAnchorScroll.current = true;
  }

  return (
    <div className="w-full h-full flex justify-start items-end relative">
      <div className="absolute top-2 right-6 z-10">
        <HeartbeatIndicator receivedHeartbeats={receivedHeartbeats} />
      </div>
      <div className="absolute bottom-0 right-0 z-20">
        <FilterMenu
          receivedLogNames={receivedLogNames.current}
          logNameFilter={logNameFilter}
          setLogNameFilter={setLogNameFilter}
          logSeverityFilter={logSeverityFilter}
          setSeverityFilter={setLogSeverityFilter}
        />
      </div>
      <div className="w-full max-h-[100%] overflow-y-auto" ref={refLogContainerWrapper}>
        <div className="" ref={refLogContainer}>
          {logs}
          <p className="h-[1px]" style={{ overflowAnchor: "auto" }}></p>
        </div>
      </div>
    </div>
  );
}
