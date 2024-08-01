/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

const { exec } = require('child_process');
const util = require('util');

// Promisify exec
const execPromise = util.promisify(exec);

export default interface IDisplayInformation {
  manufacturer: string;
  model: string;
  productCode: string;
  serialNumber: string;
  manufactureYear: string;
  manufactureWeek: string;
  bus: string;
  display: string;
}

export async function GetAllMonitors() {


  const getMfgId = `ddcutil detect | grep "Mfg id:" | awk -F 'Mfg id: ' '{print $2}'`;
  const getBus = `ddcutil detect | grep "I2C bus: " | awk -F 'I2C bus: ' '{print $2}'`;
  const getDisplay = `ddcutil detect | grep "Display " | awk -F 'Display ' '{print $2}' `;

  let result = {};
  // {
  //     "Bus": "/dev/i2c-X",
  //     "Mfg id": "Dell - Dell Inc",
  //     "Display": "1"
  // }

  const { stdout, stderr } = await execPromise('ddcutil detect');

  // Split the output into lines
  const lines = stdout.split('\n');
  const displays = [];
  let currentDisplay: IDisplayInformation = {} as IDisplayInformation;

  lines.forEach((line: any) => {
    if (line.includes('Display')) {
      if (Object.keys(currentDisplay).length > 0) {
        displays.push(currentDisplay);
      }
      currentDisplay = {} as IDisplayInformation;
    } else if (line.includes('Mfg id:')) {
      currentDisplay.manufacturer = line.split(':').pop().trim();
    } else if (line.includes('Model:')) {
      currentDisplay.model = line.split(':').pop().trim();
    } else if (line.includes('Product code:')) {
      currentDisplay.productCode = line.split(':').pop().trim();
    } else if (line.includes('Serial number:') && !line.includes('Binary')) {
      currentDisplay.serialNumber = line.split(':').pop().trim();
    } else if (line.includes('Manufacture year:')) {
      const parts = line.split(',');
      currentDisplay.manufactureYear = parts[0].split(':').pop().trim();
      currentDisplay.manufactureWeek = parts[1].split(':').pop().trim();
    } else if (line.includes('I2C bus:')) {
      currentDisplay.bus = line.split(':').pop().trim();
    }
  });

  if (Object.keys(currentDisplay).length > 0) {
    displays.push(currentDisplay);
  }

  // console.log(displays[0]["bus"])
  // console.log(JSON.stringify(displays, null, 2));
  result = displays;

  return result;
}

export async function SetMonitorBrightness(bus: string, value: number) {
  const { stdout, stderr } = await execPromise(`ddcutil setvcp 10 ${value} -b ${bus[bus.length - 1]}`);
  return stdout;
}

export async function GetMonitorBrightness(bus: string) {
  const busNumber = bus[bus.length - 1];
  const command = `ddcutil getvcp 10 -b ${busNumber} | awk -F 'current value = ' '{print $2}' | awk -F ',' '{print $1}' | awk -F ' ' '{print $1}'`;
  const { stdout, stderr } = await execPromise(command);
  let stdoutTrimmed = stdout.trim();
  return stdoutTrimmed;
}
