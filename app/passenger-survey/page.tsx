'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PassengerSurvey() {
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

    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-bg-purple text-text-passenger font-dm">
        <div className="w-full py-5 px-8 flex items-center gap-2.5 border-b border-border-purple bg-surface sticky top-0 z-10">
          <Image src="/logo.png" alt="Ridesmash Logo" width={120} height={32} className="h-6 w-auto" />
          <div className="text-[11px] font-medium bg-purple-light text-purple-dark py-[3px] px-2.5 rounded-full tracking-[0.03em]">
            Passenger Survey
          </div>
        </div>
        <div className="animate-fade-up-slow text-center py-12 max-w-[680px] w-full px-6">
          <div className="w-[72px] h-[72px] rounded-full bg-purple-light flex items-center justify-center mx-auto mb-6 text-[30px] text-purple">
            ✓
          </div>
          <h2 className="font-syne text-[28px] font-extrabold text-text-passenger mb-3">Thank you so much!</h2>
          <p className="text-[15px] text-text-passenger-muted leading-[1.7]">
            Your input is helping Ridesmash build something better.<br />Every response counts — we appreciate you.
          </p>
        </div>
      </div>
    );
  }

  const progressPct = updateProgress(cur);

  return (
    <div className="min-h-screen flex flex-col items-center bg-bg-purple text-text-passenger font-dm">
      <div className="w-full py-5 px-8 flex items-center gap-2.5 border-b border-border-purple bg-surface sticky top-0 z-10">
        <Image src="/logo.png" alt="Ridesmash Logo" width={120} height={32} className="h-6 w-auto" />
        <div className="text-[11px] font-medium bg-purple-light text-purple-dark py-[3px] px-2.5 rounded-full tracking-[0.03em]">
          Passenger Survey
        </div>
      </div>

      <div className="w-full max-w-[680px] pt-12 px-6 pb-6 text-center">
        <div className="inline-block text-[12px] font-medium tracking-[0.12em] uppercase text-purple mb-[14px]">
          Version 2 Research
        </div>
        <h1 className="font-syne text-[clamp(28px,5vw,40px)] font-extrabold leading-[1.15] tracking-[-1px] text-text-passenger mb-[14px]">
          Tell us how to make every ride better
        </h1>
        <p className="text-[15px] text-text-passenger-muted leading-[1.7] max-w-[440px] mx-auto mb-8">
          Your feedback shapes the next version of Ridesmash. Less than 2 minutes — just tap your answers.
        </p>
        <div className="flex justify-center gap-6 text-[13px] text-text-passenger-muted">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div> 7 questions</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div> ~2 minutes</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0"></div> 100% anonymous</span>
        </div>
      </div>

      <div className="w-full max-w-[680px] px-6 pb-20">
        <div className="my-8 flex justify-between items-center">
          <span className="text-[13px] text-text-passenger-muted">Question {cur} of {total}</span>
          <span className="font-syne text-[14px] font-bold text-purple">{progressPct}%</span>
        </div>
        <div className="w-full h-[5px] bg-border-purple rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-mid to-purple-dark rounded-full transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]" 
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {cur === 1 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 01</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">How often do you use e-hailing apps like Bolt or Uber?</div>
            <div className="flex flex-col gap-2.5">
              {['Every day', 'A few times a week', 'A few times a month', 'Rarely'].map(opt => {
                const selected = answers['q1'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-purple bg-purple-light text-purple-dark' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pick('q1', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-purple bg-purple' : 'border-border-purple'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <span></span>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(2)} disabled={!canGoNext('q1')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 2 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 02</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">What matters most to you when booking a ride?</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Price / fare amount',
                'How quickly the driver arrives (ETA)',
                'Driver rating and reviews',
                'Safety features in the app',
                'Car type and comfort level'
              ].map(opt => {
                const selected = answers['q2'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-purple bg-purple-light text-purple-dark' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pick('q2', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-purple bg-purple' : 'border-border-purple'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(1)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(3)} disabled={!canGoNext('q2')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 3 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 03</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">Have you ever had a bad ride experience that put you off an app?</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Yes — unsafe or uncomfortable driver behaviour',
                'Yes — wrong route taken or overcharged',
                'Yes — bad app experience or too many cancellations',
                "No, I've never had a serious issue"
              ].map(opt => {
                const selected = answers['q3'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-purple bg-purple-light text-purple-dark' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pick('q3', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-purple bg-purple' : 'border-border-purple'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(2)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(4)} disabled={!canGoNext('q3')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 4 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 04</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">Which features would most improve your ride experience?</div>
            <div className="text-[12px] text-text-passenger-faint mb-3">Select all that apply</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Schedule rides in advance',
                'Live trip sharing with a trusted contact',
                'In-app SOS / emergency safety button',
                'Monthly ride subscription / pass for savings',
                'Multiple stops in a single ride',
                'Package or errand delivery option'
              ].map(opt => {
                const selected = (multiAnswers['q4'] || []).includes(opt);
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-purple bg-purple-light text-purple-dark' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pickMulti('q4', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-purple bg-purple' : 'border-border-purple'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(3)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(5)} disabled={!canGoNext('q4')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 5 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 05</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">Would knowing a platform treats its drivers fairly make you more likely to use it?</div>
            <div className="flex flex-col gap-2.5">
              {[
                'Yes — I actively care about driver welfare',
                'Somewhat — it would be a nice bonus',
                'Not really — price and speed matter more',
                "I've never thought about this before"
              ].map(opt => {
                const selected = answers['q5'] === opt;
                return (
                  <button key={opt} className={`flex items-center gap-[14px] py-[15px] px-[18px] border-[1.5px] rounded-[14px] cursor-pointer text-[14px] transition-all duration-150 text-left w-full font-dm ${selected ? 'border-purple bg-purple-light text-purple-dark' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pick('q5', opt)}>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${selected ? 'border-purple bg-purple' : 'border-border-purple'}`}>
                      <div className={`w-2 h-2 rounded-full bg-white ${selected ? 'block' : 'hidden'}`}></div>
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(4)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(6)} disabled={!canGoNext('q5')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 6 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 06</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">How satisfied are you with how e-hailing apps handle complaints or refund requests?</div>
            <div className="flex gap-2 mb-2.5 flex-wrap sm:flex-nowrap">
              {[1, 2, 3, 4, 5].map(val => {
                const selected = answers['q6'] === val;
                return (
                  <button key={val} className={`flex-1 min-w-[50px] py-[14px] px-1 border-[1.5px] rounded-[14px] cursor-pointer font-syne text-[16px] font-bold transition-all duration-150 ${selected ? 'border-purple bg-purple text-white' : 'border-border-purple bg-surface text-text-passenger hover:border-purple-mid hover:bg-[#F3F2FD]'}`} onClick={() => pickScale('q6', val)}>{val}</button>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-text-passenger-faint mb-6">
              <span>Very dissatisfied</span><span>Very satisfied</span>
            </div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(5)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => goTo(7)} disabled={!canGoNext('q6')}>Next →</button>
            </div>
          </div>
        )}

        {cur === 7 && (
          <div className="animate-fade-up block">
            <div className="text-[12px] font-medium tracking-[0.1em] uppercase text-text-passenger-faint mb-2.5">Question 07 — Optional</div>
            <div className="font-syne text-[20px] font-bold leading-[1.4] text-text-passenger mb-6">Is there anything you wish e-hailing apps would do that none of them currently do?</div>
            <textarea className="w-full py-[14px] px-4 border-[1.5px] border-border-purple rounded-[14px] bg-surface font-dm text-[14px] text-text-passenger resize-none outline-none transition-colors duration-150 focus:border-purple placeholder-text-passenger-faint" rows={5} placeholder="Share any ideas, frustrations, or wishes freely..." value={q7Text} onChange={(e) => setQ7Text(e.target.value)}></textarea>
            <div className="text-[12px] text-text-passenger-faint text-center mt-3">This field is optional. You can submit without answering.</div>
            <div className="flex justify-between items-center mt-7">
              <button className="py-3 px-[22px] border-[1.5px] border-border-purple rounded-[14px] bg-transparent font-dm text-[14px] font-medium text-text-passenger-muted cursor-pointer transition-all duration-150 hover:border-text-passenger-muted hover:text-text-passenger" onClick={() => goTo(6)}>← Back</button>
              <button className="py-3 px-7 border-none rounded-[14px] bg-purple font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 tracking-[0.02em] hover:bg-purple-dark disabled:bg-border-purple disabled:text-text-passenger-faint disabled:cursor-not-allowed" onClick={() => submitForm()}>Submit →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
