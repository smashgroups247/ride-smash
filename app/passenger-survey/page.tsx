'use client';

import React, { useState, useEffect } from 'react';
import './passenger.css';

export default function PassengerSurvey() {
  const [cur, setCur] = useState(1);
  const total = 7;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);
  const [q7Text, setQ7Text] = useState('');

  // Hydrate answers from local storage if needed, or simply initialize empty
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cur]);

  const updateProgress = (n: number) => {
    return Math.round(((n - 1) / total) * 100);
  };

  const goTo = (n: number) => {
    setCur(n);
  };

  const pick = (q: string, val: string) => {
    setAnswers(prev => ({ ...prev, [q]: val }));
  };

  const pickScale = (q: string, val: number) => {
    setAnswers(prev => ({ ...prev, [q]: val }));
  };

  const pickMulti = (q: string, val: string) => {
    setMultiAnswers(prev => {
      const arr = prev[q] || [];
      if (arr.includes(val)) {
        return { ...prev, [q]: arr.filter(v => v !== val) };
      } else {
        return { ...prev, [q]: [...arr, val] };
      }
    });
  };

  const canGoNext = (q: string) => {
    if (q === 'q4') {
      return (multiAnswers['q4'] || []).length > 0;
    }
    if (q === 'q7') return true;
    return answers[q] !== undefined;
  };

  const submitForm = () => {
    const payload = {
      type: 'passenger',
      timestamp: new Date().toISOString(),
      answers: { ...answers, q4: multiAnswers['q4'] || [], q7: q7Text }
    };

    const existingStr = localStorage.getItem('ridesmash_passenger');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.push(payload);
    localStorage.setItem('ridesmash_passenger', JSON.stringify(existing));

    // fetch('/api/submit', ...
    setDone(true);
  };

  if (done) {
    return (
      <div className="passenger-body">
        <div className="top-bar">
          <div className="logo">Ride<span>smash</span></div>
          <div className="badge">Passenger Survey</div>
        </div>
        <div className="done-screen show" style={{ maxWidth: '680px', width: '100%', padding: '48px 24px' }}>
          <div className="done-icon">✓</div>
          <h2>Thank you so much!</h2>
          <p>Your input is helping Ridesmash build something better.<br />Every response counts — we appreciate you.</p>
        </div>
      </div>
    );
  }

  const progressPct = updateProgress(cur);

  return (
    <div className="passenger-body">
      <div className="top-bar">
        <div className="logo">Ride<span>smash</span></div>
        <div className="badge">Passenger Survey</div>
      </div>

      <div className="hero">
        <div className="hero-tag">Version 2 Research</div>
        <h1>Tell us how to make every ride better</h1>
        <p>Your feedback shapes the next version of Ridesmash. Less than 2 minutes — just tap your answers.</p>
        <div className="meta-row">
          <span><div className="dot"></div> 7 questions</span>
          <span><div className="dot"></div> ~2 minutes</span>
          <span><div className="dot"></div> 100% anonymous</span>
        </div>
      </div>

      <div className="form-wrap">
        <div className="progress-section">
          <span className="progress-label">Question {cur} of {total}</span>
          <span className="progress-pct">{progressPct}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }}></div></div>

        {cur === 1 && (
          <div className="step active">
            <div className="q-num">Question 01</div>
            <div className="q-text">How often do you use e-hailing apps like Bolt or Uber?</div>
            <div className="options">
              {['Every day', 'A few times a week', 'A few times a month', 'Rarely'].map(opt => (
                <button key={opt} className={`opt ${answers['q1'] === opt ? 'selected' : ''}`} onClick={() => pick('q1', opt)}>
                  <div className="opt-radio"><div className="opt-radio-dot"></div></div>{opt}
                </button>
              ))}
            </div>
            <div className="nav-buttons"><span></span><button className="btn-next" onClick={() => goTo(2)} disabled={!canGoNext('q1')}>Next →</button></div>
          </div>
        )}

        {cur === 2 && (
          <div className="step active">
            <div className="q-num">Question 02</div>
            <div className="q-text">What matters most to you when booking a ride?</div>
            <div className="options">
              {[
                'Price / fare amount',
                'How quickly the driver arrives (ETA)',
                'Driver rating and reviews',
                'Safety features in the app',
                'Car type and comfort level'
              ].map(opt => (
                <button key={opt} className={`opt ${answers['q2'] === opt ? 'selected' : ''}`} onClick={() => pick('q2', opt)}>
                  <div className="opt-radio"><div className="opt-radio-dot"></div></div>{opt}
                </button>
              ))}
            </div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(1)}>← Back</button><button className="btn-next" onClick={() => goTo(3)} disabled={!canGoNext('q2')}>Next →</button></div>
          </div>
        )}

        {cur === 3 && (
          <div className="step active">
            <div className="q-num">Question 03</div>
            <div className="q-text">Have you ever had a bad ride experience that put you off an app?</div>
            <div className="options">
              {[
                'Yes — unsafe or uncomfortable driver behaviour',
                'Yes — wrong route taken or overcharged',
                'Yes — bad app experience or too many cancellations',
                "No, I've never had a serious issue"
              ].map(opt => (
                <button key={opt} className={`opt ${answers['q3'] === opt ? 'selected' : ''}`} onClick={() => pick('q3', opt)}>
                  <div className="opt-radio"><div className="opt-radio-dot"></div></div>{opt}
                </button>
              ))}
            </div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(2)}>← Back</button><button className="btn-next" onClick={() => goTo(4)} disabled={!canGoNext('q3')}>Next →</button></div>
          </div>
        )}

        {cur === 4 && (
          <div className="step active">
            <div className="q-num">Question 04</div>
            <div className="q-text">Which features would most improve your ride experience?</div>
            <div className="multi-hint">Select all that apply</div>
            <div className="options">
              {[
                'Schedule rides in advance',
                'Live trip sharing with a trusted contact',
                'In-app SOS / emergency safety button',
                'Monthly ride subscription / pass for savings',
                'Multiple stops in a single ride',
                'Package or errand delivery option'
              ].map(opt => (
                <button key={opt} className={`opt ${(multiAnswers['q4'] || []).includes(opt) ? 'selected' : ''}`} onClick={() => pickMulti('q4', opt)}>
                  <div className="opt-radio"><div className="opt-radio-dot"></div></div>{opt}
                </button>
              ))}
            </div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(3)}>← Back</button><button className="btn-next" onClick={() => goTo(5)} disabled={!canGoNext('q4')}>Next →</button></div>
          </div>
        )}

        {cur === 5 && (
          <div className="step active">
            <div className="q-num">Question 05</div>
            <div className="q-text">Would knowing a platform treats its drivers fairly make you more likely to use it?</div>
            <div className="options">
              {[
                'Yes — I actively care about driver welfare',
                'Somewhat — it would be a nice bonus',
                'Not really — price and speed matter more',
                "I've never thought about this before"
              ].map(opt => (
                <button key={opt} className={`opt ${answers['q5'] === opt ? 'selected' : ''}`} onClick={() => pick('q5', opt)}>
                  <div className="opt-radio"><div className="opt-radio-dot"></div></div>{opt}
                </button>
              ))}
            </div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(4)}>← Back</button><button className="btn-next" onClick={() => goTo(6)} disabled={!canGoNext('q5')}>Next →</button></div>
          </div>
        )}

        {cur === 6 && (
          <div className="step active">
            <div className="q-num">Question 06</div>
            <div className="q-text">How satisfied are you with how e-hailing apps handle complaints or refund requests?</div>
            <div className="scale-row">
              {[1, 2, 3, 4, 5].map(val => (
                <button key={val} className={`scale-btn ${answers['q6'] === val ? 'selected' : ''}`} onClick={() => pickScale('q6', val)}>{val}</button>
              ))}
            </div>
            <div className="scale-labels"><span>Very dissatisfied</span><span>Very satisfied</span></div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(5)}>← Back</button><button className="btn-next" onClick={() => goTo(7)} disabled={!canGoNext('q6')}>Next →</button></div>
          </div>
        )}

        {cur === 7 && (
          <div className="step active">
            <div className="q-num">Question 07 — Optional</div>
            <div className="q-text">Is there anything you wish e-hailing apps would do that none of them currently do?</div>
            <textarea rows={5} placeholder="Share any ideas, frustrations, or wishes freely..." value={q7Text} onChange={(e) => setQ7Text(e.target.value)}></textarea>
            <div className="submit-note">This field is optional. You can submit without answering.</div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(6)}>← Back</button><button className="btn-next" onClick={() => submitForm()}>Submit →</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
