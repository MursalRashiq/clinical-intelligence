import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { FRONTEND_ROUTES } from './utils/constants';
import LandingPage from './Pages/LandingPage';
import Registration from './Pages/Patients/Registration';
import Login from './Pages/Patients/Login';
import VerifyOtp from './Pages/Patients/Otp';
import ForgotPassword from './Pages/Patients/ForgotPassword';
import ForgotEmailPage from './Pages/Patients/FogotEmail';
import ForgotVerifyOtpPage from './Pages/Patients/ForgotVerifyOtp';
import AdminLogin from './Pages/Admin/Login';
import AdminDashboard from './Pages/Admin/Dashboard';
import AdminPatients from './Pages/Admin/PatientList';
import PublicRoute from './Route/PublicRoute';
import ProtectedRoute from './Route/ProtectedRoute';
import ResetPassword from './Pages/Patients/ResetPassword';
import PatientProfile from './Pages/Patients/PatientProfile';
import DoctorRegistration from './Pages/Doctor/RegistrationDoctor';
import DoctorDashboard from './Pages/Doctor/Dashboard';
import DoctorOtp from './Pages/Doctor/Otp';
import DoctorLogin from './Pages/Doctor/login';
import PendingDoctorPage from './Pages/Doctor/PendingDoctorPage';
import DoctorVerification from './Pages/Admin/DoctorVerification';
import DoctorRequestsList from './Pages/Admin/ReqeustedDoctorList';
import ApprovedDoctorsListPage from './Pages/Admin/DoctorsList';
import DoctorDetails from './Pages/Admin/Doctor';
import DoctorProtectedRoute from './Route/DoctorProtectedRoute';
import PatientRoute from './Route/PatientRoute';
import DoctorProfilePage from './Pages/Doctor/DoctorProfile';
import ManageSlots from './Pages/Doctor/Slot';
import Doctors from './Pages/Patients/Doctors';
import DoctorForgotPassword from './Pages/Doctor/ForgotPassword';
import DoctorForgotVerifyOtp from './Pages/Doctor/DoctorForgotVerifyOtp';
import DoctorResetPassword from './Pages/Doctor/DoctorResetPassword';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/user/userSlice';
import AuthService from './services/AuthService';

const TokenHandler: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            AuthService.saveToken(token);
            const userInfo = AuthService.getCurrentUserInfo();
            if (userInfo) {
                dispatch(setUser(userInfo as any));
            }
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            url.searchParams.delete('user');

            if (window.location.pathname.includes('callback')) {
                // After Google OAuth callback → go to correct dashboard
                if (userInfo?.role === 'doctor') {
                    if ((userInfo as any)?.verificationStatus?.toLowerCase() !== 'approved') {
                        navigate(FRONTEND_ROUTES.DOCTOR_PENDING, { replace: true });
                    } else {
                        navigate(FRONTEND_ROUTES.DOCTOR_DASHBOARD, { replace: true });
                    }
                } else if (userInfo?.role === 'admin') {
                    navigate(FRONTEND_ROUTES.ADMIN_DASHBOARD, { replace: true });
                } else {
                    navigate(FRONTEND_ROUTES.HOME, { replace: true });
                }
            } else {
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [dispatch, navigate]);

    return null;
};

const App: React.FC = () => {
    return (
        <Router>
            <TokenHandler />
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path={FRONTEND_ROUTES.HOME} element={<LandingPage />} />
                <Route path={FRONTEND_ROUTES.DOCTORS} element={<PatientRoute><Doctors /></PatientRoute>} />

                {/* Patient Auth Routes */}
                <Route path={FRONTEND_ROUTES.REGISTER} element={<PublicRoute roleScope="user"><Registration /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.LOGIN} element={<PublicRoute roleScope="user"><Login /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.VERIFY_OTP} element={<PublicRoute roleScope="user"><VerifyOtp /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.RESET_PASSWORD_LOGGED_IN} element={<PatientRoute requireAuth><ResetPassword /></PatientRoute>} />
                <Route path={FRONTEND_ROUTES.PATIENT_PROFILE} element={<PatientRoute requireAuth><PatientProfile /></PatientRoute>} />

                {/* Forgot Password Flow */}
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD} element={<PublicRoute roleScope="user"><ForgotEmailPage /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_OTP} element={<PublicRoute roleScope="user"><ForgotVerifyOtpPage /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_RESET} element={<PublicRoute roleScope="user"><ForgotPassword /></PublicRoute>} />

                {/* Doctor Auth Routes */}
                <Route path={FRONTEND_ROUTES.DOCTOR_REGISTER} element={<PublicRoute roleScope="doctor"><DoctorRegistration /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_LOGIN} element={<PublicRoute roleScope="doctor"><DoctorLogin /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_DASHBOARD} element={<DoctorProtectedRoute><DoctorDashboard /></DoctorProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_PROFILE} element={<DoctorProtectedRoute requireApproved={false}><DoctorProfilePage /></DoctorProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_SLOTS} element={<DoctorProtectedRoute requireApproved={false}><ManageSlots /></DoctorProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_VERIFY_OTP} element={<DoctorOtp />} />
                <Route path={FRONTEND_ROUTES.DOCTOR_PENDING} element={<DoctorProtectedRoute requireApproved={false}><PendingDoctorPage /></DoctorProtectedRoute>} />

                {/* Doctor Forgot Password Flow */}
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD} element={<PublicRoute roleScope="doctor"><DoctorForgotPassword /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_OTP} element={<PublicRoute roleScope="doctor"><DoctorForgotVerifyOtp /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_RESET} element={<PublicRoute roleScope="doctor"><DoctorResetPassword /></PublicRoute>} />

                {/* Admin Auth Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_LOGIN} element={<PublicRoute roleScope="admin"><AdminLogin /></PublicRoute>} />

                {/* Admin Protected Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_PATIENTS} element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS} element={<ProtectedRoute role="admin"><DoctorRequestsList /></ProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTORS} element={<ProtectedRoute role="admin"><ApprovedDoctorsListPage /></ProtectedRoute>} />
                <Route path="/admin/doctors/:id" element={<ProtectedRoute role="admin"><DoctorDetails /></ProtectedRoute>} />
                <Route path="/admin/doctor-requests/:id" element={<ProtectedRoute role="admin"><DoctorVerification /></ProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTOR_VERIFICATION} element={<ProtectedRoute role="admin"><DoctorVerification /></ProtectedRoute>} />
                <Route path="/admin/patients/:id" element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />

                {/* Fallback to home for now */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </Router>
    );
}

export default App;
