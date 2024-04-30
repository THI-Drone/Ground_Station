import { useEffect, useRef, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND;

export default function SimpleLog() {
  const refLogContainerWrapper = useRef<HTMLDivElement>(null);
  const refLogContainer = useRef<HTMLDivElement>(null);
  const initialAnchorScroll = useRef(false);

  // Tracking received log messages
  const [receivedLogs, setReceivedLogs] = useState(new Array<{ timestamp: string; content: string }>());
  // URL to backend, depending on using SSL
  const wsUrl = (location.protocol == "https:" ? "wss://" : "ws://") + BACKEND;

  // Connect to the websocket for receiving log-messages
  useEffect(() => {
    let socket = new WebSocket(wsUrl, "drone-logging");
    socket.onmessage = async (msgEvt) => {
      const data = JSON.parse(await msgEvt.data.text());
      const currentDate = new Date();
      receivedLogs.push({
        timestamp: currentDate.toLocaleTimeString(),
        content: data.content,
      });
      setReceivedLogs([...receivedLogs]);
    };
    return () => {
      socket.close();
    };
  }, []);

  // Build log JSX-elements from all yet received logs
  const logs = receivedLogs.map((elem, index) => {
    return (
      <p key={"log_" + index} style={{ overflowAnchor: "none" }}>
        {"[" + elem.timestamp + "] "}
        {typeof elem.content === "string" ? elem.content : JSON.stringify(elem.content)}
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
    <div className="w-full h-full flex justify-start items-end">
      <div className="w-full max-h-[100%] overflow-y-auto" ref={refLogContainerWrapper}>
        <div className="" ref={refLogContainer}>
          {logs}
          <p className="h-[1px]" style={{ overflowAnchor: "auto" }}></p>
        </div>
      </div>
    </div>
  );
}
