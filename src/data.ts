import { format, addMinutes, subDays, startOfDay, parse } from 'date-fns';
import { csvData } from './rawData';

export interface TrainData {
  Train_ID: string;
  Train_Name: string;
  Station_Name: string;
  Lat: number;
  Lng: number;
  Scheduled_Arrival: string;
  Actual_Arrival: string;
  Scheduled_Departure: string;
  Actual_Departure: string;
  Delay_Minutes: number;
  Date: string;
  Railway_Zone: string;
  Weather_Condition: string;
  Cause: string;
}

const WEATHER = ['Clear', 'Rainy', 'Foggy', 'Monsoon'];
const CAUSES = ['Signal Failure', 'Track Maintenance', 'Cattle Crossing', 'Weather', 'Technical Fault', 'On-Time'];

export const generateData = (days: number = 7): TrainData[] => {
  const lines = csvData.trim().split('\n');
  const data: TrainData[] = [];
  const today = startOfDay(new Date());

  // Group lines by Train_ID to handle schedules
  const trainGroups: Record<string, string[]> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 2) continue;
    const trainId = cols[0];
    if (!trainGroups[trainId]) trainGroups[trainId] = [];
    trainGroups[trainId].push(lines[i]);
  }

  for (let d = 0; d < days; d++) {
    const currentDate = subDays(today, d);

    Object.keys(trainGroups).forEach((trainId, groupIndex) => {
        const rows = trainGroups[trainId];
        // Stagger start times: 04:00 + (groupIndex * 30 mins) % 18 hours
        // This distributes trains throughout the day
        const startOffsetMinutes = 240 + (groupIndex * 45) % (18 * 60); 
        let currentTrainTime = addMinutes(currentDate, startOffsetMinutes);

        // Generate a synthetic path direction
        const seed = parseInt(trainId);
        const latDir = seed % 2 === 0 ? 1 : -1;
        const lngDir = seed % 3 === 0 ? 1 : -1;
        let lat = 20 + (seed % 10) - 5; // Start lat
        let lng = 78 + (seed % 15) - 7; // Start lng

        rows.forEach((line, index) => {
            const cols = line.split(',');
            if (cols.length < 11) return;
            
            const train_number = cols[0];
            const train_name = cols[1];
            const station_code = cols[2];
            const station_name = cols[3];
            const base_delay = parseFloat(cols[4]) || 0;
            const delay = Math.max(0, Math.round(base_delay + (Math.random() * 10 - 5)));
            
            const weather = WEATHER[Math.floor(Math.random() * WEATHER.length)];
            const cause = delay === 0 ? 'On-Time' : CAUSES[Math.floor(Math.random() * (CAUSES.length - 1))];

            // Move along path
            if (index > 0) {
                lat += 0.5 * latDir + (Math.random() * 0.2 - 0.1);
                lng += 0.5 * lngDir + (Math.random() * 0.2 - 0.1);
            }
            
            // Clamp to India bounds
            lat = Math.max(8, Math.min(35, lat));
            lng = Math.max(68, Math.min(97, lng));

            const scheduledArrival = currentTrainTime;
            const actualArrival = addMinutes(scheduledArrival, delay);
            
            data.push({
                Train_ID: train_number,
                Train_Name: train_name,
                Station_Name: station_name,
                Lat: lat,
                Lng: lng,
                Scheduled_Arrival: format(scheduledArrival, 'yyyy-MM-dd HH:mm'),
                Actual_Arrival: format(actualArrival, 'yyyy-MM-dd HH:mm'),
                Scheduled_Departure: format(addMinutes(scheduledArrival, 5), 'yyyy-MM-dd HH:mm'),
                Actual_Departure: format(addMinutes(actualArrival, 5), 'yyyy-MM-dd HH:mm'),
                Delay_Minutes: delay,
                Date: format(currentDate, 'yyyy-MM-dd'),
                Railway_Zone: station_code,
                Weather_Condition: weather,
                Cause: cause
            });

            // Travel time to next station (30-60 mins)
            currentTrainTime = addMinutes(currentTrainTime, 45 + Math.floor(Math.random() * 15));
        });
    });
  }
  
  return data;
};
