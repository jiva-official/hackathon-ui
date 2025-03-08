import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import ManageProblems from './ManageProblems';
import ManageTeams from './ManageTeams';
import StartHackathon from './StartHackathon';
import AssignProblems from './AssignProblems';
import HackathonHistory from './HackathonHistory';
import { api } from '../../services/auth';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hackathonStatus, setHackathonStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/hackathon/status');
        setHackathonStatus(response.data);
      } catch (err) {
        setError('Failed to fetch hackathon status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hackathonStatus?.isActive && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color="primary">
            Active Hackathon: {hackathonStatus.name}
          </Typography>
          <Typography>
            Started at: {new Date(hackathonStatus.startTime).toLocaleString()}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Manage Problems" />
          <Tab label="Manage Teams" />
          <Tab label="Start Hackathon" />
          <Tab label="Assign Problems" />
          <Tab label="Hackathon History" />
        </Tabs>
      </Paper>

      {activeTab === 0 && <ManageProblems />}
      {activeTab === 1 && <ManageTeams />}
      {activeTab === 2 && <StartHackathon />}
      {activeTab === 3 && <AssignProblems />}
      {activeTab === 4 && <HackathonHistory />}
    </Box>
  );
};

export default AdminDashboard;