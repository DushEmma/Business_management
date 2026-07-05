import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { checkPermission } from '../../utils/permissionUtils';
import Layout from '../Layout';
import AccessDenied from '../../pages/AccessDenied';

const ProtectedRoute = ({ children, allowedRoles, module, action = 'view' }) => {
    const { user } = useAuth();

    if (!user) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User's role is not in the allowed roles list
        // Superadmin should go to their dashboard, others see Access Denied
        if (user.role === 'superadmin') {
            return <Navigate to="/superadmin" replace />;
        }
        return (
            <Layout>
                <AccessDenied 
                    module={module || 'restricted'} 
                    action={action} 
                    deniedRole={allowedRoles.join(', ')} 
                />
            </Layout>
        );
    }

    if (module && !checkPermission(user, module, action)) {
        // User doesn't have permission for this specific module
        return (
            <Layout>
                <AccessDenied module={module} action={action} />
            </Layout>
        );
    }

    return children;
};

export default ProtectedRoute;
