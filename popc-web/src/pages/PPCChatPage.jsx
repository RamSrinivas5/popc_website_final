import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User, Sparkles, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api/client';

export default function PPCChatPage() {
  const location = useLocation();
  const initialPid = location.state?.patientId || '';

  const [patients, setPatients] = useState([]);
  const [selectedPid, setSelectedPid] = useState(initialPid);
  const [messages, setMessages] = useState(() => {
    if (initialPid) {
      return [{ role: 'bot', text: `Hello! I'm your PPC Assistant. I'm ready to analyze records for Patient **${initialPid}**. What would you like to know?` }];
    } else {
      return [{ role: 'bot', text: `Welcome! Please enter the **Patient ID** (e.g., PID0001) so I can access their PPC risk data.` }];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef();

  useEffect(() => {
    api.request('patients/').then(d => {
      const data = Array.isArray(d) ? d : [];
      setPatients(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSelectPid(pid) {
    if (pid === selectedPid) return;
    setSelectedPid(pid);
    if (pid) {
      const matched = patients.find(p => p.patient_id === pid);
      const nameStr = matched ? ` (${matched.name})` : '';
      setMessages(m => [...m, { role: 'bot', text: `Switched context to Patient **${pid}**${nameStr}. Ask me anything about their risks.` }]);
    } else {
      setMessages(m => [...m, { role: 'bot', text: `Cleared clinical context. Please enter a Patient ID (e.g., PID0001) or select a patient from the dropdown.` }]);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // Check if input is a Patient ID format: PIDXXXX (case-insensitive)
    const pidPattern = /^pid\d{4}$/i;
    const isPidFormat = pidPattern.test(text);

    // 1. User message is always added first
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');

    // 2. Handling PID format context set/switch
    if (isPidFormat) {
      const targetPid = text.toUpperCase();
      const matched = patients.find(p => p.patient_id === targetPid);
      
      if (selectedPid === targetPid) {
        setMessages(m => [...m, { role: 'bot', text: `Context is already set to Patient **${targetPid}**. What would you like to know?` }]);
        return;
      }
      
      setSelectedPid(targetPid);
      if (matched) {
        setMessages(m => [...m, { role: 'bot', text: `Patient ID **${targetPid}** (${matched.name}) confirmed. Analyzing survey results... How can I help?` }]);
      } else {
        setMessages(m => [...m, { role: 'bot', text: `Patient ID **${targetPid}** confirmed (no local patient record found with this ID). Analyzing survey results... How can I help?` }]);
      }
      return;
    }

    // 3. If no patient ID is set, reject and prompt for PID
    if (!selectedPid) {
      setMessages(m => [...m, { role: 'bot', text: 'I need a valid Patient ID to continue. Please enter it in the format: **PID0001**.' }]);
      return;
    }

    // 4. Send question to backend API
    setSending(true);
    try {
      const data = await api.request('api/ppc-qwen-chat/', {
        method: 'POST',
        body: { 
          patient_id: selectedPid,
          question: text 
        },
        isChat: true,
      });
      const reply = data.answer || data.response || 'I have analyzed the clinical data, but I cannot provide a specific recommendation at this time.';
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      let errorMsg = err.message || 'The AI service is currently unavailable.';
      if (errorMsg.includes('Medical data missing')) {
        errorMsg = `⚠️ Clinical data is missing for this patient (ID: ${selectedPid}). Please complete and submit the risk assessment survey before consulting the AI assistant.`;
      }
      setMessages(m => [...m, { role: 'bot', text: errorMsg }]);
    } finally {
      setSending(false);
    }
  }

  const demoChips = patients.slice(0, 3).map(p => `Select ${p.patient_id}`);
  const clinicalChips = [
    "Key Pulmonary Risks",
    "Postoperative Care Plan",
    "Lung Expansion Guidelines",
    "ARISCAT Risk Score Summary"
  ];
  const activeChips = selectedPid ? clinicalChips : (demoChips.length > 0 ? demoChips : ["Select PID0001", "Select PID0002"]);

  async function handleChipClick(text) {
    if (sending) return;
    
    // If it's a patient selection chip
    if (text.startsWith("Select ")) {
      const pid = text.replace("Select ", "");
      handleSelectPid(pid);
      return;
    }
    
    if (!selectedPid) {
      setMessages(m => [...m, { role: 'user', text }, { role: 'bot', text: 'I need a valid Patient ID to continue. Please select a patient first.' }]);
      return;
    }

    setMessages(m => [...m, { role: 'user', text }]);
    setSending(true);
    try {
      const data = await api.request('api/ppc-qwen-chat/', {
        method: 'POST',
        body: { 
          patient_id: selectedPid,
          question: text 
        },
        isChat: true,
      });
      const reply = data.answer || data.response || 'I have analyzed the clinical data, but I cannot provide a specific recommendation at this time.';
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch (err) {
      let errorMsg = err.message || 'The AI service is currently unavailable.';
      if (errorMsg.includes('Medical data missing')) {
        errorMsg = `⚠️ Clinical data is missing for this patient (ID: ${selectedPid}). Please complete and submit the risk assessment survey before consulting the AI assistant.`;
      }
      setMessages(m => [...m, { role: 'bot', text: errorMsg }]);
    } finally {
      setSending(false);
    }
  }

  const selectedPatient = patients.find(p => p.patient_id === selectedPid);

  return (
    <div className="chat-page-container">
      <PageHeader title="PPC AI ASSISTANT" backPath="/home" showProfile />

      <div className="chat-main-wrapper">
        {/* Patient Selector Header */}
        <div className="chat-context-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span className="context-label">CLINICAL CONTEXT:</span>
          </div>
          <select 
            value={selectedPid} 
            onChange={e => handleSelectPid(e.target.value)}
            className="chat-patient-select"
          >
            <option value="">Select Patient...</option>
            {patients.map(p => (
              <option key={p.id} value={p.patient_id}>{p.name} (ID: {p.patient_id})</option>
            ))}
          </select>
          {selectedPatient && (
            <div className="active-context-tag">
              <div className="status-dot" />
              <span>{selectedPatient.name}</span>
            </div>
          )}
        </div>

        <div ref={messagesContainerRef} className="chat-messages-container">
          <div className="chat-messages-inner">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className="chat-avatar">
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="chat-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <div className="chat-bubble thinking">
                  <div className="spinner-xs" />
                  <span>Analyzing clinical data...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-wrapper">
          <div className="chat-chips-container">
            {activeChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className={`chat-chip ${chip.startsWith('Select ') ? 'demo' : ''}`}
                onClick={() => handleChipClick(chip)}
                disabled={sending}
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              id="chat-input"
              placeholder={selectedPid ? "Ask about risk factors or recommendations..." : "Type Patient ID (e.g. PID0001) or select above..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
              className="chat-input-field"
            />
            <button 
              id="chat-send-btn" 
              type="submit" 
              className="chat-send-btn"
              disabled={!input.trim() || sending}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="chat-footer-note">
            <ShieldCheck size={14} /> 
            <span>SECURE CLINICAL AI PROCESSING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
