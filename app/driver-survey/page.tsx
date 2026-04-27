'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DriverSurvey() {
  const [cur, setCur] = useState(1);
  const total = 7;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);
  const [q7Text, setQ7Text] = useState('');

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

  const submitForm = async () => {
    const payload = {
      type: 'driver',
      timestamp: new Date().toISOString(),
      answers: { ...answers, q5: multiAnswers['q5'] || [], q7: q7Text }
    };

    try {
      const res = await fetch('/api/survey/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error('Driver survey API error:', await res.text());
      }
    } catch (err) {

      console.error('Driver survey fetch failed, falling back to localStorage:', err);
      const existingStr = localStorage.getItem('ridesmash_driver');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      existing.push(payload);
      localStorage.setItem('ridesmash_driver', JSON.stringify(existing));
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-bg-green text-text-main font-dm">
        <div className="w-full py-5 px-8 flex items-center gap-2.5 border-b border-border-green bg-surface sticky top-0 z-10">
          <Image src="/logo.png" alt="Ridesmash Logo" width={120} height={32} className="h-6 w-auto" />
          <div className="text-[11px] font-medium bg-green-light text-green-dark py-[3px] px-2.5 rounded-full tracking-[0.03em]">
            Driver Survey
          </div>
        </div>
        <div className="animate-fade-up-slow text-center py-12 max-w-[680px] w-full px-6">
          <div className="w-[72px] h-[72px] rounded-full bg-green-light flex items-center justify-center mx-auto mb-6 text-[30px] text-green">
            ✓
          </div>
          <h2 className="font-syne text-[28px] font-extrabold text-text-main mb-3">Thank you, driver!</h2>
          <p className="text-[15px] text-text-muted leading-[1.7]">
            Your feedback is now helping shape Ridesmash v2.<br />We'll build something better — because of you.
          </p>
        </div>
      </div>
    );
  }

  const progressPct = updateProgress(cur);

  return (
    <div className="min-h-screen flex flex-col items-center bg-bg-green text-text-main font-dm">
      <div className="w-full py-5 px-8 flex items-center gap-2.5 border-b border-border-green bg-surface sticky top-0 z-10">
        <Image src="/logo.png" alt="Ridesmash Logo" width={120} height={32} className="h-6 w-auto" />
        <div className="text-[11px] font-medium bg-green-light text-green-dark py-[3px] px-2.5 rounded-full tracking-[0.03em]">
          Driver Survey
        </div>
      </div>

      <div className="w-full max-w-[680px] pt-12 px-6 pb-6 text-center">
        <div className="inline-block text-[12px] font-medium tracking-[0.12em] uppercase text-green mb-[14px]">
          Version 2 Research
        </div>
        <h1 className="font-syne text-[clamp(28px,5vw,40px)] font-extrabold leading-[1.15] tracking-[-1px] text-text-main mb-[14px]">
          Help us build a better platform for drivers
        </h1>
        <p className="text-[15px] text-text-muted leading-[1.7] max-w-[440px] mx-auto mb-8">
          Your honest feedback shapes Ridesmash v2. This takes less than 2 minutes — no writing required.
        </p>
        <div className="flex justify-center gap-6 text-[13px] text-text-muted">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></div> 7 questions</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></div> ~2 minutes</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></div> 100% anonymous</span>
        </div>
      </div>

      <div className="w-full max-w-[680px] px-6 pb-20">
        <div className="my-8 flex justify-between items-center">
          <span className="text-[13px] text-text-muted">Question {cur} of {total}</span>
          <span className="font-syne text-[14px] font-bold text-green">{progressPct}%</span>
        </div>
        <div className="w-full h-[5px] bg-border-green rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-mid to-green-dark rounded-full transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {cur === 1 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 01</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">How long have you been driving for an e-hailing platform?</div>
            <div className="flex flex-col gap-2.5">
              {['Less than 6 months', '6 months – 1 year', '1 – 3 years', 'More than 3 years'].map(opt => {
                const selected = answers['q1'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-green bg-green-light text-green-dark' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pick('q1', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-green bg-green' : 'border-border-green'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <span></span>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(2)} disabled={!canGoNext('q1')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 2 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 02</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">What's your biggest frustration with your current e-hailing platform?</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Commission / deductions are too high',
                'Poor customer support when issues arise',
                'Unfair passenger ratings / no driver protection',
                'No financial support during vehicle breakdowns',
                'Too many drivers, not enough ride requests'
              ].map(opt => {
                const selected = answers['q2'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-green bg-green-light text-green-dark' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pick('q2', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-green bg-green' : 'border-border-green'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(1)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(3)} disabled={!canGoNext('q2')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 3 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 03</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">If your car broke down today and you couldn't work, what would you do?</div>
            <div className="flex flex-col gap-2.5">
              {[
                "I have savings — I'd fix it myself",
                "I'd borrow money from family or friends",
                "I'd take a loan from a bank or local lender",
                "Honestly, I don't know — it would be a crisis"
              ].map(opt => {
                const selected = answers['q3'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-green bg-green-light text-green-dark' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pick('q3', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-green bg-green' : 'border-border-green'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(2)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(4)} disabled={!canGoNext('q3')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 4 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 04</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">How important is a pension / retirement savings feature to you as a driver?</div>
            <div className="flex gap-2 mb-2.5 flex-wrap sm:flex-nowrap">
              {[1, 2, 3, 4, 5].map(val => {
                const selected = answers['q4'] === val;
                return (
                  <button key={val} className={`flex-1 min-w-[50px] py-[14px] px-1 border-[1.5px] rounded-[14px] cursor-pointer font-syne text-[16px] font-bold transition-all duration-150 ${selected ? 'border-green bg-green text-white' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pickScale('q4', val)}>{val}</button>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-text-faint mb-6">
              <span>Not important at all</span><span>Extremely important</span>
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(3)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(5)} disabled={!canGoNext('q4')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 5 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 05</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">Which features would make you switch to Ridesmash full-time?</div>
            <div className="text-[12px] text-text-faint mb-3">Select all that apply</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Lower platform commission rate',
                'Vehicle repair financial aid (VM Wallet)',
                'Pension savings per ride (MP Wallet)',
                'Better customer support and dispute resolution',
                'Driver loyalty rewards and tier system',
                'Ability to see and claim pre-booked rides'
              ].map(opt => {
                const selected = (multiAnswers['q5'] || []).includes(opt);
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-green bg-green-light text-green-dark' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pickMulti('q5', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-green bg-green' : 'border-border-green'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(4)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(6)} disabled={!canGoNext('q5')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 6 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 06</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">How do you prefer to receive support when you have a problem?</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'In-app live chat',
                'Phone call with agent',
                'WhatsApp support',
                'Self-service help centre'
              ].map(opt => {
                const selected = answers['q6'] === opt;
                return (
                  <button key={opt} className={`py-4 px-3 border-[1.5px] rounded-[14px] cursor-pointer text-[13px] text-center font-dm leading-[1.4] transition-all duration-150 ${selected ? 'border-green bg-green-light text-green-dark font-medium' : 'border-border-green bg-surface text-text-main hover:border-green-mid hover:bg-[#F0FAF6]'}`} onClick={() => pickGrid('q6', opt)}>{opt}</button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(5)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => goTo(7)} disabled={!canGoNext('q6')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 7 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-faint mb-2.5">Question 07 — Optional</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-main mb-6">Anything else you wish an e-hailing app would do for drivers?</div>
            <textarea className="w-full py-[14px] px-4 border-[1.5px] border-border-green rounded-[14px] bg-surface font-dm text-[14px] text-text-main resize-none outline-none transition-colors duration-150 focus:border-green placeholder-text-faint" rows={5} placeholder="Share your thoughts freely — every idea helps..." value={q7Text} onChange={(e) => setQ7Text(e.target.value)}></textarea>
            <div className="text-[12px] text-text-faint text-center mt-3">This field is optional. You can skip and submit directly.</div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-green rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-muted cursor-pointer transition-all duration-150 hover:border-text-muted hover:text-text-main" onClick={() => goTo(6)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-green-dark disabled:bg-border-green disabled:text-text-faint disabled:cursor-not-allowed" onClick={() => submitForm()}>Submit →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
