import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path={FRONTEND_ROUTES.HOME} element={<LandingPage />} />
                
                {/* Patient Auth Routes */}
                <Route path={FRONTEND_ROUTES.REGISTER} element={<PublicRoute roleScope="user"><Registration /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.LOGIN} element={<PublicRoute roleScope="user"><Login /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.VERIFY_OTP} element={<PublicRoute roleScope="user"><VerifyOtp /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.RESET_PASSWORD_LOGGED_IN} element={<ProtectedRoute role="patient"><ResetPassword /></ProtectedRoute>} />
                
                {/* Forgot Password Flow */}
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD} element={<PublicRoute roleScope="user"><ForgotEmailPage /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_OTP} element={<PublicRoute roleScope="user"><ForgotVerifyOtpPage /></PublicRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_RESET} element={<PublicRoute roleScope="user"><ForgotPassword /></PublicRoute>} />
                
                {/* Admin Auth Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_LOGIN} element={<PublicRoute roleScope="admin"><AdminLogin /></PublicRoute>} />
                
                {/* Admin Protected Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_PATIENTS} element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />
                <Route path="/admin/patients/:id" element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />

                {/* Fallback to home for now */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </Router>
    );
}

export default App;
