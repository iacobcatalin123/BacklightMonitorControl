import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Knob } from 'primereact/knob';
import { useEffect, useState } from 'react';
import MonitorController from "../components/MonitorController";

function Hello() {
  const [globalBrightness, setGlobalBrightness] = useState(0);
  const [monitors, setMonitors] = useState([] as any);

  useEffect(() => {
    window.electron.ipcRenderer.on('monitors', (data) => {
      setMonitors(data);
    });

    window.electron.ipcRenderer.sendMessage('getAllMonitors');
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      justifyItems: "center",
      width: "100vw",
      height: "100vh",
      position:"fixed",
      left:"0",
      top: "0"


    }}>
      {monitors.map((monitor: any) => (
        <div>
          <MonitorController Monitor={monitor}/>
        </div>
      ))}

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
