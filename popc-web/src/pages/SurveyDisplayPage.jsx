import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, Download, Edit3, ChevronRight, AlertCircle, CheckCircle, 
  User, History, Briefcase, Activity, ShieldAlert, Clipboard, HelpCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

function getRiskLevel(score) {
  if (score <= 30) return 'Low Risk';
  if (score <= 45) return 'Moderate';
  if (score <= 60) return 'High';
  return 'Very High';
}

function getRiskAdvice(score) {
  if (score <= 30) return 'Standard anesthesia protocol recommended. Routine intraoperative monitoring is sufficient. No additional pulmonary consult required unless clinical status changes.';
  if (score <= 45) return 'Lung-protective ventilation, multimodal analgesia, encourage early mobilization.';
  if (score <= 60) return 'Prefer regional if feasible, strict lung-protective strategy, consider postoperative ICU/HDU.';
  return 'Strongly consider avoiding GA/ETT if possible, optimize comorbidities pre-op, mandatory ICU planning.';
}

function getRiskColor(score) {
  if (score <= 30) return '#E8F5E9'; // Light Green (matches iOS green)
  if (score <= 45) return '#FFF9C4'; // Light Yellow
  if (score <= 60) return '#FFE0B2'; // Light Orange
  return '#FFEBEE'; // Light Red
}

function getRiskTextColor(score) {
  if (score <= 30) return '#1B5E20';
  if (score <= 45) return '#F57F17';
  if (score <= 60) return '#E65100';
  return '#C62828';
}

const SECTION_ICONS = {
  'Patient Demographics': User,
  'Medical History': History,
  'Surgery Factors': Briefcase,
  'Preoperative Considerations': Activity,
  'Postoperative': FileText,
  'Planned Anesthesia': ShieldAlert
};

function RiskBarSegment({ title, range, active, color }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: active ? color : 'var(--text-muted)', opacity: active ? 1 : 0.4 }}>{title}</span>
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{range}</span>
      <div style={{ width: '100%', height: 6, background: active ? color : 'var(--border)', borderRadius: 3 }} />
    </div>
  );
}

export default function SurveyDisplayPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.request(`api/surveys/patient/${patientId}/`).then(setSurvey).catch(() => {}).finally(() => setLoading(false));
  }, [patientId]);

  const score = survey?.total_score || 0;
  const riskLevel = getRiskLevel(score);
  const riskColor = getRiskColor(score);
  const riskTextColor = getRiskTextColor(score);

  const handlePrint = () => {
    window.print();
  };

  // Group answers by section for detailed breakdown
  const groupedAnswers = (survey?.answers || []).reduce((acc, ans) => {
    const sec = ans.section_name || 'General';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(ans);
    return acc;
  }, {});

  return (
    <div className="animate-in">
      <div className="no-print">
        <PageHeader title="ASSESSMENT SUMMARY" backPath="/surveys" />
      </div>

      <div className="container" style={{ padding: '24px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
          
          {loading ? (
            <div className="spinner-center"><div className="spinner" /></div>
          ) : !survey ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h2 style={{ fontWeight: 800 }}>No Survey Found</h2>
              <button className="btn btn-primary mt-4" onClick={() => navigate(`/surveys/${patientId}/demographics`)}>Start Survey</button>
            </div>
          ) : (
            <>
              {/* Report Header (Print only) */}
              <div className="print-only" style={{ marginBottom: 32, borderBottom: '2px solid var(--primary)', paddingBottom: 16 }}>
                <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 800 }}>POPC CLINICAL ASSESSMENT REPORT</h1>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Patient ID: {patientId} | Date: {new Date(survey.created_at).toLocaleDateString()}</p>
              </div>

              {/* Top Score Card */}
              <div className="pop-in" style={{ 
                background: 'var(--primary-gradient)', 
                borderRadius: 30, 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#fff',
                boxShadow: '0 20px 40px rgba(51,69,204,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>TOTAL ARISCAT SCORE</div>
                <div style={{ fontSize: '5.5rem', fontWeight: 800, lineHeight: 1 }}>{score}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 100, marginTop: 20 }}>
                  <CheckCircle size={14} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assessment Complete</span>
                </div>
              </div>

              {/* Risk Level Card */}
              <div className="card" style={{ padding: 24, borderRadius: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>CLINICAL RISK LEVEL</span>
                  <div style={{ padding: '6px 14px', background: riskColor, color: riskTextColor, borderRadius: 16, fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} />
                    {riskLevel.toUpperCase()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <RiskBarSegment title="LOW" range="0-30" color="#4CAF50" active={score <= 30} />
                  <RiskBarSegment title="MOD" range="31-45" color="#FFC107" active={score > 30 && score <= 45} />
                  <RiskBarSegment title="HIGH" range="46-60" color="#FF9800" active={score > 45 && score <= 60} />
                  <RiskBarSegment title="V.HIGH" range="> 60" color="#F44336" active={score > 60} />
                </div>
              </div>

              {/* Management Guidance */}
              <div className="card" style={{ padding: 24, borderRadius: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Clipboard size={20} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>MANAGEMENT GUIDANCE</span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                  {getRiskAdvice(score)}
                </p>
              </div>

              {/* Section Breakdown (Summary) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="no-print">
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: 8 }}>SECTIONAL BREAKDOWN</div>
                {(survey.section_scores || []).map(sec => {
                  const Icon = SECTION_ICONS[sec.section_name] || FileText;
                  return (
                    <div key={sec.section_name} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderRadius: 20 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Icon size={18} />
                      </div>
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{sec.section_name}</span>
                      <div style={{ padding: '6px 16px', background: 'rgba(5, 150, 105, 0.05)', borderRadius: 16, fontWeight: 800, color: 'var(--primary)', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                        {sec.score}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Answers (Visible in Print or on scroll) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: 8 }}>DETAILED CLINICAL ANSWERS</div>
                {Object.keys(groupedAnswers).map(sectionTitle => (
                  <div key={sectionTitle} className="card" style={{ padding: 24, borderRadius: 24 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                      {sectionTitle.toUpperCase()}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {groupedAnswers[sectionTitle].map((ans, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{ans.question}</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>{ans.selected_option}</div>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(5, 150, 105, 0.05)', padding: '4px 8px', borderRadius: 6 }}>
                            +{ans.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20 }}>
                <button className="btn btn-outline" style={{ height: 50 }} onClick={() => navigate('/surveys')}>Done</button>
                <button className="btn btn-teal" style={{ height: 50 }} onClick={handlePrint}>
                  <Download size={18} style={{ marginRight: 8 }} />
                  Print Report
                </button>
                <button className="btn btn-primary" style={{ height: 50 }} onClick={() => navigate(`/surveys/${patientId}/demographics`)}>
                  <Edit3 size={18} style={{ marginRight: 8 }} />
                  Recalculate
                </button>
              </div>

              {/* Print Footer */}
              <div className="print-only" style={{ marginTop: 60, textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  This report was generated by the POPC Clinical Portal. 
                  Digital copy available at clinical-portal.popc.health
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

