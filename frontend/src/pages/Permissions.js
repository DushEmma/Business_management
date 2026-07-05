import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { FiShield, FiUser, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPermission, setCurrentPermission] = useState(null);
    const [bulkModules, setBulkModules] = useState([]);
    const [permissionData, setPermissionData] = useState({
        user_id: '',
        module: '',
        permissions: ['view'], // Changed to array
        granted: true
    });

    const modules = [
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'sales', label: 'Sales' },
        { value: 'pos', label: 'Point of Sale' },
        { value: 'invoices', label: 'Invoices' },
        { value: 'customers', label: 'Customers' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'products', label: 'Products' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'purchases', label: 'Purchases' },
        { value: 'suppliers', label: 'Suppliers' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'employees', label: 'Employees' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'leave', label: 'Leave Management' },
        { value: 'payroll', label: 'Payroll' },
        { value: 'expenses', label: 'Expenses' },
        { value: 'payments', label: 'Payments' },
        { value: 'projects', label: 'Projects' },
        { value: 'tasks', label: 'Tasks' },
        { value: 'documents', label: 'Documents' },
        { value: 'assets', label: 'Assets' },
        { value: 'reports', label: 'Reports' },
        { value: 'sales_reports', label: 'Sales Reports' },
        { value: 'inventory_reports', label: 'Inventory Reports' },
        { value: 'financial_reports', label: 'Financial Reports' },
        { value: 'settings', label: 'Settings' },
        { value: 'users', label: 'User Management' },
        { value: 'branches', label: 'Branches' },
        { value: 'leads', label: 'Leads' },
        { value: 'returns', label: 'Returns' }
    ];

    const permissionsList = [
        { value: 'view', label: 'View Only' },
        { value: 'create', label: 'Create' },
        { value: 'edit', label: 'Edit' },
        { value: 'delete', label: 'Delete' },
        { value: 'export', label: 'Export' },
        { value: 'approve', label: 'Approve' },
        { value: 'all', label: 'Full Access (Admin)' }
    ];

    useEffect(() => {
        fetchPermissions();
    }, []);

    const togglePermission = (permValue) => {
        setPermissionData(prev => {
            const newPermissions = prev.permissions.includes(permValue)
                ? prev.permissions.filter(p => p !== permValue)
                : [...prev.permissions, permValue];
            return { ...prev, permissions: newPermissions };
        });
    };

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const [permissionsRes, usersRes] = await Promise.all([
                settingsAPI.getPermissions(),
                settingsAPI.getUsers()
            ]);
            setPermissions(permissionsRes.data.permissions || []);
            setUsers(usersRes.data.users || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch permissions and users.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!permissionData.user_id || !permissionData.module || permissionData.permissions.length === 0) {
                toast.error('Please fill all fields and select at least one permission');
                return;
            }
            await settingsAPI.createPermission(permissionData);
            toast.success('Permission granted successfully');
            setShowCreateModal(false);
            setPermissionData({ user_id: '', module: '', permissions: ['view'], granted: true });
            fetchPermissions();
        } catch (err) {
            toast.error('Failed to grant permission');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id, updateData) => {
        try {
            await settingsAPI.updatePermission(id, updateData);
            toast.success('Permission updated successfully');
            fetchPermissions();
        } catch (err) {
            toast.error('Failed to update permission');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this permission?')) {
            try {
                await settingsAPI.deletePermission(id);
                toast.success('Permission deleted successfully');
                fetchPermissions();
            } catch (err) {
                toast.error('Failed to delete permission');
            }
        }
    };

    const handleEdit = (permission) => {
        setCurrentPermission(permission);
        setPermissionData({
            user_id: permission.user_id,
            module: permission.module,
            permissions: permission.permissions || [],
            granted: permission.granted
        });
        setShowEditModal(true);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === userId) || { username: 'Unknown User' };
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Permissions</h2>
                    <p className="text-muted mb-0">Manage user permissions and access rights</p>
                </div>
                <div className="d-flex gap-2 mt-3 mt-md-0">
                    <Button 
                        variant="primary" 
                        className="d-flex align-items-center"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FiPlus className="me-2" /> Add Permission
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="fw-bold mb-0">User Permissions</h5>
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
                                                    <div className="d-flex flex-column align-items-center">
                                                        <FiShield size={48} className="text-muted mb-3" />
                                                        <h5 className="fw-bold text-dark">No permissions</h5>
                                                        <p className="text-muted mb-0">No user permissions have been configured yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            permissions.map(permission => (
                                                <tr key={permission.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <FiUser className="text-muted me-2" />
                                                            <div>
                                                                <div className="fw-bold">
                                                                    {permission.user ? 
                                                                        `${permission.user.first_name} ${permission.user.last_name}` : 
                                                                        getUserById(permission.user_id).username}
                                                                </div>
                                                                <div className="small text-muted">
                                                                    {permission.user ? permission.user.username : 'User details not available'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-capitalize">{permission.module}</div>
                                                    </td>
                                                    <td>
                                                        <div className="text-capitalize">{Array.isArray(permission.permissions) ? permission.permissions.join(', ') : permission.permissions}</div>
                                                    </td>
                                                    <td>
                                                        <Form.Check
                                                            type="switch"
                                                            id={`permission-${permission.id}`}
                                                            checked={permission.granted}
                                                            onChange={(e) => handleUpdate(permission.id, { granted: e.target.checked })}
                                                            label={permission.granted ? 'Granted' : 'Revoked'}
                                                        />
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleEdit(permission)}
                                                        >
                                                            <FiEdit />
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm"
                                                            onClick={() => handleDelete(permission.id)}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
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
            
            {/* Bulk Permissions Assignment Section */}
            <Row className="mt-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="fw-bold mb-0">Bulk Permissions Assignment</h5>
                            <p className="text-muted mb-0 small">Assign multiple permissions to users at once</p>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select User</Form.Label>
                                        <Form.Select
                                            value={permissionData.user_id}
                                            onChange={(e) => setPermissionData({ ...permissionData, user_id: parseInt(e.target.value) || '' })}
                                        >
                                            <option value="">Choose a user</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.first_name} {user.last_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Label className="mb-0">Select Modules</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="link" 
                                                    className="p-0 text-decoration-none small text-primary"
                                                    onClick={() => setBulkModules(modules.map(m => m.value))}
                                                >
                                                    Select All
                                                </Button>
                                                <span className="text-muted small">|</span>
                                                <Button 
                                                    variant="link" 
                                                    className="p-0 text-decoration-none small text-muted"
                                                    onClick={() => setBulkModules([])}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                        <div 
                                            className="border rounded p-3 bg-light" 
                                            style={{ maxHeight: '200px', overflowY: 'auto' }}
                                        >
                                            {modules.map(module => {
                                                const isChecked = bulkModules.includes(module.value);
                                                return (
                                                    <Form.Check
                                                        key={module.value}
                                                        type="checkbox"
                                                        id={`bulk-module-${module.value}`}
                                                        label={module.label}
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setBulkModules(prev => 
                                                                prev.includes(module.value)
                                                                    ? prev.filter(m => m !== module.value)
                                                                    : [...prev, module.value]
                                                            );
                                                        }}
                                                        className="mb-2"
                                                    />
                                                );
                                            })}
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <div className="mb-4">
                                        <label className="form-label text-dark fw-medium mb-2">Permissions</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {permissionsList.map(perm => (
                                                <button
                                                    key={perm.value}
                                                    type="button"
                                                    className={`btn btn-sm ${permissionData.permissions.includes(perm.value) 
                                                        ? 'btn-primary' 
                                                        : 'btn-outline-secondary'}`}
                                                    onClick={() => togglePermission(perm.value)}
                                                >
                                                    {perm.label}
                                                </button>
                                            ))}
                                        </div>
                                        {permissionData.permissions.length === 0 && (
                                            <small className="text-danger">Select at least one permission</small>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="form-check form-switch custom-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id="granted" 
                                                checked={permissionData.granted}
                                                onChange={(e) => setPermissionData({...permissionData, granted: e.target.checked})}
                                            />
                                            <label className="form-check-label text-dark" htmlFor="granted">
                                                Active Status
                                            </label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <div className="d-flex">
                                <Button 
                                    variant="primary" 
                                    disabled={saving}
                                    onClick={async () => {
                                        if (!permissionData.user_id || bulkModules.length === 0 || !permissionData.permissions || permissionData.permissions.length === 0) {
                                            toast.error('Please select user, at least one module, and at least one permission');
                                            return;
                                        }
                                        
                                        setSaving(true);
                                        const toastId = toast.loading('Assigning permissions...');
                                        try {
                                            const promises = bulkModules.map(moduleValue => {
                                                return settingsAPI.createPermission({
                                                    user_id: permissionData.user_id,
                                                    module: moduleValue,
                                                    permissions: permissionData.permissions,
                                                    granted: permissionData.granted
                                                });
                                            });
                                            
                                            await Promise.all(promises);
                                            toast.success('Permissions assigned successfully!', { id: toastId });
                                            setBulkModules([]);
                                            setPermissionData(prev => ({
                                                ...prev,
                                                user_id: '',
                                                module: '',
                                                permissions: ['view'],
                                                granted: true
                                            }));
                                            fetchPermissions();
                                        } catch (err) {
                                            toast.error('Failed to assign all permissions', { id: toastId });
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                >
                                    {saving ? 'Assigning...' : 'Add Permissions'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Create Permission Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Permission</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>User</Form.Label>
                            <Form.Select
                                value={permissionData.user_id}
                                onChange={(e) => setPermissionData({ ...permissionData, user_id: parseInt(e.target.value) })}
                                required
                            >
                                <option value="">Select a user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name} ({user.username})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Select
                                value={permissionData.module}
                                onChange={(e) => setPermissionData({ ...permissionData, module: e.target.value })}
                                required
                            >
                                <option value="">Select a module</option>
                                {modules.map(module => (
                                    <option key={module.value} value={module.value}>
                                        {module.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Permissions</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {permissionsList.map(perm => (
                                    <button
                                        key={perm.value}
                                        type="button"
                                        className={`btn btn-sm ${permissionData.permissions.includes(perm.value) 
                                            ? 'btn-primary' 
                                            : 'btn-outline-secondary'}`}
                                        onClick={() => togglePermission(perm.value)}
                                    >
                                        {perm.label}
                                    </button>
                                ))}
                            </div>
                            {permissionData.permissions.length === 0 && (
                                <small className="text-danger">Select at least one permission</small>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="permission-granted"
                                label="Permission Granted"
                                checked={permissionData.granted}
                                onChange={(e) => setPermissionData({ ...permissionData, granted: e.target.checked })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Saving...</span>
                                    </div>
                                    Saving...
                                </>
                            ) : 'Add Permission'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Permission Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Permission</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(currentPermission.id, { 
                        granted: permissionData.granted,
                        permissions: permissionData.permissions
                    });
                    setShowEditModal(false);
                }}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>User</Form.Label>
                            <Form.Select
                                value={permissionData.user_id}
                                onChange={(e) => setPermissionData({ ...permissionData, user_id: parseInt(e.target.value) })}
                                required
                            >
                                <option value="">Select a user</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id} selected={user.id === permissionData.user_id}>
                                        {user.first_name} {user.last_name} ({user.username})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Module</Form.Label>
                            <Form.Select
                                value={permissionData.module}
                                onChange={(e) => setPermissionData({ ...permissionData, module: e.target.value })}
                                required
                            >
                                <option value="">Select a module</option>
                                {modules.map(module => (
                                    <option key={module.value} value={module.value} selected={module.value === permissionData.module}>
                                        {module.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Permissions</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {permissionsList.map(perm => (
                                    <button
                                        key={perm.value}
                                        type="button"
                                        className={`btn btn-sm ${permissionData.permissions.includes(perm.value) 
                                            ? 'btn-primary' 
                                            : 'btn-outline-secondary'}`}
                                        onClick={() => togglePermission(perm.value)}
                                    >
                                        {perm.label}
                                    </button>
                                ))}
                            </div>
                            {permissionData.permissions.length === 0 && (
                                <small className="text-danger">Select at least one permission</small>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="edit-permission-granted"
                                label="Permission Granted"
                                checked={permissionData.granted}
                                onChange={(e) => setPermissionData({ ...permissionData, granted: e.target.checked })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Update Permission
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Permissions;
