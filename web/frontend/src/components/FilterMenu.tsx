import { useState } from "react";
import MenuIcon from "../assets/menu.svg";
import CloseIcon from "../assets/close.svg";

export default function FilterMenu({
  receivedLogNames,
  logNameFilter,
  logSeverityFilter,
  setLogNameFilter,
  setSeverityFilter,
}: {
  receivedLogNames: Array<string>;
  logNameFilter: Array<string>;
  logSeverityFilter: Array<string>;
  setLogNameFilter: Function;
  setSeverityFilter: Function;
}) {
  const [expanded, setExpanded] = useState(false);
  const logLevels = ["INFO", "WARN", "ERROR", "FATAL"];

  if (expanded) {
    return (
      <div className="w-screen h-screen bg-gray-500 bg-opacity-40 flex justify-center items-center">
        <div className="bg-white w-5/6 h-5/6 flex flex-col justify-center items-center relative">
          <div
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => {
              setExpanded((previousExpanded) => !previousExpanded);
            }}
          >
            <img src={CloseIcon} />
          </div>
          {receivedLogNames.map((elem, index) => {
            return (
              <div key={"FilterMenu_nodes_wrapper_" + index}>
                <input
                  key={"FilterMenu_nodes_input_" + index}
                  type="checkbox"
                  name={"nodes_input_" + index}
                  defaultChecked={!logNameFilter.includes(elem)}
                  onClick={() => {
                    setLogNameFilter((previousLogNameFilter: Array<string>) => {
                      if (previousLogNameFilter.includes(elem)) {
                        return previousLogNameFilter.filter((item) => item !== elem);
                      } else {
                        return [...previousLogNameFilter, elem];
                      }
                    });
                  }}
                />
                <label key={"FilterMenu_nodes_label_" + index} htmlFor={"nodes_input_" + index}>
                  {" " + elem}
                </label>
              </div>
            );
          })}
          {logLevels.map((elem, index) => {
            return (
              <div key={"FilterMenu_severity_wrapper_" + index}>
                <input
                  key={"FilterMenu_severity_input_" + index}
                  type="checkbox"
                  name={"severity_input_" + index}
                  defaultChecked={!logSeverityFilter.includes(elem)}
                  onClick={() => {
                    setSeverityFilter((previousLogSeverityFilter: Array<string>) => {
                      if (previousLogSeverityFilter.includes(elem)) {
                        return previousLogSeverityFilter.filter((item) => item !== elem);
                      } else {
                        return [...previousLogSeverityFilter, elem];
                      }
                    });
                  }}
                />
                <label key={"FilterMenu_severity_label_" + index} htmlFor={"severity_input_" + index}>
                  {" " + elem}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="w-12 h-12 mb-4 mr-6 rounded-full bg-sky-700 flex items-center justify-center cursor-pointer shadow"
        onClick={() => {
          setExpanded((previousExpanded) => !previousExpanded);
        }}
      >
        <img src={MenuIcon} />
      </div>
    );
  }
}
