import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isTokenExpired } from '@/utils/authUtils';
import { toast } from 'sonner';

interface RoleRouteProps {
    allowedRoles: string[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const role = localStorage.getItem('role');
    const accessToken = localStorage.getItem('accessToken');
    const location = useLocation();

    if (!accessToken || isTokenExpired(accessToken)) {
        if (accessToken) {
            // Token existed but expired
            localStorage.clear();
            toast.error("Session expired. Please login again.");
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on actual role
        if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
