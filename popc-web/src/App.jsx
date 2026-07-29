import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthenticatedLayout from './components/AuthenticatedLayout';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Home & Profile
import DoctorHomePage from './pages/DoctorHomePage';
import ProfilePage from './pages/ProfilePage';

// Patients
import PatientManagementPage from './pages/PatientManagementPage';
import ViewPatientListPage from './pages/ViewPatientListPage';
import AddPatientPage from './pages/AddPatientPage';
import ViewPatientPage from './pages/ViewPatientPage';
import EditPatientPage from './pages/EditPatientPage';
import DeletePatientPage from './pages/DeletePatientPage';

// Surveys
import SurveyListPage from './pages/SurveyListPage';
import SurveyDisplayPage from './pages/SurveyDisplayPage';
import {
  PatientDemographicsPage,
  MedicalHistoryPage,
  SurgeryFactorsPage,
  PreoperativePage,
  PostoperativePage,
  PlannedAnesthesiaPage,
} from './pages/SurveyPages';

// Dashboard
import DashboardPage from './pages/DashboardPage';
import { PendingSurveysPage, HighRiskListPage } from './pages/DashboardListPages';

// Chat
import PPCChatPage from './pages/PPCChatPage';

// Settings
import SettingsPage from './pages/SettingsPage';
import { ChangePasswordPage, ChangeUsernamePage, DeleteAccountPage } from './pages/SettingsSubPages';

// Info
import AppInfoPage from './pages/AppInfoPage';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes with Layout */}
          <Route element={<Protected><AuthenticatedLayout /></Protected>}>
            <Route path="/home" element={<DoctorHomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route path="/patients" element={<PatientManagementPage />} />
            <Route path="/patients/list" element={<ViewPatientListPage />} />
            <Route path="/patients/add" element={<AddPatientPage />} />
            <Route path="/patients/:id" element={<ViewPatientPage />} />
            <Route path="/patients/:id/edit" element={<EditPatientPage />} />
            <Route path="/patients/:id/delete" element={<DeletePatientPage />} />

            <Route path="/surveys" element={<SurveyListPage />} />
            <Route path="/surveys/:patientId" element={<SurveyDisplayPage />} />
            <Route path="/surveys/:patientId/demographics" element={<PatientDemographicsPage />} />
            <Route path="/surveys/:patientId/medical-history" element={<MedicalHistoryPage />} />
            <Route path="/surveys/:patientId/surgery-factors" element={<SurgeryFactorsPage />} />
            <Route path="/surveys/:patientId/preoperative" element={<PreoperativePage />} />
            <Route path="/surveys/:patientId/postoperative" element={<PostoperativePage />} />
            <Route path="/surveys/:patientId/anesthesia" element={<PlannedAnesthesiaPage />} />
            <Route path="/surveys/:patientId/score" element={<SurveyDisplayPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/pending" element={<PendingSurveysPage />} />
            <Route path="/dashboard/high-risk" element={<HighRiskListPage />} />

            <Route path="/chat" element={<PPCChatPage />} />

            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings/change-username" element={<ChangeUsernamePage />} />
            <Route path="/settings/delete-account" element={<DeleteAccountPage />} />

            <Route path="/info" element={<AppInfoPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
