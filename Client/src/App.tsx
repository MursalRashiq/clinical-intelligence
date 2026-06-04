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
import AdminAppointments from './Pages/Admin/AppoinmentAdmin';
import RoleRoute from './Route/RoleRoute';
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
import DoctorProfilePage from './Pages/Doctor/DoctorProfile';
import ManageSlots from './Pages/Doctor/Slot';
import ClinicalRequests from './Pages/Doctor/AppointmentRequest';
import ClinicalAppointments from './Pages/Doctor/AppointmentListPage';
import Doctors from './Pages/Patients/Doctors';
import PatientDoctorDetails from './Pages/Patients/DoctorDetailsPage';
import BookAppointment from './Pages/Patients/AppointmentBookingPage';
import DoctorForgotPassword from './Pages/Doctor/ForgotPassword';
import DoctorForgotVerifyOtp from './Pages/Doctor/DoctorForgotVerifyOtp';
import DoctorResetPassword from './Pages/Doctor/DoctorResetPassword';
import AppointmentDetails from './Pages/Doctor/AppointmentDetailsPage';
import ErrorPage from './Pages/Patients/404'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/user/userSlice';
import { setDoctor } from './redux/doctor/doctorSlice';
import AuthService from './services/AuthService';

const TokenHandler: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            // To decode token we can just use AuthService.decodeToken if we make it public, or temporarily set it.
            // Let's decode manually or temporarily set it to patientToken so getCurrentUserInfo can read it.
            localStorage.setItem('patientToken', token);
            const decodedInfo = AuthService.getCurrentUserInfo();
            
            if (decodedInfo) {
                if (decodedInfo.role === 'doctor') {
                    localStorage.setItem('doctorToken', token);
                    localStorage.removeItem('patientToken');
                    dispatch(setDoctor(decodedInfo as any));
                } else if (decodedInfo.role === 'admin') {
                    localStorage.setItem('adminToken', token);
                    localStorage.removeItem('patientToken');
                } else {
                    dispatch(setUser(decodedInfo as any));
                }
            }

            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            url.searchParams.delete('user');

            if (window.location.pathname.includes('callback')) {
                // After Google OAuth callback → go to correct dashboard
                if (decodedInfo?.role === 'doctor') {
                    if ((decodedInfo as any)?.verificationStatus?.toLowerCase() !== 'approved') {
                        navigate(FRONTEND_ROUTES.DOCTOR_PENDING, { replace: true });
                    } else {
                        navigate(FRONTEND_ROUTES.DOCTOR_DASHBOARD, { replace: true });
                    }
                } else if (decodedInfo?.role === 'admin') {
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
                <Route path={FRONTEND_ROUTES.HOME} element={<RoleRoute allowedRoles={['patient', 'user']}><LandingPage /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTORS} element={<RoleRoute allowedRoles={['patient', 'user']}><Doctors /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_DETAILS} element={<RoleRoute allowedRoles={['patient', 'user']}><PatientDoctorDetails /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.APPOINTMENT_BOOKING} element={<RoleRoute allowedRoles={['patient', 'user']}><BookAppointment /></RoleRoute>} />

                {/* Patient Auth Routes */}
                <Route path={FRONTEND_ROUTES.REGISTER} element={<RoleRoute publicOnlyFor="patient"><Registration /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.LOGIN} element={<RoleRoute publicOnlyFor="patient"><Login /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.VERIFY_OTP} element={<RoleRoute publicOnlyFor="patient"><VerifyOtp /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.RESET_PASSWORD_LOGGED_IN} element={<RoleRoute allowedRoles={['patient', 'user']} requireAuth><ResetPassword /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.PATIENT_PROFILE} element={<RoleRoute allowedRoles={['patient', 'user']} requireAuth><PatientProfile /></RoleRoute>} />

                {/* Forgot Password Flow */}
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD} element={<RoleRoute publicOnlyFor="patient"><ForgotEmailPage /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_OTP} element={<RoleRoute publicOnlyFor="patient"><ForgotVerifyOtpPage /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.FORGOT_PASSWORD_RESET} element={<RoleRoute publicOnlyFor="patient"><ForgotPassword /></RoleRoute>} />

                {/* Doctor Auth Routes */}
                <Route path={FRONTEND_ROUTES.DOCTOR_REGISTER} element={<RoleRoute publicOnlyFor="doctor"><DoctorRegistration /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_LOGIN} element={<RoleRoute publicOnlyFor="doctor"><DoctorLogin /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_DASHBOARD} element={<RoleRoute allowedRoles={['doctor']} requireAuth requireDoctorApproval><DoctorDashboard /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_REQUESTS} element={<RoleRoute allowedRoles={['doctor']} requireAuth requireDoctorApproval><ClinicalRequests /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_APPOINTMENTS} element={<RoleRoute allowedRoles={['doctor']} requireAuth requireDoctorApproval><ClinicalAppointments /></RoleRoute>} />
                <Route path="/doctor/appointments/:appointmentId" element={<RoleRoute allowedRoles={['doctor']} requireAuth requireDoctorApproval><AppointmentDetails /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_PROFILE} element={<RoleRoute allowedRoles={['doctor']} requireAuth><DoctorProfilePage /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_SLOTS} element={<RoleRoute allowedRoles={['doctor']} requireAuth><ManageSlots /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_VERIFY_OTP} element={<DoctorOtp />} />
                <Route path={FRONTEND_ROUTES.DOCTOR_PENDING} element={<RoleRoute allowedRoles={['doctor']} requireAuth><PendingDoctorPage /></RoleRoute>} />

                {/* Doctor Forgot Password Flow */}
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD} element={<RoleRoute publicOnlyFor="doctor"><DoctorForgotPassword /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_OTP} element={<RoleRoute publicOnlyFor="doctor"><DoctorForgotVerifyOtp /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.DOCTOR_FORGOT_PASSWORD_RESET} element={<RoleRoute publicOnlyFor="doctor"><DoctorResetPassword /></RoleRoute>} />

                {/* Admin Auth Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_LOGIN} element={<RoleRoute publicOnlyFor="admin"><AdminLogin /></RoleRoute>} />

                {/* Admin Protected Routes */}
                <Route path={FRONTEND_ROUTES.ADMIN_DASHBOARD} element={<RoleRoute allowedRoles={['admin']} requireAuth><AdminDashboard /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_PATIENTS} element={<RoleRoute allowedRoles={['admin']} requireAuth><AdminPatients /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_APPOINTMENTS} element={<RoleRoute allowedRoles={['admin']} requireAuth><AdminAppointments /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTOR_REQUESTS} element={<RoleRoute allowedRoles={['admin']} requireAuth><DoctorRequestsList /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTORS} element={<RoleRoute allowedRoles={['admin']} requireAuth><ApprovedDoctorsListPage /></RoleRoute>} />
                <Route path="/admin/doctors/:id" element={<RoleRoute allowedRoles={['admin']} requireAuth><DoctorDetails /></RoleRoute>} />
                <Route path="/admin/doctor-requests/:id" element={<RoleRoute allowedRoles={['admin']} requireAuth><DoctorVerification /></RoleRoute>} />
                <Route path={FRONTEND_ROUTES.ADMIN_DOCTOR_VERIFICATION} element={<RoleRoute allowedRoles={['admin']} requireAuth><DoctorVerification /></RoleRoute>} />
                <Route path="/admin/patients/:id" element={<RoleRoute allowedRoles={['admin']} requireAuth><AdminPatients /></RoleRoute>} />

                {/* Fallback to home for now */}
                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </Router>
    );
}

export default App;
