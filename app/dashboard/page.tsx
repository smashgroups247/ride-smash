'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const GREEN = '#1D9E75';
const GREEN_LIGHT = '#5DCAA5';
const PURPLE = '#534AB7';
const PURPLE_LIGHT = '#AFA9EC';
const GRAY = '#9BB5AC';

function countAnswers(responses: any[], key: string) {
  const counts: Record<string, number> = {};
  responses.forEach(r => {
    const val = r.answers[key];
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    } else {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return counts;
}

function scaleDistrib(responses: any[], key: string) {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  responses.forEach(r => { const v = r.answers[key]; if (v) dist[v] = (dist[v] || 0) + 1; });
  return dist;
}

function avg(responses: any[], key: string) {
  const vals = responses.map(r => r.answers[key]).filter(Boolean);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function shortLabel(str: string, max = 28) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default function Dashboard() {
  const [view, setView] = useState('overview');
  const [data, setData] = useState<{ driver: any[], passenger: any[], all: any[] }>({ driver: [], passenger: [], all: [] });

  useEffect(() => {
    const driver = JSON.parse(localStorage.getItem('ridesmash_driver') || '[]');
    const passenger = JSON.parse(localStorage.getItem('ridesmash_passenger') || '[]');
    setData({ driver, passenger, all: [...driver, ...passenger] });
  }, []);

  const clearData = () => {
    localStorage.removeItem('ridesmash_driver');
    localStorage.removeItem('ridesmash_passenger');
    setData({ driver: [], passenger: [], all: [] });
  };

  const exportCSV = (type?: string) => {
    let rows: any[] = [], headers: string[] = [];
    if (!type || type === 'driver') {
      headers = ['Type', 'Timestamp', 'Q1_Experience', 'Q2_Frustration', 'Q3_Breakdown', 'Q4_PensionScale', 'Q5_Features', 'Q6_SupportPref', 'Q7_OpenFeedback'];
      data.driver.forEach((r: any) => {
        rows.push([
          'driver', r.timestamp,
          r.answers.q1 || '', r.answers.q2 || '', r.answers.q3 || '',
          r.answers.q4 || '', (r.answers.q5 || []).join('; '),
          r.answers.q6 || '', (r.answers.q7 || '').replace(/\n/g, ' ')
        ]);
      });
    }
    if (!type || type === 'passenger') {
      if (!type) {
        rows.push([]); // spacer
      }
      headers = ['Type', 'Timestamp', 'Q1_Usage', 'Q2_Priority', 'Q3_BadExp', 'Q4_Features', 'Q5_Welfare', 'Q6_SupportSat', 'Q7_OpenFeedback'];
      data.passenger.forEach((r: any) => {
        rows.push([
          'passenger', r.timestamp,
          r.answers.q1 || '', r.answers.q2 || '', r.answers.q3 || '',
          (r.answers.q4 || []).join('; '), r.answers.q5 || '',
          r.answers.q6 || '', (r.answers.q7 || '').replace(/\n/g, ' ')
        ]);
      });
    }
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.map(e => e.join(',')).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ridesmash_survey_${type || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const driverFrustrations = countAnswers(data.driver, 'q2');
  const driverFrustrationsKeys = Object.keys(driverFrustrations).sort((a, b) => driverFrustrations[b] - driverFrustrations[a]);

  const passengerPriority = countAnswers(data.passenger, 'q2');
  const passengerPriorityKeys = Object.keys(passengerPriority).sort((a, b) => passengerPriority[b] - passengerPriority[a]);

  const breakdownData = countAnswers(data.driver, 'q3');
  const pensionScaleData = scaleDistrib(data.driver, 'q4');
  const pensionAvg = avg(data.driver, 'q4');

  const driverFeatures = countAnswers(data.driver, 'q5');
  const driverFeaturesKeys = Object.keys(driverFeatures).sort((a, b) => driverFeatures[b] - driverFeatures[a]);

  const passengerFeatures = countAnswers(data.passenger, 'q4');
  const passengerFeaturesKeys = Object.keys(passengerFeatures).sort((a, b) => passengerFeatures[b] - passengerFeatures[a]);

  const welfareData = countAnswers(data.passenger, 'q5');
  const supportSatData = scaleDistrib(data.passenger, 'q6');
  const supportAvg = avg(data.passenger, 'q6');

  const freeD = data.driver.filter((r: any) => r.answers.q7 && r.answers.q7.trim());
  const freeP = data.passenger.filter((r: any) => r.answers.q7 && r.answers.q7.trim());

  const latest = [...data.all].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const lastUpdatedStr = latest ? 'Last response: ' + new Date((latest as any).timestamp).toLocaleString() : 'No responses yet — share your survey links!';

  const getHBarOptions = (labels: string[]) => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { title: (items: any) => labels[items[0].dataIndex] } }
    },
    scales: {
      x: { grid: { color: '#F0F0F0' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9BB5AC' }, beginAtZero: true },
      y: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#5A7068' } }
    }
  });

  const getVBarOptions = (labels: string[]) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { title: (items: any) => labels[items[0].dataIndex] } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9BB5AC' } },
      y: { grid: { color: '#F0F0F0' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9BB5AC' }, beginAtZero: true }
    }
  });

  return (
    <div className="dashboard-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Ride<span>smash</span></div>
        <div className="nav-label">Views</div>
        <button className={`nav-item ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}><div className="nav-dot dot-all"></div> Overview</button>
        <button className={`nav-item ${view === 'driver' ? 'active' : ''}`} onClick={() => setView('driver')}><div className="nav-dot dot-driver"></div> Driver responses</button>
        <button className={`nav-item ${view === 'passenger' ? 'active' : ''}`} onClick={() => setView('passenger')}><div className="nav-dot dot-passenger"></div> Passenger responses</button>
        <button className={`nav-item ${view === 'freetext' ? 'active' : ''}`} onClick={() => setView('freetext')}><div className="nav-dot dot-all"></div> Open feedback</button>
        <div className="sidebar-footer">
          Ridesmash v2 Research<br />Survey Dashboard
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {view === 'overview' && (
          <div className="view active">
            <div className="topbar">
              <div>
                <div className="page-title">Survey overview</div>
                <div className="page-sub">{lastUpdatedStr}</div>
              </div>
              <div className="actions">
                <button className="btn" onClick={clearData}>Clear all data</button>
                <button className="btn btn-primary" onClick={() => exportCSV()}>Export CSV</button>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total responses</div>
                <div className="stat-num">{data.all.length}</div>
                <div className="stat-sub">All surveys combined</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Driver responses</div>
                <div className="stat-num green">{data.driver.length}</div>
                <div className="stat-sub">Driver survey</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Passenger responses</div>
                <div className="stat-num purple">{data.passenger.length}</div>
                <div className="stat-sub">Passenger survey</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Open feedback</div>
                <div className="stat-num">{freeD.length + freeP.length}</div>
                <div className="stat-sub">Written responses</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Biggest driver frustrations</div><div className="chart-meta">Q2 — Driver survey</div></div>
                  <span className="chart-tag tag-driver">Drivers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: driverFrustrationsKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: driverFrustrationsKeys.map(k => driverFrustrations[k]), backgroundColor: GREEN, borderRadius: 6 }]
                  }} options={getHBarOptions(driverFrustrationsKeys)} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Booking priority — passengers</div><div className="chart-meta">Q2 — Passenger survey</div></div>
                  <span className="chart-tag tag-passenger">Passengers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: passengerPriorityKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: passengerPriorityKeys.map(k => passengerPriority[k]), backgroundColor: PURPLE, borderRadius: 6 }]
                  }} options={getHBarOptions(passengerPriorityKeys)} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Breakdown resilience</div><div className="chart-meta">Q3 — Driver survey</div></div>
                  <span className="chart-tag tag-driver">Drivers</span>
                </div>
                <div className="chart-wrap">
                  <Doughnut data={{
                    labels: Object.keys(breakdownData),
                    datasets: [{ data: Object.values(breakdownData), backgroundColor: [GREEN, '#5DCAA5', '#85B7EB', '#AFA9EC'], borderWidth: 2, borderColor: '#fff' }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans', size: 11 }, color: '#5A7068', boxWidth: 12, padding: 10 } } }
                  }} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Pension importance</div><div className="chart-meta">Q4 — Driver avg: {pensionAvg || '—'}</div></div>
                  <span className="chart-tag tag-driver">Drivers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{ data: [1, 2, 3, 4, 5].map(i => pensionScaleData[i] || 0), backgroundColor: [GREEN_LIGHT, GREEN_LIGHT, GREEN, GREEN, GREEN], borderRadius: 6 }]
                  }} options={getVBarOptions(['1', '2', '3', '4', '5'])} />
                </div>
              </div>

              <div className="chart-card wide">
                <div className="chart-header">
                  <div><div className="chart-title">Top features drivers want</div><div className="chart-meta">Q5 — Driver survey</div></div>
                  <span className="chart-tag tag-driver">Drivers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: driverFeaturesKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: driverFeaturesKeys.map(k => driverFeatures[k]), backgroundColor: GREEN, borderRadius: 6 }]
                  }} options={getHBarOptions(driverFeaturesKeys)} />
                </div>
              </div>

              <div className="chart-card wide">
                <div className="chart-header">
                  <div><div className="chart-title">Top features passengers want</div><div className="chart-meta">Q4 — Passenger survey</div></div>
                  <span className="chart-tag tag-passenger">Passengers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: passengerFeaturesKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: passengerFeaturesKeys.map(k => passengerFeatures[k]), backgroundColor: PURPLE, borderRadius: 6 }]
                  }} options={getHBarOptions(passengerFeaturesKeys)} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Driver welfare sentiment</div><div className="chart-meta">Q5 — Passenger survey</div></div>
                  <span className="chart-tag tag-both">Both</span>
                </div>
                <div className="chart-wrap">
                  <Doughnut data={{
                    labels: Object.keys(welfareData),
                    datasets: [{ data: Object.values(welfareData), backgroundColor: [PURPLE, PURPLE_LIGHT, '#D4D2F0', GRAY], borderWidth: 2, borderColor: '#fff' }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans', size: 11 }, color: '#5A7068', boxWidth: 12, padding: 10 } } }
                  }} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div><div className="chart-title">Support satisfaction</div><div className="chart-meta">Q6 — Passenger avg: {supportAvg || '—'}</div></div>
                  <span className="chart-tag tag-passenger">Passengers</span>
                </div>
                <div className="chart-wrap">
                  <Bar data={{
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{ data: [1, 2, 3, 4, 5].map(i => supportSatData[i] || 0), backgroundColor: [PURPLE_LIGHT, PURPLE_LIGHT, PURPLE, PURPLE, PURPLE], borderRadius: 6 }]
                  }} options={getVBarOptions(['1', '2', '3', '4', '5'])} />
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'driver' && (
          <div className="view active">
            <div className="topbar">
              <div><div className="page-title">Driver responses</div><div className="page-sub">All individual driver survey submissions</div></div>
              <div className="actions"><button className="btn btn-primary" onClick={() => exportCSV('driver')}>Export CSV</button></div>
            </div>
            <div className="table-card">
              <div className="table-head">
                <div className="table-title">Submissions</div>
                <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>{data.driver.length} responses</div>
              </div>
              {!data.driver.length ? (
                <div className="empty-state"><h3>No driver responses yet</h3><p>Share the driver survey link to start collecting data.</p></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>#</th><th>Date</th><th>Experience</th><th>Frustration</th><th>Breakdown</th><th>Pension</th><th>Wanted features</th><th>Support pref.</th></tr></thead>
                    <tbody>
                      {data.driver.map((r: any, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{new Date(r.timestamp).toLocaleDateString()}</td>
                          <td>{r.answers.q1 || '—'}</td>
                          <td>{r.answers.q2 || '—'}</td>
                          <td>{r.answers.q3 || '—'}</td>
                          <td>{r.answers.q4 || '—'}/5</td>
                          <td style={{ maxWidth: '180px', wordBreak: 'break-word' }}>{(r.answers.q5 || []).join(', ') || '—'}</td>
                          <td>{r.answers.q6 || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'passenger' && (
          <div className="view active">
            <div className="topbar">
              <div><div className="page-title">Passenger responses</div><div className="page-sub">All individual passenger survey submissions</div></div>
              <div className="actions"><button className="btn btn-primary" onClick={() => exportCSV('passenger')}>Export CSV</button></div>
            </div>
            <div className="table-card">
              <div className="table-head">
                <div className="table-title">Submissions</div>
                <div style={{ fontSize: '13px', color: 'var(--text-faint)' }}>{data.passenger.length} responses</div>
              </div>
              {!data.passenger.length ? (
                <div className="empty-state"><h3>No passenger responses yet</h3><p>Share the passenger survey link to start collecting data.</p></div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>#</th><th>Date</th><th>Usage freq.</th><th>Priority</th><th>Bad experience</th><th>Wanted features</th><th>Driver welfare</th><th>Support sat.</th></tr></thead>
                    <tbody>
                      {data.passenger.map((r: any, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{new Date(r.timestamp).toLocaleDateString()}</td>
                          <td>{r.answers.q1 || '—'}</td>
                          <td>{r.answers.q2 || '—'}</td>
                          <td>{r.answers.q3 || '—'}</td>
                          <td style={{ maxWidth: '180px', wordBreak: 'break-word' }}>{(r.answers.q4 || []).join(', ') || '—'}</td>
                          <td>{r.answers.q5 || '—'}</td>
                          <td>{r.answers.q6 || '—'}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'freetext' && (
          <div className="view active">
            <div className="topbar">
              <div><div className="page-title">Open feedback</div><div className="page-sub">Written responses from Q7 of both surveys</div></div>
            </div>
            {!freeD.length && !freeP.length ? (
              <div className="table-card"><div className="empty-state"><h3>No written feedback yet</h3><p>Open-ended responses will appear here when respondents fill in question 7.</p></div></div>
            ) : (
              <>
                {freeD.length > 0 && (
                  <div className="table-card" style={{ marginBottom: '20px' }}>
                    <div className="table-head"><div className="table-title">Driver feedback ({freeD.length})</div></div>
                    <div style={{ padding: '20px 24px' }}>
                      {freeD.map((r: any, i) => (
                        <div className="response-bubble green" key={i}>
                          {r.answers.q7}
                          <div className="resp-meta">{new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {freeP.length > 0 && (
                  <div className="table-card">
                    <div className="table-head"><div className="table-title">Passenger feedback ({freeP.length})</div></div>
                    <div style={{ padding: '20px 24px' }}>
                      {freeP.map((r: any, i) => (
                        <div className="response-bubble purple" key={i}>
                          {r.answers.q7}
                          <div className="resp-meta">{new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
