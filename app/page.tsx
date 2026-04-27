'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
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
import Image from 'next/image';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/survey/results');
        if (!res.ok) throw new Error('Failed to fetch results');
        const json = await res.json();
        const driver = json.driver ?? [];
        const passenger = json.passenger ?? [];
        setData({ driver, passenger, all: [...driver, ...passenger] });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Fallback: read from localStorage if API is unreachable
        const driver = JSON.parse(localStorage.getItem('ridesmash_driver') || '[]');
        const passenger = JSON.parse(localStorage.getItem('ridesmash_passenger') || '[]');
        setData({ driver, passenger, all: [...driver, ...passenger] });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const clearData = () => {

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-gray font-dm text-text-faint text-[14px]">
        Loading survey data…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-dm bg-bg-gray text-text-main">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[220px] min-h-screen bg-surface border-r border-border-gray flex-col py-7 fixed top-0 left-0 bottom-0">
        <div className="px-6 pb-7 border-b border-border-gray mb-5">
          <Image src="/logo.png" alt="Ridesmash Logo" width={120} height={32} className="h-6 w-auto" />
        </div>
        <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-faint px-6 mb-2">Views</div>
        <button className={`flex items-center gap-2.5 py-2.5 px-6 text-[13px] font-medium cursor-pointer rounded-none transition-all duration-150 border-none bg-transparent w-full text-left ${view === 'overview' ? 'bg-green-light text-green-dark font-semibold' : 'text-text-muted hover:bg-bg-gray hover:text-text-main'}`} onClick={() => setView('overview')}>
          <div className="w-2 h-2 rounded-full shrink-0 bg-text-faint"></div> Overview
        </button>
        <button className={`flex items-center gap-2.5 py-2.5 px-6 text-[13px] font-medium cursor-pointer rounded-none transition-all duration-150 border-none bg-transparent w-full text-left ${view === 'driver' ? 'bg-green-light text-green-dark font-semibold' : 'text-text-muted hover:bg-bg-gray hover:text-text-main'}`} onClick={() => setView('driver')}>
          <div className="w-2 h-2 rounded-full shrink-0 bg-green"></div> Driver responses
        </button>
        <button className={`flex items-center gap-2.5 py-2.5 px-6 text-[13px] font-medium cursor-pointer rounded-none transition-all duration-150 border-none bg-transparent w-full text-left ${view === 'passenger' ? 'bg-green-light text-green-dark font-semibold' : 'text-text-muted hover:bg-bg-gray hover:text-text-main'}`} onClick={() => setView('passenger')}>
          <div className="w-2 h-2 rounded-full shrink-0 bg-purple"></div> Passenger responses
        </button>
        <button className={`flex items-center gap-2.5 py-2.5 px-6 text-[13px] font-medium cursor-pointer rounded-none transition-all duration-150 border-none bg-transparent w-full text-left ${view === 'freetext' ? 'bg-green-light text-green-dark font-semibold' : 'text-text-muted hover:bg-bg-gray hover:text-text-main'}`} onClick={() => setView('freetext')}>
          <div className="w-2 h-2 rounded-full shrink-0 bg-text-faint"></div> Open feedback
        </button>
        <div className="mt-auto pt-5 px-6 border-t border-border-gray">
          <div className="text-[12px] text-text-faint leading-[1.6] mb-3">
            Ridesmash v2 Research<br />Survey Dashboard
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left text-[12px] font-medium text-text-muted hover:text-red-500 transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-[220px] flex-1 p-5 md:p-8 min-h-screen w-full overflow-hidden">
        {/* Mobile Navigation (Simple Select) */}
        <div className="md:hidden mb-6">
          <select
            className="w-full p-3 border border-border-gray rounded-lg bg-surface text-text-main font-dm"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="driver">Driver responses</option>
            <option value="passenger">Passenger responses</option>
            <option value="freetext">Open feedback</option>
          </select>
        </div>

        {view === 'overview' && (
          <div className="block">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <div className="font-syne text-[24px] font-extrabold text-text-main tracking-[-0.5px]">Survey overview</div>
                <div className="text-[13px] text-text-muted mt-1">{lastUpdatedStr}</div>
              </div>
              <div className="flex gap-2.5">
                <button className="py-2.5 px-[18px] rounded-[10px] font-dm text-[13px] font-medium cursor-pointer transition-all duration-150 border border-border-gray bg-surface text-text-muted hover:border-text-muted hover:text-text-main" onClick={clearData}>Clear all data</button>
                <button className="py-2.5 px-[18px] rounded-[10px] font-dm text-[13px] font-medium cursor-pointer transition-all duration-150 border border-green bg-green text-white font-syne font-bold hover:bg-green-dark hover:border-green-dark" onClick={() => exportCSV()}>Export CSV</button>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-7">
              <div className="bg-surface border border-border-gray rounded-[14px] p-5">
                <div className="text-[12px] text-text-faint uppercase tracking-[0.06em] mb-2">Total responses</div>
                <div className="font-syne text-[32px] font-extrabold text-text-main leading-none mb-1">{data.all.length}</div>
                <div className="text-[12px] text-text-faint">All surveys combined</div>
              </div>
              <div className="bg-surface border border-border-gray rounded-[14px] p-5">
                <div className="text-[12px] text-text-faint uppercase tracking-[0.06em] mb-2">Driver responses</div>
                <div className="font-syne text-[32px] font-extrabold text-green leading-none mb-1">{data.driver.length}</div>
                <div className="text-[12px] text-text-faint">Driver survey</div>
              </div>
              <div className="bg-surface border border-border-gray rounded-[14px] p-5">
                <div className="text-[12px] text-text-faint uppercase tracking-[0.06em] mb-2">Passenger responses</div>
                <div className="font-syne text-[32px] font-extrabold text-purple leading-none mb-1">{data.passenger.length}</div>
                <div className="text-[12px] text-text-faint">Passenger survey</div>
              </div>
              <div className="bg-surface border border-border-gray rounded-[14px] p-5">
                <div className="text-[12px] text-text-faint uppercase tracking-[0.06em] mb-2">Open feedback</div>
                <div className="font-syne text-[32px] font-extrabold text-text-main leading-none mb-1">{freeD.length + freeP.length}</div>
                <div className="text-[12px] text-text-faint">Written responses</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Biggest driver frustrations</div><div className="text-[12px] text-text-faint mt-[3px]">Q2 — Driver survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-green-light text-green-dark">Drivers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Bar data={{
                    labels: driverFrustrationsKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: driverFrustrationsKeys.map(k => driverFrustrations[k]), backgroundColor: GREEN, borderRadius: 6 }]
                  }} options={getHBarOptions(driverFrustrationsKeys)} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Booking priority — passengers</div><div className="text-[12px] text-text-faint mt-[3px]">Q2 — Passenger survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-purple-light text-purple-dark">Passengers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Bar data={{
                    labels: passengerPriorityKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: passengerPriorityKeys.map(k => passengerPriority[k]), backgroundColor: PURPLE, borderRadius: 6 }]
                  }} options={getHBarOptions(passengerPriorityKeys)} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Breakdown resilience</div><div className="text-[12px] text-text-faint mt-[3px]">Q3 — Driver survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-green-light text-green-dark">Drivers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Doughnut data={{
                    labels: Object.keys(breakdownData),
                    datasets: [{ data: Object.values(breakdownData), backgroundColor: [GREEN, '#5DCAA5', '#85B7EB', '#AFA9EC'], borderWidth: 2, borderColor: '#fff' }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans', size: 11 }, color: '#5A7068', boxWidth: 12, padding: 10 } } }
                  }} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Pension importance</div><div className="text-[12px] text-text-faint mt-[3px]">Q4 — Driver avg: {pensionAvg || '—'}</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-green-light text-green-dark">Drivers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Bar data={{
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{ data: [1, 2, 3, 4, 5].map(i => pensionScaleData[i] || 0), backgroundColor: [GREEN_LIGHT, GREEN_LIGHT, GREEN, GREEN, GREEN], borderRadius: 6 }]
                  }} options={getVBarOptions(['1', '2', '3', '4', '5'])} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6 lg:col-span-2">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Top features drivers want</div><div className="text-[12px] text-text-faint mt-[3px]">Q5 — Driver survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-green-light text-green-dark">Drivers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Bar data={{
                    labels: driverFeaturesKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: driverFeaturesKeys.map(k => driverFeatures[k]), backgroundColor: GREEN, borderRadius: 6 }]
                  }} options={getHBarOptions(driverFeaturesKeys)} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6 lg:col-span-2">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Top features passengers want</div><div className="text-[12px] text-text-faint mt-[3px]">Q4 — Passenger survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-purple-light text-purple-dark">Passengers</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Bar data={{
                    labels: passengerFeaturesKeys.map(l => shortLabel(l, 32)),
                    datasets: [{ data: passengerFeaturesKeys.map(k => passengerFeatures[k]), backgroundColor: PURPLE, borderRadius: 6 }]
                  }} options={getHBarOptions(passengerFeaturesKeys)} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Driver welfare sentiment</div><div className="text-[12px] text-text-faint mt-[3px]">Q5 — Passenger survey</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-[#FFF3E0] text-[#8B4513]">Both</span>
                </div>
                <div className="relative w-full h-[220px]">
                  <Doughnut data={{
                    labels: Object.keys(welfareData),
                    datasets: [{ data: Object.values(welfareData), backgroundColor: [PURPLE, PURPLE_LIGHT, '#D4D2F0', GRAY], borderWidth: 2, borderColor: '#fff' }]
                  }} options={{
                    responsive: true, maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans', size: 11 }, color: '#5A7068', boxWidth: 12, padding: 10 } } }
                  }} />
                </div>
              </div>

              <div className="bg-surface border border-border-gray rounded-[14px] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div><div className="font-syne text-[15px] font-bold text-text-main">Support satisfaction</div><div className="text-[12px] text-text-faint mt-[3px]">Q6 — Passenger avg: {supportAvg || '—'}</div></div>
                  <span className="text-[11px] font-medium py-[3px] px-2.5 rounded-[20px] bg-purple-light text-purple-dark">Passengers</span>
                </div>
                <div className="relative w-full h-[220px]">
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
          <div className="block">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div><div className="font-syne text-[24px] font-extrabold text-text-main tracking-[-0.5px]">Driver responses</div><div className="text-[13px] text-text-muted mt-1">All individual driver survey submissions</div></div>
              <div className="flex gap-2.5"><button className="py-2.5 px-[18px] rounded-[10px] font-dm text-[13px] font-medium cursor-pointer transition-all duration-150 border border-green bg-green text-white font-syne font-bold hover:bg-green-dark hover:border-green-dark" onClick={() => exportCSV('driver')}>Export CSV</button></div>
            </div>
            <div className="bg-surface border border-border-gray rounded-[14px] overflow-hidden mb-6">
              <div className="py-5 px-6 border-b border-border-gray flex justify-between items-center">
                <div className="font-syne text-[15px] font-bold text-text-main">Submissions</div>
                <div className="text-[13px] text-text-faint">{data.driver.length} responses</div>
              </div>
              {!data.driver.length ? (
                <div className="text-center py-12 px-6 text-text-faint"><h3 className="font-syne text-[16px] font-bold text-text-muted mb-2">No driver responses yet</h3><p className="text-[13px]">Share the driver survey link to start collecting data.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">#</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Date</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Experience</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Frustration</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Breakdown</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Pension</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Wanted features</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Support pref.</th>
                    </tr></thead>
                    <tbody>
                      {data.driver.map((r: any, i) => (
                        <tr key={i} className="hover:bg-bg-gray">
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{i + 1}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{new Date(r.timestamp).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q1 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q2 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q3 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q4 || '—'}/5</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0 max-w-[180px] break-words">{(r.answers.q5 || []).join(', ') || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q6 || '—'}</td>
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
          <div className="block">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div><div className="font-syne text-[24px] font-extrabold text-text-main tracking-[-0.5px]">Passenger responses</div><div className="text-[13px] text-text-muted mt-1">All individual passenger survey submissions</div></div>
              <div className="flex gap-2.5"><button className="py-2.5 px-[18px] rounded-[10px] font-dm text-[13px] font-medium cursor-pointer transition-all duration-150 border border-green bg-green text-white font-syne font-bold hover:bg-green-dark hover:border-green-dark" onClick={() => exportCSV('passenger')}>Export CSV</button></div>
            </div>
            <div className="bg-surface border border-border-gray rounded-[14px] overflow-hidden mb-6">
              <div className="py-5 px-6 border-b border-border-gray flex justify-between items-center">
                <div className="font-syne text-[15px] font-bold text-text-main">Submissions</div>
                <div className="text-[13px] text-text-faint">{data.passenger.length} responses</div>
              </div>
              {!data.passenger.length ? (
                <div className="text-center py-12 px-6 text-text-faint"><h3 className="font-syne text-[16px] font-bold text-text-muted mb-2">No passenger responses yet</h3><p className="text-[13px]">Share the passenger survey link to start collecting data.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">#</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Date</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Usage freq.</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Priority</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Bad experience</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Wanted features</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Driver welfare</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-medium tracking-[0.08em] uppercase text-text-faint bg-bg-gray border-b border-border-gray">Support sat.</th>
                    </tr></thead>
                    <tbody>
                      {data.passenger.map((r: any, i) => (
                        <tr key={i} className="hover:bg-bg-gray">
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{i + 1}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{new Date(r.timestamp).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q1 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q2 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q3 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0 max-w-[180px] break-words">{(r.answers.q4 || []).join(', ') || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q5 || '—'}</td>
                          <td className="py-3 px-4 text-[13px] text-text-muted border-b border-border-gray align-top last:border-b-0">{r.answers.q6 || '—'}/5</td>
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
          <div className="block">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div><div className="font-syne text-[24px] font-extrabold text-text-main tracking-[-0.5px]">Open feedback</div><div className="text-[13px] text-text-muted mt-1">Written responses from Q7 of both surveys</div></div>
            </div>
            {!freeD.length && !freeP.length ? (
              <div className="bg-surface border border-border-gray rounded-[14px] overflow-hidden mb-6"><div className="text-center py-12 px-6 text-text-faint"><h3 className="font-syne text-[16px] font-bold text-text-muted mb-2">No written feedback yet</h3><p className="text-[13px]">Open-ended responses will appear here when respondents fill in question 7.</p></div></div>
            ) : (
              <>
                {freeD.length > 0 && (
                  <div className="bg-surface border border-border-gray rounded-[14px] overflow-hidden mb-6">
                    <div className="py-5 px-6 border-b border-border-gray flex justify-between items-center"><div className="font-syne text-[15px] font-bold text-text-main">Driver feedback ({freeD.length})</div></div>
                    <div className="p-6">
                      {freeD.map((r: any, i) => (
                        <div className="bg-bg-gray rounded-[10px] py-3 px-4 text-[13px] text-text-main mb-2.5 border-l-[3px] border-green leading-[1.6]" key={i}>
                          {r.answers.q7}
                          <div className="text-[11px] text-text-faint mt-1.5">{new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {freeP.length > 0 && (
                  <div className="bg-surface border border-border-gray rounded-[14px] overflow-hidden mb-6">
                    <div className="py-5 px-6 border-b border-border-gray flex justify-between items-center"><div className="font-syne text-[15px] font-bold text-text-main">Passenger feedback ({freeP.length})</div></div>
                    <div className="p-6">
                      {freeP.map((r: any, i) => (
                        <div className="bg-bg-gray rounded-[10px] py-3 px-4 text-[13px] text-text-main mb-2.5 border-l-[3px] border-purple leading-[1.6]" key={i}>
                          {r.answers.q7}
                          <div className="text-[11px] text-text-faint mt-1.5">{new Date(r.timestamp).toLocaleDateString()}</div>
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
