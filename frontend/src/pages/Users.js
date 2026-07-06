import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiShield, FiEdit, FiUserX, FiLock, FiUnlock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../services/api';
import DialogService from '../components/Dialog/DialogService';
import { usePermissions } from '../utils/permissionUtils';

const Users = () => {
    const { isAdmin } = usePermissions();
    
    // Shared state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // ==========================================
    // USERS & ROLES STATE & FUNCTIONS
    // ==========================================
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'staff',
        password: '',
        is_active: true,
        permissions: {}
    });

    const roleOptions = [
        { value: 'admin', label: 'Admin', description: 'Full access to manage business', color: 'danger' },
        { value: 'manager', label: 'Manager', description: 'Can manage team and resources', color: 'warning' },
        { value: 'staff', label: 'Staff', description: 'Basic access based on permissions', color: 'success' }
    ];

    const getDefaultRolePermissions = () => ({
        admin: {},
        manager: {
            dashboard: ['all'], sales: ['all'], pos: ['all'], invoices: ['all'],
            customers: ['view', 'create', 'edit'], inventory: ['view', 'create', 'edit'],
            products: ['view', 'create', 'edit'], warehouse: ['view'],
            purchases: ['view', 'create', 'edit'], suppliers: ['view', 'create'],
            hr: ['view'], employees: ['view'], attendance: ['view', 'create', 'edit'],
            leave: ['view', 'edit', 'approve'], payroll: ['view'], expenses: ['all'],
            payments: ['view', 'create'], taxes: ['view'], projects: ['all'], tasks: ['all'],
            documents: ['view', 'create', 'edit'], assets: ['view'], reports: ['view', 'export'],
            sales_reports: ['view', 'export'], inventory_reports: ['view', 'export'],
            financial_reports: ['view'], settings: ['view'], users: ['view'], leads: ['all'],
            services: ['view', 'create', 'edit'], returns: ['view', 'create', 'edit', 'approve']
        },
        staff: {
            dashboard: ['view'], sales: ['view', 'create'], pos: ['view', 'create'],
            invoices: ['view', 'create'], customers: ['view'], inventory: ['view'],
            products: ['view'], warehouse: ['view'], purchases: ['view'], suppliers: ['view'],
            hr: ['view'], employees: ['view'], attendance: ['view', 'create'],
            leave: ['view', 'create'], payroll: ['view'], expenses: ['view', 'create'],
            payments: ['view', 'create'], taxes: ['view'], projects: ['view'], tasks: ['view', 'create', 'edit'],
            documents: ['view', 'create'], assets: ['view'], reports: ['view'], leads: ['view', 'create'],
            services: ['view', 'create'], returns: ['view']
        }
    });

    // ==========================================
    // PERMISSIONS STATE & FUNCTIONS
    // ==========================================
    const [permissions, setPermissions] = useState([]);
    const [showCreatePermModal, setShowCreatePermModal] = useState(false);
    const [showEditPermModal, setShowEditPermModal] = useState(false);
    const [currentPermission, setCurrentPermission] = useState(null);
    const [bulkModules, setBulkModules] = useState([]);
    const [permissionData, setPermissionData] = useState({
        user_id: '',
        module: '',
        permissions: ['view'],
        granted: true
    });

    const modules = [
        { value: 'dashboard', label: 'Dashboard' }, { value: 'sales', label: 'Sales' },
        { value: 'pos', label: 'Point of Sale' }, { value: 'invoices', label: 'Invoices' },
        { value: 'customers', label: 'Customers' }, { value: 'inventory', label: 'Inventory' },
        { value: 'products', label: 'Products' }, { value: 'warehouse', label: 'Warehouse' },
        { value: 'purchases', label: 'Purchases' }, { value: 'suppliers', label: 'Suppliers' },
        { value: 'hr', label: 'Human Resources' }, { value: 'employees', label: 'Employees' },
        { value: 'attendance', label: 'Attendance' }, { value: 'leave', label: 'Leave Management' },
        { value: 'payroll', label: 'Payroll' }, { value: 'expenses', label: 'Expenses' },
        { value: 'payments', label: 'Payments' }, { value: 'projects', label: 'Projects' },
        { value: 'tasks', label: 'Tasks' }, { value: 'documents', label: 'Documents' },
        { value: 'assets', label: 'Assets' }, { value: 'reports', label: 'Reports' },
        { value: 'sales_reports', label: 'Sales Reports' }, { value: 'inventory_reports', label: 'Inventory Reports' },
        { value: 'financial_reports', label: 'Financial Reports' }, { value: 'settings', label: 'Settings' },
        { value: 'users', label: 'User Management' }, { value: 'branches', label: 'Branches' },
        { value: 'leads', label: 'Leads' }, { value: 'returns', label: 'Returns' }
    ];

    const permissionsList = [
        { value: 'view', label: 'View Only' }, { value: 'create', label: 'Create' },
        { value: 'edit', label: 'Edit' }, { value: 'delete', label: 'Delete' },
        { value: 'export', label: 'Export' }, { value: 'approve', label: 'Approve' },
        { value: 'all', label: 'Full Access (Admin)' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, permissionsRes] = await Promise.all([
                settingsAPI.getUsers(),
                settingsAPI.getPermissions()
            ]);
            setUsers(usersRes.data.users || []);
            setPermissions(permissionsRes.data.permissions || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // User Functions
    const handleOpenUserModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            let perms = user.permissions || {};
            if (Array.isArray(user.permissions)) {
                perms = {};
                user.permissions.forEach(perm => { perms[perm] = ['view']; });
            }
            setUserFormData({
                username: user.username || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                role: user.role || 'staff',
                password: '',
                is_active: user.is_active !== false,
                permissions: perms
            });
        } else {
            setCurrentUser(null);
            setUserFormData({
                username: '', email: '', first_name: '', last_name: '',
                phone: '', role: 'staff', password: '', is_active: true, permissions: {}
            });
        }
        setShowUserModal(true);
    };

    const handleRoleChange = (role) => {
        setUserFormData(prev => {
            const newData = { ...prev, role };
            const roleDefaults = getDefaultRolePermissions();
            if (roleDefaults[role]) newData.permissions = { ...roleDefaults[role] };
            return newData;
        });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (userFormData.password && userFormData.password.length < 6) {
                toast.error('Password must be at least 6 characters long');
                setSaving(false); return;
            }
            const userData = { ...userFormData };
            if (!userData.password) delete userData.password;

            if (currentUser) {
                await settingsAPI.updateUser(currentUser.id, userData);
                toast.success('User updated successfully');
            } else {
                await settingsAPI.createUser(userData);
                toast.success('User added successfully');
            }
            fetchData();
            setShowUserModal(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        const isActivating = !user.is_active;
        try {
            const confirmed = await DialogService.confirm({
                title: `${isActivating ? 'Activate' : 'Deactivate'} User`,
                message: `Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} this user?`,
                type: isActivating ? 'info' : 'warning',
                confirmText: isActivating ? 'Activate' : 'Deactivate',
                cancelText: 'Cancel'
            });
            if (confirmed) {
                await settingsAPI.updateUser(user.id, { is_active: isActivating });
                setUsers(users.map(u => u.id === user.id ? { ...u, is_active: isActivating } : u));
                toast.success(`User ${isActivating ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (err) {
            toast.error(`Failed to ${isActivating ? 'activate' : 'deactivate'} user`);
        }
    };

    const handleToggleUserLock = async (user) => {
        const isLocking = !user.is_locked;
        try {
            const confirmed = await DialogService.confirm({
                title: `${isLocking ? 'Lock' : 'Unlock'} User`,
                message: `Are you sure you want to ${isLocking ? 'lock' : 'unlock'} this user?`,
                type: isLocking ? 'danger' : 'info',
                confirmText: isLocking ? 'Lock Account' : 'Unlock Account',
                cancelText: 'Cancel'
            });
            if (confirmed) {
                await settingsAPI.updateUser(user.id, { is_locked: isLocking });
                setUsers(users.map(u => u.id === user.id ? { ...u, is_locked: isLocking } : u));
                toast.success(`User ${isLocking ? 'locked' : 'unlocked'} successfully`);
            }
        } catch (err) {
            toast.error(`Failed to ${isLocking ? 'lock' : 'unlock'} user`);
        }
    };

    const handleDeleteUser = async (user) => {
        try {
            const confirmed = await DialogService.confirm({
                title: 'Delete User',
                message: 'Are you sure you want to permanently delete this user? This cannot be undone.',
                type: 'danger',
                confirmText: 'Delete Permanently',
                cancelText: 'Cancel'
            });
            if (confirmed) {
                await settingsAPI.deleteUser(user.id);
                setUsers(users.filter(u => u.id !== user.id));
                toast.success('User deleted permanently');
            }
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadge = (role) => {
        const colors = { admin: 'danger', manager: 'warning', staff: 'success' };
        return colors[role] || 'secondary';
    };

    const getPermissionSummary = (userPerms) => {
        if (!userPerms || Object.keys(userPerms).length === 0) return 'No access';
        const moduleCount = Object.keys(userPerms).length;
        const fullAccess = Object.values(userPerms).some(p => p.includes('all'));
        return fullAccess ? 'Full Access' : `${moduleCount} module${moduleCount > 1 ? 's' : ''}`;
    };

    // Bulk Permissions Functions
    const toggleBulkPermission = (permValue) => {
        setPermissionData(prev => {
            const newPermissions = prev.permissions.includes(permValue)
                ? prev.permissions.filter(p => p !== permValue)
                : [...prev.permissions, permValue];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleCreatePermSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!permissionData.user_id || !permissionData.module || permissionData.permissions.length === 0) {
                toast.error('Please fill all fields and select at least one permission');
                return;
            }
            await settingsAPI.createPermission(permissionData);
            toast.success('Permission granted successfully');
            setShowCreatePermModal(false);
            setPermissionData({ user_id: '', module: '', permissions: ['view'], granted: true });
            fetchData();
        } catch (err) {
            toast.error('Failed to grant permission');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePerm = async (id, updateData) => {
        try {
            await settingsAPI.updatePermission(id, updateData);
            toast.success('Permission updated successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to update permission');
        }
    };

    const handleDeletePerm = async (id) => {
        try {
            const confirmed = await DialogService.confirm({
                title: 'Delete Permission',
                message: 'Are you sure you want to remove this permission? The user will lose access to this module.',
                type: 'danger',
                confirmText: 'Delete Permission',
                cancelText: 'Cancel'
            });
            if (confirmed) {
                await settingsAPI.deletePermission(id);
                toast.success('Permission deleted successfully');
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to delete permission');
        }
    };

    const handleEditPerm = (permission) => {
        setCurrentPermission(permission);
        setPermissionData({
            user_id: permission.user_id,
            module: permission.module,
            permissions: permission.permissions || [],
            granted: permission.granted
        });
        setShowEditPermModal(true);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === userId) || { username: 'Unknown User' };
    };

    if (loading) {
        return (
            <Container fluid className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">User Management</h2>
                    <p className="text-muted mb-0">Manage your team members and their access permissions in one place</p>
                </div>
                <div className="d-flex gap-2 mt-3 mt-md-0">
                    {isAdmin && (
                        <Button variant="primary" onClick={() => handleOpenUserModal()}>
                            <FiPlus className="me-2" /> Add User
                        </Button>
                    )}
                </div>
            </div>

            {error && <Alert variant="warning">{error}</Alert>}
            
            {!isAdmin ? (
                <Alert variant="warning" className="mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="text-center mb-4">
                        <i className="bi bi-people" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    </div>
                    <h4 className="text-center mb-3">
                        <i className="bi bi-shield-exclamation-triangle me-2"></i>
                        Access Denied
                    </h4>
                    <p className="text-center">You don&apos;t have permission to manage users.</p>
                </Alert>
            ) : (
                <Tabs defaultActiveKey="users" id="user-management-tabs" className="mb-4">
                    {/* USERS TAB */}
                    <Tab eventKey="users" title={<span><FiUser className="me-2"/>Users & Roles</span>}>
                        <Card className="border-0 shadow-sm mt-3">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 border-0">User</th>
                                                <th className="border-0">Email</th>
                                                <th className="border-0">Role</th>
                                                <th className="border-0">Permissions</th>
                                                <th className="border-0">Status</th>
                                                <th className="border-0">Lock</th>
                                                <th className="pe-4 border-0 text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-5">
                                                        <FiUser size={48} className="text-muted mb-3" />
                                                        <h6 className="fw-bold">No users yet</h6>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map(user => (
                                                    <tr key={user.id}>
                                                        <td className="ps-4">
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar-circle bg-primary text-white me-2 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', borderRadius: '50%', fontWeight: '600'}}>
                                                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold">{user.first_name} {user.last_name}</div>
                                                                    <div className="small text-muted">@{user.username}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <Badge bg={getRoleBadge(user.role)} className="text-capitalize">
                                                                {user.role}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <span className="small">{getPermissionSummary(user.permissions)}</span>
                                                        </td>
                                                        <td>
                                                            <Badge bg={user.is_active ? 'success' : 'secondary'}>
                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg={user.is_locked ? 'danger' : 'light'} text={user.is_locked ? 'white' : 'dark'} className="border fw-normal">
                                                                {user.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
                                                            </Badge>
                                                        </td>
                                                        <td className="pe-2 pe-md-4 text-end">
                                                            <div className="d-flex gap-1 gap-md-2 justify-content-end">
                                                                <Button variant="outline-warning" size="sm" onClick={() => handleOpenUserModal(user)} title="Edit User">
                                                                    <FiEdit2 size={14} className="d-md-none" /><span className="d-none d-md-inline">Edit</span>
                                                                </Button>
                                                                <Button variant={user.is_locked ? 'outline-success' : 'outline-danger'} size="sm" onClick={() => handleToggleUserLock(user)} title={user.is_locked ? 'Unlock User' : 'Lock User'}>
                                                                    {user.is_locked ? <><FiUnlock size={14} className="d-md-none" /><span className="d-none d-md-inline">Unlock</span></> : <><FiLock size={14} className="d-md-none" /><span className="d-none d-md-inline">Lock</span></>}
                                                                </Button>
                                                                <Button variant="outline-secondary" size="sm" onClick={() => handleToggleUserStatus(user)} title={user.is_active ? "Deactivate User" : "Activate User"}>
                                                                    <FiUserX size={14} className="d-md-none" /><span className="d-none d-md-inline">{user.is_active ? 'Deactivate' : 'Activate'}</span>
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user)} title="Delete User">
                                                                    <FiTrash2 size={14} className="d-md-none" /><span className="d-none d-md-inline">Delete</span>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab>
                    
                    {/* BULK PERMISSIONS TAB */}
                    <Tab eventKey="permissions" title={<span><FiShield className="me-2"/>Module Permissions</span>}>
                        <Row className="mt-3">
                            <Col lg={12}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Header className="bg-white border-0 py-3">
                                        <h5 className="fw-bold mb-0">Bulk Permissions Assignment</h5>
                                        <p className="text-muted mb-0 small">Assign multiple module permissions to users at once</p>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={3}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Select User</Form.Label>
                                                    <Form.Select value={permissionData.user_id} onChange={(e) => setPermissionData({ ...permissionData, user_id: parseInt(e.target.value) || '' })}>
                                                        <option value="">Choose a user</option>
                                                        {users.map(user => (
                                                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <Form.Label className="mb-0">Select Modules</Form.Label>
                                                        <div className="d-flex gap-2">
                                                            <Button variant="link" className="p-0 text-decoration-none small text-primary" onClick={() => setBulkModules(modules.map(m => m.value))}>Select All</Button>
                                                            <span className="text-muted small">|</span>
                                                            <Button variant="link" className="p-0 text-decoration-none small text-muted" onClick={() => setBulkModules([])}>Clear</Button>
                                                        </div>
                                                    </div>
                                                    <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {modules.map(module => {
                                                            const isChecked = bulkModules.includes(module.value);
                                                            return (
                                                                <Form.Check
                                                                    key={module.value} type="checkbox" id={`bulk-module-${module.value}`} label={module.label} checked={isChecked}
                                                                    onChange={() => setBulkModules(prev => prev.includes(module.value) ? prev.filter(m => m !== module.value) : [...prev, module.value])}
                                                                    className="mb-2"
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={5}>
                                                <div className="mb-4">
                                                    <label className="form-label text-dark fw-medium mb-2">Permissions List</label>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {permissionsList.map(perm => (
                                                            <button key={perm.value} type="button" className={`btn btn-sm ${permissionData.permissions.includes(perm.value) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleBulkPermission(perm.value)}>
                                                                {perm.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {permissionData.permissions.length === 0 && <small className="text-danger">Select at least one permission</small>}
                                                </div>
                                                <div className="mb-4">
                                                    <div className="form-check form-switch custom-switch">
                                                        <input className="form-check-input" type="checkbox" id="granted" checked={permissionData.granted} onChange={(e) => setPermissionData({...permissionData, granted: e.target.checked})} />
                                                        <label className="form-check-label text-dark" htmlFor="granted">Active Status</label>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="d-flex">
                                            <Button variant="primary" disabled={saving}
                                                onClick={async () => {
                                                    if (!permissionData.user_id || bulkModules.length === 0 || !permissionData.permissions || permissionData.permissions.length === 0) {
                                                        toast.error('Please select user, at least one module, and at least one permission');
                                                        return;
                                                    }
                                                    setSaving(true);
                                                    const toastId = toast.loading('Assigning permissions...');
                                                    try {
                                                        const promises = bulkModules.map(moduleValue => settingsAPI.createPermission({
                                                            user_id: permissionData.user_id, module: moduleValue, permissions: permissionData.permissions, granted: permissionData.granted
                                                        }));
                                                        await Promise.all(promises);
                                                        toast.success('Permissions assigned successfully!', { id: toastId });
                                                        setBulkModules([]);
                                                        setPermissionData(prev => ({ ...prev, user_id: '', module: '', permissions: ['view'], granted: true }));
                                                        fetchData();
                                                    } catch (err) {
                                                        toast.error('Failed to assign all permissions', { id: toastId });
                                                    } finally {
                                                        setSaving(false);
                                                    }
                                                }}>
                                                {saving ? 'Assigning...' : 'Add Permissions'}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm mt-3">
                                    <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">Module Permissions List</h5>
                                        <Button variant="outline-primary" size="sm" onClick={() => setShowCreatePermModal(true)}>
                                            <FiPlus className="me-1"/> Add Individual
                                        </Button>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="table-responsive">
                                            <Table hover className="mb-0 align-middle">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="ps-4">User</th>
                                                        <th>Module</th>
                                                        <th>Permissions</th>
                                                        <th>Status</th>
                                                        <th className="text-end pe-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {permissions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-5">
                                                                <FiShield size={48} className="text-muted mb-3" />
                                                                <h6 className="fw-bold">No individual permissions</h6>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        permissions.map(permission => (
                                                            <tr key={permission.id}>
                                                                <td className="ps-4">
                                                                    <div className="d-flex align-items-center">
                                                                        <FiUser className="text-muted me-2" />
                                                                        <div>
                                                                            <div className="fw-bold">{permission.user ? `${permission.user.first_name} ${permission.user.last_name}` : getUserById(permission.user_id).username}</div>
                                                                            <div className="small text-muted">{permission.user ? permission.user.username : ''}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td><div className="fw-bold text-capitalize">{permission.module}</div></td>
                                                                <td><div className="text-capitalize">{Array.isArray(permission.permissions) ? permission.permissions.join(', ') : permission.permissions}</div></td>
                                                                <td>
                                                                    <Form.Check type="switch" id={`permission-${permission.id}`} checked={permission.granted} onChange={(e) => handleUpdatePerm(permission.id, { granted: e.target.checked })} label={permission.granted ? 'Granted' : 'Revoked'} />
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditPerm(permission)}><FiEdit /></Button>
                                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeletePerm(permission.id)}><FiTrash2 /></Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            )}

            {/* User Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{currentUser ? 'Edit User' : 'Add User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    <Form onSubmit={handleSaveUser} id="user-form">
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">First Name</Form.Label>
                                    <Form.Control type="text" value={userFormData.first_name} onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">Last Name</Form.Label>
                                    <Form.Control type="text" value={userFormData.last_name} onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">Username</Form.Label>
                                    <Form.Control type="text" value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">Email</Form.Label>
                                    <Form.Control type="email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">Phone</Form.Label>
                                    <Form.Control type="tel" value={userFormData.phone} onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">Role</Form.Label>
                                    <Form.Select value={userFormData.role} onChange={(e) => handleRoleChange(e.target.value)}>
                                        {roleOptions.map(role => (
                                            <option key={role.value} value={role.value}>{role.label} - {role.description}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small">{currentUser ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
                                    <Form.Control type="password" value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} placeholder={currentUser ? "Enter new password or leave blank" : "Password"} required={!currentUser} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Check type="checkbox" id="active-switch" label="Active Account" checked={userFormData.is_active} onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })} />
                                </Form.Group>
                            </Col>
                            {userFormData.role !== 'admin' && (
                                <Col md={12}>
                                    <hr className="my-3" />
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <Form.Label className="fw-semibold small mb-0">Module Permissions</Form.Label>
                                            <div className="text-muted" style={{fontSize:'0.75rem'}}>Toggle which modules this user can access</div>
                                        </div>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setUserFormData({...userFormData, permissions: {}})}>Clear All</Button>
                                    </div>
                                    <div style={{maxHeight:'300px', overflowY:'auto'}}>
                                        {modules.map(mod => {
                                            const modPerms = userFormData.permissions?.[mod.value] || [];
                                            const hasAccess = modPerms.length > 0;
                                            return (
                                                <div key={mod.value} className={`border rounded p-2 mb-2 ${hasAccess ? 'border-primary bg-light' : ''}`}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <Form.Check
                                                            type="switch"
                                                            id={`mod-${mod.value}`}
                                                            label={<span className="fw-semibold small">{mod.label}</span>}
                                                            checked={hasAccess}
                                                            onChange={(e) => {
                                                                const newPerms = { ...userFormData.permissions };
                                                                if (e.target.checked) {
                                                                    newPerms[mod.value] = ['view'];
                                                                } else {
                                                                    delete newPerms[mod.value];
                                                                }
                                                                setUserFormData({ ...userFormData, permissions: newPerms });
                                                            }}
                                                        />
                                                    </div>
                                                    {hasAccess && (
                                                        <div className="d-flex flex-wrap gap-1 mt-2 ps-2">
                                                            {permissionsList.map(perm => (
                                                                <button
                                                                    key={perm.value}
                                                                    type="button"
                                                                    className={`btn btn-xs btn-sm py-0 px-2 ${modPerms.includes(perm.value) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                    style={{fontSize:'0.7rem'}}
                                                                    onClick={() => {
                                                                        const newPerms = { ...userFormData.permissions };
                                                                        const curr = newPerms[mod.value] || [];
                                                                        if (curr.includes(perm.value)) {
                                                                            newPerms[mod.value] = curr.filter(p => p !== perm.value);
                                                                            if (newPerms[mod.value].length === 0) delete newPerms[mod.value];
                                                                        } else {
                                                                            newPerms[mod.value] = [...curr, perm.value];
                                                                        }
                                                                        setUserFormData({ ...userFormData, permissions: newPerms });
                                                                    }}
                                                                >
                                                                    {perm.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowUserModal(false)} disabled={saving}>Cancel</Button>
                    <Button variant="primary" type="submit" form="user-form" disabled={saving}>
                        {saving ? 'Processing...' : (currentUser ? 'Save Changes' : 'Create User')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Permission Modal */}
            <Modal show={showCreatePermModal} onHide={() => setShowCreatePermModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add Individual Permission</Modal.Title></Modal.Header>
                <Form onSubmit={handleCreatePermSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>User</Form.Label>
                            <Form.Select value={permissionData.user_id} onChange={(e) => setPermissionData({ ...permissionData, user_id: parseInt(e.target.value) })} required>
                                <option value="">Select a user</option>
                                {users.map(u => (<option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Select value={permissionData.module} onChange={(e) => setPermissionData({ ...permissionData, module: e.target.value })} required>
                                <option value="">Select a module</option>
                                {modules.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Permissions</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {permissionsList.map(perm => (
                                    <button key={perm.value} type="button" className={`btn btn-sm ${permissionData.permissions.includes(perm.value) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleBulkPermission(perm.value)}>{perm.label}</button>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check type="switch" id="perm-granted" label="Permission Granted" checked={permissionData.granted} onChange={(e) => setPermissionData({ ...permissionData, granted: e.target.checked })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreatePermModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Permission'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Permission Modal */}
            <Modal show={showEditPermModal} onHide={() => setShowEditPermModal(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Permission</Modal.Title></Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleUpdatePerm(currentPermission.id, { granted: permissionData.granted, permissions: permissionData.permissions }); setShowEditPermModal(false); }}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>User</Form.Label>
                            <Form.Select value={permissionData.user_id} disabled>
                                {users.map(u => (<option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Select value={permissionData.module} disabled>
                                {modules.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Permissions</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {permissionsList.map(perm => (
                                    <button key={perm.value} type="button" className={`btn btn-sm ${permissionData.permissions.includes(perm.value) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleBulkPermission(perm.value)}>{perm.label}</button>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check type="switch" id="edit-perm-granted" label="Permission Granted" checked={permissionData.granted} onChange={(e) => setPermissionData({ ...permissionData, granted: e.target.checked })} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditPermModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Update Permission</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Users;
