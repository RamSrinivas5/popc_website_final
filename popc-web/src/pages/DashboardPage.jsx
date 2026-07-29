import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, ClipboardCheck, Clock, AlertTriangle, ArrowRight, MessageSquare, ClipboardList } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

const RISK_COLORS = { Low: '#4CAF50', Moderate: '#FFC107', High: '#F44336' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.request('api/dashboard/'),
      api.request('api/surveys/completed/')
    ]).then(async ([statsData, surveysData]) => {
      const completedSurveys = Array.isArray(surveysData) ? surveysData : [];
      
      let localLow = 0;
      let localMod = 0;
      let localHigh = 0;
      let localHighRiskCardCount = 0;

      // Pre-fetch scores for completed surveys to correct risk level tags dynamically
      const detailPromises = completedSurveys.map(record =>
        api.request(`api/surveys/patient/${record.pk}/`)
          .then(survey => {
            const score = survey.total_score;
            if (score !== undefined && score !== null) {
              if (score <= 30) {
                localLow += 1;
                record.risk_level = 'Low';
              } else if (score <= 45) {
                localMod += 1;
                record.risk_level = 'Moderate';
              } else {
                localHigh += 1;
                localHighRiskCardCount += 1;
                record.risk_level = 'High';
              }
            } else {
              // Fallback
              const risk = (record.risk_level || 'low').toLowerCase();
              if (risk.includes('high')) {
                localHigh += 1;
                localHighRiskCardCount += 1;
              } else if (risk.includes('moderate')) {
                localMod += 1;
              } else {
                localLow += 1;
              }
            }
          })
          .catch(() => {
            const risk = (record.risk_level || 'low').toLowerCase();
            if (risk.includes('high')) {
              localHigh += 1;
              localHighRiskCardCount += 1;
            } else if (risk.includes('moderate')) {
              localMod += 1;
            } else {
              localLow += 1;
            }
          })
      );

      await Promise.all(detailPromises);

      const correctedStats = {
        ...statsData,
        stable: localLow,
        pending: localMod,
        high_risk: localHigh,
        high_risk_patients: localHighRiskCardCount
      };

      setStats(correctedStats);
      setRecentSurveys(completedSurveys.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Low Risk', value: stats.stable || 0, color: '#4CAF50' },
    { name: 'Moderate', value: stats.pending || 0, color: '#FFC107' },
    { name: 'High Risk', value: stats.high_risk || 0, color: '#F44336' },
  ].filter(d => d.value > 0) : [];

  const barData = stats ? [
    { name: 'Total', count: stats.total_patients ?? 0, color: 'var(--primary)' },
    { name: 'Surveyed', count: stats.total_surveyed ?? 0, color: 'var(--teal)' },
    { name: 'Pending', count: stats.pending_surveys ?? 0, color: 'var(--orange)' },
    { name: 'High Risk', count: stats.high_risk_patients ?? 0, color: 'var(--red)' },
  ] : [];

  const statCards = stats ? [
    { id: 'dash-total', icon: Users, label: 'Total Patients', value: stats.total_patients ?? 0, color: 'var(--primary)', clickable: false },
    { id: 'dash-surveyed', icon: ClipboardCheck, label: 'Surveyed', value: stats.total_surveyed ?? 0, color: 'var(--teal)', clickable: false },
    { id: 'dash-pending', icon: Clock, label: 'Pending Surveys', value: stats.pending_surveys ?? 0, color: 'var(--orange)', clickable: true, path: '/dashboard/pending' },
    { id: 'dash-high-risk', icon: AlertTriangle, label: 'High Risk Cases', value: stats.high_risk_patients ?? 0, color: 'var(--red)', clickable: true, path: '/dashboard/high-risk' },
  ] : [];

  return (
    <div className="animate-in">
      <PageHeader title="DASHBOARD" backPath="/home" showProfile />

      <div className="container" style={{ padding: '40px 24px' }}>
        {loading ? (
          <div className="spinner-center"><div className="spinner" /><span>Analyzing Clinical Data…</span></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                       {/* Upper Section: Stats + Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
              
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {statCards.map(card => (
                  <div
                    key={card.id}
                    id={card.id}
                    className={`card card-premium pop-in ${card.clickable ? 'clickable' : ''}`}
                    style={{ 
                      padding: '24px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 12,
                      borderLeft: `5px solid ${card.color}`,
                      cursor: card.clickable ? 'pointer' : 'default',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => card.clickable && navigate(card.path)}
                  >
                    <div style={{ color: card.color }}>
                      <card.icon size={24} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.label}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
                    {card.clickable && (
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: card.color, fontSize: '0.75rem', fontWeight: 700 }}>
                        VIEW LIST <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart Card */}
              <div className="card card-premium pop-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Risk Distribution</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time breakdown of surveyed cases.</p>
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 250 }}>
                  {pieData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      No analytical data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" cy="50%" 
                          innerRadius={70} 
                          outerRadius={95} 
                          paddingAngle={8} 
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                          itemStyle={{ fontWeight: 700, fontSize: '0.9rem' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bar Chart Card */}
              <div className="card card-premium pop-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Clinical Trends</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrative clinical overview.</p>
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 250 }}>
                  {barData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      No analytical data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9FF" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                          cursor={{ fill: 'rgba(51, 69, 204, 0.02)' }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Section: Recent Activity + Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
              
              {/* Recent Activity */}
              <div className="card card-premium pop-in" style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontWeight: 800 }}>Recent Assessments</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/surveys')}>View All</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentSurveys.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No recent activity recorded.</p>
                  ) : (
                    recentSurveys.map(item => (
                      <div 
                        key={item.pk} 
                        className="clickable" 
                        onClick={() => navigate(`/surveys/${item.pk}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 16, transition: 'all 0.2s' }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                          {item.name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patient ID: {item.id}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: item.risk_level === 'Low' ? 'var(--green)' : 'var(--orange)', background: '#fff', padding: '4px 10px', borderRadius: 8 }}>
                          {item.risk_level?.toUpperCase() || 'N/A'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card card-premium pop-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{ fontWeight: 800 }}>Clinical Support</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => navigate('/patients/add')} style={{ height: 56 }}>
                    <Users size={20} /> Register New Patient
                  </button>
                  <button className="btn btn-teal" onClick={() => navigate('/chat')} style={{ height: 56 }}>
                    <MessageSquare size={20} /> Consult PPC AI Assistant
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/surveys')} style={{ height: 56 }}>
                    <ClipboardList size={20} /> Review All Surveys
                  </button>
                </div>
                <div style={{ marginTop: 'auto', padding: 20, background: 'rgba(5, 150, 105, 0.05)', borderRadius: 16, border: '1px dashed var(--primary)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>
                    💡 Pro Tip: Use the AI Assistant to interpret complex ARISCAT results for high-risk patients.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
