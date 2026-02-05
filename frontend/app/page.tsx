"use client";

import { useState } from "react";
import CpuChart from "../components/CpuChart";

interface CpuDataPoint {
  Timestamp: string;
  Average: number;
}

export default function Home() {
  const [ip, setIp] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [period, setPeriod] = useState("60");
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [error, setError] = useState("");

  const fetchData = async (e:React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:3001/api/cpu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, startTime, endTime, period }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      return setError("Unexpected server response");
    }

    if (!res.ok) return setError(data?.error || "Request failed");
    if (data.error) return setError(data.error);

    setLabels(
      data.cpuData.map((p: CpuDataPoint) =>
        new Date(p.Timestamp).toLocaleString(),
      ),
    );
    setValues(data.cpuData.map((p: CpuDataPoint) => p.Average));
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>CPU Tracker</h1>
        <p>Query CPU utilization for an AWS instance.</p>
      </header>

      <section className="card">
        <form className="form-grid" onSubmit={fetchData}>
          <div className="field">
            <label htmlFor="ip">Instance IP</label>
            <input
              id="ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter an IP address"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="start">Start time</label>
            <input
              id="start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="end">End time</label>
            <input
              id="end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="period">Interval (seconds)</label>
            <input
              id="period"
              type="number"
              min={1}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
            />
          </div>

          <div className="actions">
            <button className="primary-btn" type="submit">
              Get CPU Data
            </button>
          </div>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>

      {labels.length > 0 && (
        <section className="card">
          <div className="chart-header">
            <h2 className="chart-title">CPU Utilization</h2>
          </div>
          <CpuChart labels={labels} values={values} />
        </section>
      )}
    </main>
  );
}
