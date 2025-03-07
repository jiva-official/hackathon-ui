import React from 'react';
import Dashboard from '../components/admin/AdminDashboard';
import Layout from '../components/common/Layout';

const Admin: React.FC = () => {
    return (
        <Layout>
            <h1>Admin Dashboard</h1>
            <Dashboard />
        </Layout>
    );
};

export default Admin;