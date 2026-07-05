import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Table } from 'react-bootstrap';
import { FiShield, FiAlertTriangle, FiArrowLeft, FiHome, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

// Session-level storage for access denial logs
const getAccessDenials = () => {
    try {
        return JSON.parse(sessionStorage.getItem('access_denials') || '[]');
    } catch { return []; }
};

const addAccessDenial = (module, action, route) => {
    const denials = getAccessDenials();
    denials.unshift({
        module,
        action,
        route,
        timestamp: new Date().toISOString()
    });
    // Keep last 50 entries
    sessionStorage.setItem('access_denials', JSON.stringify(denials.slice(0, 50)));
};

const moduleLabels = {
    dashboard: 'Dashboard',
    sales: 'Sales',
    pos: 'Point of Sale',
    invoices: 'Invoices',
    customers: 'Customers',
    inventory: 'Inventory',
    products: 'Products',
    warehouse: 'Warehouse',
    purchases: 'Purchases',
    suppliers: 'Suppliers',
    hr: 'Human Resources',
    employees: 'Employees',
    attendance: 'Attendance',
    leave: 'Leave Management',
    payroll: 'Payroll',
    expenses: 'Expenses',
    payments: 'Payments',
    projects: 'Projects',
    tasks: 'Tasks',
    documents: 'Documents',
    assets: 'Assets',
    reports: 'Reports',
    sales_reports: 'Sales Reports',
    inventory_reports: 'Inventory Reports',
    financial_reports: 'Financial Reports',
    settings: 'Settings',
    users: 'User Management',
    branches: 'Branches',
    returns: 'Returns',
};

const AccessDenied = ({ module, action, deniedRole }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [denials, setDenials] = useState([]);
    const moduleName = moduleLabels[module] || module || 'Unknown Module';

    useEffect(() => {
        // Log this denial
        if (module) {
            addAccessDenial(module, action, window.location.pathname);
        }
        setDenials(getAccessDenials());
    }, [module, action]);

    return (
        <Container fluid className="py-4">
            {/* Main Warning Banner */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderTop: '4px solid #dc3545' }}>
                <Card.Body className="text-center py-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                         style={{ width: '80px', height: '80px', background: 'rgba(220, 53, 69, 0.1)' }}>
                        <FiShield size={40} className="text-danger" />
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Access Denied</h2>
                    <p className="text-muted mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                        You do not have permission to access <strong className="text-danger">{moduleName}</strong>.
                        This access attempt has been logged.
                    </p>

                    <Alert variant="warning" className="d-inline-flex align-items-center gap-2 px-4">
                        <FiAlertTriangle size={18} />
                        <span>
                            <strong>Warning:</strong> Repeated unauthorized access attempts may be reported to your administrator.
                        </span>
                    </Alert>

                    <div className="mt-4">
                        <div className="text-muted small mb-3">
                            <FiClock className="me-1" />
                            Attempted at: <strong>{new Date().toLocaleString()}</strong>
                        </div>
                        <div className="text-muted small mb-3">
                            Your role: <span className="badge bg-secondary">{user?.role || 'Unknown'}</span>
                            {deniedRole && (
                                <span className="ms-2">
                                    Required: <span className="badge bg-danger">{deniedRole}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-3 justify-content-center mt-4">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate(-1)}
                            className="d-flex align-items-center gap-2"
                        >
                            <FiArrowLeft /> Go Back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/dashboard')}
                            className="d-flex align-items-center gap-2"
                        >
                            <FiHome /> Go to Dashboard
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Access Denial History */}
            {denials.length > 0 && (
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                        <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                            <FiAlertTriangle />
                            Unauthorized Access Attempts ({denials.length})
                        </h5>
                        <p className="text-muted small mb-0 mt-1">
                            These are all the modules you tried to access without permission during this session.
                            Your administrator can see these attempts.
                        </p>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">#</th>
                                        <th>Module</th>
                                        <th>Action</th>
                                        <th>Route</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {denials.map((denial, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 text-muted">{idx + 1}</td>
                                            <td>
                                                <span className="badge bg-danger fw-normal">
                                                    {moduleLabels[denial.module] || denial.module}
                                                </span>
                                            </td>
                                            <td className="text-capitalize">{denial.action || 'view'}</td>
                                            <td className="text-muted small font-monospace">{denial.route}</td>
                                            <td className="text-muted small">
                                                {new Date(denial.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default AccessDenied;
