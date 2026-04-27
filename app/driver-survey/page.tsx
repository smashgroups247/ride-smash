'use client';

import React, { useState, useEffect } from 'react';
import './driver.css';

export default function DriverSurvey() {
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

  const pickGrid = (q: string, val: string) => {
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
    if (q === 'q5') {
      return (multiAnswers['q5'] || []).length > 0;
    }
    if (q === 'q7') return true;
    return answers[q] !== undefined;
  };

  const submitForm = () => {
    const payload = {
      type: 'driver',
      timestamp: new Date().toISOString(),
      answers: { ...answers, q5: multiAnswers['q5'] || [], q7: q7Text }
    };

    const existingStr = localStorage.getItem('ridesmash_driver');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.push(payload);
    localStorage.setItem('ridesmash_driver', JSON.stringify(existing));

    setDone(true);
  };

  if (done) {
    return (
      <div className="driver-body">
        <div className="top-bar">
          <div className="logo">Ride<span>smash</span></div>
          <div className="badge">Driver Survey</div>
        </div>
        <div className="done-screen show" style={{ maxWidth: '680px', width: '100%', padding: '48px 24px' }}>
          <div className="done-icon">✓</div>
          <h2>Thank you, driver!</h2>
          <p>Your feedback is now helping shape Ridesmash v2.<br />We'll build something better — because of you.</p>
        </div>
      </div>
    );
  }

  const progressPct = updateProgress(cur);

  return (
    <div className="driver-body">
      <div className="top-bar">
        <div className="logo">Ride<span>smash</span></div>
        <div className="badge">Driver Survey</div>
      </div>

      <div className="hero">
        <div className="hero-tag">Version 2 Research</div>
        <h1>Help us build a better platform for drivers</h1>
        <p>Your honest feedback shapes Ridesmash v2. This takes less than 2 minutes — no writing required.</p>
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
            <div className="q-text">How long have you been driving for an e-hailing platform?</div>
            <div className="options">
              {['Less than 6 months', '6 months – 1 year', '1 – 3 years', 'More than 3 years'].map(opt => (
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
            <div className="q-text">What's your biggest frustration with your current e-hailing platform?</div>
            <div className="options">
              {[
                'Commission / deductions are too high',
                'Poor customer support when issues arise',
                'Unfair passenger ratings / no driver protection',
                'No financial support during vehicle breakdowns',
                'Too many drivers, not enough ride requests'
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
            <div className="q-text">If your car broke down today and you couldn't work, what would you do?</div>
            <div className="options">
              {[
                "I have savings — I'd fix it myself",
                "I'd borrow money from family or friends",
                "I'd take a loan from a bank or local lender",
                "Honestly, I don't know — it would be a crisis"
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
            <div className="q-text">How important is a pension / retirement savings feature to you as a driver?</div>
            <div className="scale-row">
              {[1, 2, 3, 4, 5].map(val => (
                <button key={val} className={`scale-btn ${answers['q4'] === val ? 'selected' : ''}`} onClick={() => pickScale('q4', val)}>{val}</button>
              ))}
            </div>
            <div className="scale-labels"><span>Not important at all</span><span>Extremely important</span></div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(3)}>← Back</button><button className="btn-next" onClick={() => goTo(5)} disabled={!canGoNext('q4')}>Next →</button></div>
          </div>
        )}

        {cur === 5 && (
          <div className="step active">
            <div className="q-num">Question 05</div>
            <div className="q-text">Which features would make you switch to Ridesmash full-time?</div>
            <div className="multi-hint">Select all that apply</div>
            <div className="options">
              {[
                'Lower platform commission rate',
                'Vehicle repair financial aid (VM Wallet)',
                'Pension savings per ride (MP Wallet)',
                'Better customer support and dispute resolution',
                'Driver loyalty rewards and tier system',
                'Ability to see and claim pre-booked rides'
              ].map(opt => (
                <button key={opt} className={`opt ${(multiAnswers['q5'] || []).includes(opt) ? 'selected' : ''}`} onClick={() => pickMulti('q5', opt)}>
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
            <div className="q-text">How do you prefer to receive support when you have a problem?</div>
            <div className="grid-opts">
              {[
                'In-app live chat',
                'Phone call with agent',
                'WhatsApp support',
                'Self-service help centre'
              ].map(opt => (
                <button key={opt} className={`grid-opt ${answers['q6'] === opt ? 'selected' : ''}`} onClick={() => pickGrid('q6', opt)}>{opt}</button>
              ))}
            </div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(5)}>← Back</button><button className="btn-next" onClick={() => goTo(7)} disabled={!canGoNext('q6')}>Next →</button></div>
          </div>
        )}

        {cur === 7 && (
          <div className="step active">
            <div className="q-num">Question 07 — Optional</div>
            <div className="q-text">Anything else you wish an e-hailing app would do for drivers?</div>
            <textarea rows={5} placeholder="Share your thoughts freely — every idea helps..." value={q7Text} onChange={(e) => setQ7Text(e.target.value)}></textarea>
            <div className="submit-note">This field is optional. You can skip and submit directly.</div>
            <div className="nav-buttons"><button className="btn-back" onClick={() => goTo(6)}>← Back</button><button className="btn-next" onClick={() => submitForm()}>Submit →</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
