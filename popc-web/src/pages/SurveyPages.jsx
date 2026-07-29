import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

const SURVEY_STEPS = [
  { label: 'Demographics', path: '/surveys/:patientId/demographics' },
  { label: 'History', path: '/surveys/:patientId/medical-history' },
  { label: 'Pre-op', path: '/surveys/:patientId/preoperative' },
  { label: 'Surgery', path: '/surveys/:patientId/surgery-factors' },
  { label: 'Anesthesia', path: '/surveys/:patientId/anesthesia' },
  { label: 'Post-op', path: '/surveys/:patientId/postoperative' },
];

function Stepper({ currentStep }) {
  return (
    <div className="stepper-wrap no-print" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '24px 0', maxWidth: 800, margin: '0 auto', gap: 8 
    }}>
      {SURVEY_STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isPast = idx < currentStep;
        return (
          <div key={step.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
              <div style={{ flex: 1, height: 4, background: idx === 0 ? 'transparent' : (isPast || isActive ? 'var(--primary)' : 'var(--border)'), borderRadius: 2 }} />
              <div style={{ 
                width: 24, height: 24, borderRadius: '50%', 
                background: isActive ? 'var(--primary)' : (isPast ? 'var(--primary)' : '#fff'),
                border: isActive ? 'none' : (isPast ? 'none' : '2px solid var(--border)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: (isActive || isPast) ? '#fff' : 'var(--text-muted)',
                fontSize: '0.7rem', fontWeight: 800
              }}>
                {isPast ? '✓' : idx + 1}
              </div>
              <div style={{ flex: 1, height: 4, background: idx === SURVEY_STEPS.length - 1 ? 'transparent' : (isPast ? 'var(--primary)' : 'var(--border)'), borderRadius: 2 }} />
            </div>
            <span style={{ 
              fontSize: '0.65rem', fontWeight: 800, 
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Reusable radio-section survey page */
export function SurveySection({ title, sections, nextPath, sectionName, statusKey, backPath, stepIndex }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-load saved answers
  useEffect(() => {
    api.request(`api/surveys/patient/${patientId}/`).then(data => {
      if (!data || !data.answers) return;
      const map = {};
      data.answers.forEach(a => { if (a.section_name === sectionName) map[a.question] = a.selected_option; });
      setSelections(map);
    }).catch(() => {});
  }, [patientId, sectionName]);

  const allAnswered = sections.every(s => selections[s.question]);

  async function handleSubmit() {
    if (!allAnswered) { setError('Please answer all questions before continuing.'); return; }
    setError(''); setSubmitting(true);
    try {
      let sectionTotal = 0;
      const answers = sections.map(s => {
        const option = selections[s.question];
        const score = s.scores[option] || 0;
        sectionTotal += score;
        return { question: s.question, selected_option: option, custom_text: null, score, section_name: sectionName };
      });
      const body = {
        patient_id: parseInt(patientId),
        total_score: sectionTotal,
        status: statusKey,
        risk_level: null,
        section_scores: [{ section_name: sectionName, score: sectionTotal }],
        answers,
      };
      await api.request('api/surveys/', { method: 'POST', body });
      navigate(nextPath.replace(':patientId', patientId));
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader 
        title={title} 
        backPath={backPath.replace(':patientId', patientId)} 
      />

      <Stepper currentStep={stepIndex} />

      <div className="container" style={{ padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {sections.map(s => (
              <div key={s.question} className="radio-section pop-in" style={{ padding: 24 }}>
                <div className="radio-section-title" style={{ fontSize: '1.05rem', marginBottom: 18, color: 'var(--text-primary)' }}>
                  {s.question}
                </div>
                <div className="radio-options" style={{ gap: 12 }}>
                  {s.options.map(opt => (
                    <div
                      key={opt}
                      className={`radio-option ${selections[s.question] === opt ? 'selected' : ''}`}
                      onClick={() => setSelections(prev => ({ ...prev, [s.question]: opt }))}
                      style={{ padding: '14px 18px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>{opt}</span>
                        {selections[s.question] === opt && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            id="survey-next-btn"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{ marginTop: 20, height: 56, fontSize: '1.1rem' }}
          >
            {submitting ? 'Saving...' : (
              <>
                Continue to Next Section
                <ChevronRight size={20} style={{ marginLeft: 8 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================== Section 1: Patient Demographics ======================== */
export function PatientDemographicsPage() {
  return <SurveySection
    title="Patient Demographics"
    sectionName="Patient Demographics"
    statusKey="patient_Demographics"
    backPath="/surveys/:patientId"
    nextPath="/surveys/:patientId/medical-history"
    stepIndex={0}
    sections={[
      { question: 'Age', options: ['Age<50', '50>Age<69', 'Age>69'], scores: { 'Age<50': 1, '50>Age<69': 2, 'Age>69': 3 } },
      { question: 'Sex', options: ['Male', 'Female', '0thers'], scores: { 'Male': 1, 'Female': 1, '0thers': 1 } },
      { question: 'Body Mass Index (BMI)', options: ['BMI<30', 'BMI>=30'], scores: { 'BMI<30': 1, 'BMI>=30': 2 } },
      { question: 'Smoking Status', options: ['Never', 'Current_smoker', 'Ex_smoker'], scores: { 'Never': 1, 'Ex_smoker': 2, 'Current_smoker': 3 } },
      { question: 'Alcohol', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
    ]}
  />;
}

/* ======================== Section 2: Medical History ======================== */
export function MedicalHistoryPage() {
  return <SurveySection
    title="Medical History"
    sectionName="Medical History"
    statusKey="medical_history"
    backPath="/surveys/:patientId/demographics"
    nextPath="/surveys/:patientId/preoperative"
    stepIndex={1}
    sections={[
      { question: 'COPD', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'Asthma', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'OSA', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'ILD', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'Heart Failure', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'CAD', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'Hypertension', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'Diabetes', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
      { question: 'CKD', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 0 } },
    ]}
  />;
}

/* ======================== Section 3: Preoperative Considerations ======================== */
export function PreoperativePage() {
  return <SurveySection
    title="Preoperative Considerations"
    sectionName="Preoperative Considerations"
    statusKey="preoperative_considerations"
    backPath="/surveys/:patientId/medical-history"
    nextPath="/surveys/:patientId/surgery-factors"
    stepIndex={2}
    sections={[
      { question: 'ASA Physical Status', options: ['I', 'II', 'III', 'IV', 'V'], scores: { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 } },
      { question: 'Exercise tolerance', options: ['>10 METs', '4-10 METs', '<4 METs'], scores: { '>10 METs': 1, '4-10 METs': 2, '<4 METs': 3 } },
      { question: 'Dyspnea at rest', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
      { question: 'Recent respiratory infection', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
      { question: 'SpO2', options: ['>=96%', '91-95%', '<=90%'], scores: { '>=96%': 1, '91-95%': 2, '<=90%': 3 } },
    ]}
  />;
}

/* ======================== Section 4: Surgery Factors ======================== */
export function SurgeryFactorsPage() {
  return <SurveySection
    title="Surgery Factors"
    sectionName="Surgery Factors"
    statusKey="surgery_Factors"
    backPath="/surveys/:patientId/preoperative"
    nextPath="/surveys/:patientId/anesthesia"
    stepIndex={3}
    sections={[
      { 
        question: 'Type of surgery', 
        options: ['Thoracic', 'Upper Abdominal', 'Lower Abdominal', 'Neurosurgery', 'Orthopedic', 'ENT / Head & Neck', 'Vascular / Cardiac', 'Others'], 
        scores: { 'Thoracic': 3, 'Upper Abdominal': 3, 'Vascular / Cardiac': 3, 'Neurosurgery': 3, 'Lower Abdominal': 2, 'Orthopedic': 2, 'ENT / Head & Neck': 2, 'Others': 1 } 
      },
      { question: 'Urgency', options: ['Elective', 'Emergency'], scores: { 'Elective': 1, 'Emergency': 3 } },
      { question: 'Duration', options: ['<2 hours', '2-4 hours', '>4 hours'], scores: { '<2 hours': 1, '2-4 hours': 2, '>4 hours': 3 } },
      { question: 'Estimated blood loss', options: ['<500 ml', '500-1000 ml', '>1000 ml'], scores: { '<500 ml': 1, '500-1000 ml': 2, '>1000 ml': 3 } },
    ]}
  />;
}

/* ======================== Section 5: Planned Anesthesia ======================== */
export function PlannedAnesthesiaPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sections = [
    { question: 'ARISCAT Choice', options: ['Regional', 'LMA', 'ETT', 'Combined'], scores: { 'Regional': 1, 'LMA': 2, 'ETT': 3, 'Combined': 4 } },
    { question: 'Ventilation Strategy', options: ['Low tidal volume', 'PEEP', 'None/Other'], scores: { 'Low tidal volume': 1, 'PEEP': 2, 'None/Other': 3 } },
    { question: 'Muscle relaxant use', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
    { question: 'Planned Analgesia', options: ['IV opioids', 'Non-opioid/Multimodal'], scores: { 'IV opioids': 2, 'Non-opioid/Multimodal': 1 } },
  ];

  // Additional conditional question
  const showReversal = selections['Muscle relaxant use'] === 'Yes';
  const reversalSection = { question: 'Reversal', options: ['Neostigmine', 'Sugammadex'], scores: { 'Sugammadex': 1, 'Neostigmine': 2 } };

  useEffect(() => {
    api.request(`api/surveys/patient/${patientId}/`).then(data => {
      if (!data || !data.answers) return;
      const map = {};
      data.answers.forEach(a => { if (a.section_name === 'Planned Anesthesia') map[a.question] = a.selected_option; });
      setSelections(map);
    }).catch(() => {});
  }, [patientId]);

  const allAnswered = sections.every(s => selections[s.question]) && (!showReversal || selections['Reversal']);

  async function handleSubmit() {
    if (!allAnswered) { setError('Please answer all questions before continuing.'); return; }
    setError(''); setSubmitting(true);
    try {
      let sectionTotal = 0;
      const answers = sections.map(s => {
        const option = selections[s.question];
        const score = s.scores[option] || 0;
        sectionTotal += score;
        return { question: s.question, selected_option: option, custom_text: null, score, section_name: 'Planned Anesthesia' };
      });

      if (showReversal) {
        const option = selections['Reversal'];
        const score = reversalSection.scores[option] || 0;
        sectionTotal += score;
        answers.push({ question: 'Reversal', selected_option: option, custom_text: null, score, section_name: 'Planned Anesthesia' });
      }

      await api.request('api/surveys/', { method: 'POST', body: {
        patient_id: parseInt(patientId),
        total_score: sectionTotal,
        status: 'planned_Anesthesia',
        risk_level: null,
        section_scores: [{ section_name: 'Planned Anesthesia', score: sectionTotal }],
        answers,
      }});
      navigate(`/surveys/${patientId}/postoperative`);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Planned Anesthesia" backPath={`/surveys/${patientId}/surgery-factors`} />
      
      <Stepper currentStep={4} />

      <div className="container" style={{ padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
          {error && <div className="alert alert-error">{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {sections.map(s => (
              <div key={s.question} className="radio-section pop-in" style={{ padding: 24 }}>
                <div className="radio-section-title" style={{ fontSize: '1.05rem', marginBottom: 18 }}>{s.question}</div>
                <div className="radio-options" style={{ gap: 12 }}>
                  {s.options.map(opt => (
                    <div
                      key={opt}
                      className={`radio-option ${selections[s.question] === opt ? 'selected' : ''}`}
                      onClick={() => setSelections(prev => ({ ...prev, [s.question]: opt }))}
                      style={{ padding: '14px 18px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>{opt}</span>
                        {selections[s.question] === opt && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {showReversal && (
              <div key="Reversal" className="radio-section pop-in" style={{ padding: 24, border: '2px solid var(--primary-light)' }}>
                <div className="radio-section-title" style={{ fontSize: '1.05rem', marginBottom: 18 }}>Reversal</div>
                <div className="radio-options" style={{ gap: 12 }}>
                  {reversalSection.options.map(opt => (
                    <div
                      key={opt}
                      className={`radio-option ${selections['Reversal'] === opt ? 'selected' : ''}`}
                      onClick={() => setSelections(prev => ({ ...prev, ['Reversal']: opt }))}
                      style={{ padding: '14px 18px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>{opt}</span>
                        {selections['Reversal'] === opt && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{ marginTop: 20, height: 56, fontSize: '1.1rem' }}
          >
            {submitting ? 'Saving...' : <>Continue to Next Section <ChevronRight size={20} style={{ marginLeft: 8 }} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================== Section 6: Postoperative ======================== */
export function PostoperativePage() {
  return <SurveySection
    title="Postoperative Care"
    sectionName="Postoperative"
    statusKey="postoperative"
    backPath="/surveys/:patientId/anesthesia"
    nextPath="/surveys/:patientId/score"
    stepIndex={5}
    sections={[
      { question: 'Planned ICU/HDU admission', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
      { question: 'Anticipated >24h ventilation', options: ['Yes', 'No'], scores: { 'Yes': 2, 'No': 1 } },
      { question: 'Post-op analgesia', options: ['Opioid heavy', 'Multimodal/Regional'], scores: { 'Opioid heavy': 2, 'Multimodal/Regional': 1 } },
      { question: 'Early mobilization within 24h', options: ['Yes', 'No'], scores: { 'Yes': 1, 'No': 2 } },
    ]}
  />;
}
