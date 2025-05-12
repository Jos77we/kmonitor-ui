import React, { useEffect, useState } from 'react';

export function Terminal() {
  const [logs, setLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), message: 'Initializing system monitoring...', isError: false }
  ]);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch('https://konvobotchat.onrender.com/health');
        const data = await response.json();

        // Convert the health data into readable log messages
        const newLogs = [
          { timestamp: new Date().toLocaleTimeString(), message: `Status: ${data.status.toUpperCase()}`, isError: data.status !== 'ok' },
          { timestamp: new Date().toLocaleTimeString(), message: `Uptime: ${data.uptime.toFixed(2)} seconds`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `CPU Load: ${data.cpuLoad.join(', ')}`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `Memory Usage: Heap ${data.memoryUsage.heapUsed} / ${data.memoryUsage.heapTotal}`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `Free Memory: ${data.freeMemory}`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `Network: ${data.networkConfig.ipAddress} (${data.networkConfig.network})`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `OS: ${data.osType} (${data.osPlatform})`, isError: false },
          { timestamp: new Date().toLocaleTimeString(), message: `Node.js Version: ${data.nodeVersion}`, isError: false }
        ];

        // Handle lastError if it exists and is an object
        if (data.lastError && typeof data.lastError === 'object') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            message: `Last Error from ${data.lastError.source}: ${data.lastError.message}`,
            isError: true
          });
        } else {
          newLogs.push({ timestamp: new Date().toLocaleTimeString(), message: `Last Error: None`, isError: false });
        }

        // Handle system status
        newLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `System Status: ${typeof data.systError === 'object' ? 'ERROR' : data.systError}`,
          isError: typeof data.systError === 'object'
        });

        // Handle systError if it exists and is an object
        if (data.systError && typeof data.systError === 'object') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            message: `System Error from ${data.systError.source}: ${data.systError.message}`,
            isError: true
          });
        }

        // Limit log history to last 20 messages
        setLogs((prevLogs) => [...prevLogs.slice(-15), ...newLogs]);
      } catch (error) {
        setLogs((prevLogs) => [
          ...prevLogs.slice(-15),
          { timestamp: new Date().toLocaleTimeString(), message: `Error fetching health data: ${error.message}`, isError: true }
        ]);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto">
      {logs.map((log, index) => (
        <div key={index} className={log.isError ? "text-red-500 mb-2" : "text-green-500 mb-2"}>
          <span className="text-blue-400">[{log.timestamp}]</span> {log.message}
        </div>
      ))}
    </div>
  );
}
