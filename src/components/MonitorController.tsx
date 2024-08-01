import { Knob } from 'primereact/knob';
import { useState, useEffect } from 'react';
import IDisplayInformation from '../main/util';
import styles from './MonitorController.module.css';

interface IProps {
  Monitor: IDisplayInformation;
}

export default function MonitorController(props: IProps) {

  const [gotInitialBrightness, setGotInitialBrightness] = useState(false);

  const [globalBrightness, setGlobalBrightness] = useState(0);
  const [brightnessValue, setBrightnessValue] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const {
    bus,
    manufacturer,
    model,
    productCode,
    serialNumber,
    manufactureYear,
    manufactureWeek,
    display,
  } = props.Monitor;

  const setBrightness = (value: number) => {
    window.electron.ipcRenderer.sendMessage('setBrightness', {
      bus,
      display,
      value,
    });
  };

  useEffect(() => {
    if (gotInitialBrightness === false) {
      window.electron.ipcRenderer.on('brightness', (arg, bus) => {
        if (!arg) return;
        if (props.Monitor.bus !== bus) return;;
        console.log(arg);
        setBrightness(arg as number)
        setGlobalBrightness(arg as number);
        setGotInitialBrightness(true);
      });
      window.electron.ipcRenderer.sendMessage('getBrightness', {
        bus,
        display,
      });

      return ;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setDebounceTimer(
      setTimeout(() => {
        setBrightness(brightnessValue);
      }, 500),
    ); // 2 seconds debounce

    // Cleanup timer on component unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [brightnessValue]);

  return (
    <div className={styles.infoGroup}>
      <Knob
        value={globalBrightness}
        onChange={(e) => {
          setGlobalBrightness(e.value);
          setBrightnessValue(e.value);
        }}
        size={150}
      />
      <div key={bus}>
        <p>Manufacturer: {manufacturer}</p>
        <p>Model: {model}</p>
        <p>Product Code: {productCode}</p>
        <p>Serial Number: {serialNumber}</p>
        <p>Manufacture Year: {manufactureYear}</p>
        <p>Manufacture Week: {manufactureWeek}</p>
        <p>Bus: {bus}</p>
      </div>
    </div>
  );
}
