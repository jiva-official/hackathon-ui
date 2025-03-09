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
        
        // Check if hackathon is active, then verify all solutions
        if (response.data?.isActive) {
          const solutionsResponse = await api.get('/hackathon/solutions/status');
          const allSubmitted = solutionsResponse.data.allSubmitted;
          setAllSolutionsSubmitted(allSubmitted);

          // If all solutions are submitted, close the hackathon
          if (allSubmitted) {
            await api.post('/hackathon/close');
            // Refresh hackathon status
            const updatedStatus = await api.get('/hackathon/status');
            setHackathonStatus(updatedStatus.data);
          }
        }
      } catch (err) {
        setError('Failed to fetch hackathon status');
      } finally {
        setLoading(false);
      }
    };

    // Poll for status every 5 minutes
    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

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

      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          maxWidth: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.light',
            borderRadius: '4px',
          },
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="admin dashboard tabs"
          >
            <Tab label="Manage Problems" />
            <Tab label="Manage Teams" />
            <Tab label="Start Hackathon" />
            <Tab label="Assign Problems" />
            <Tab label="Hackathon History" />
          </Tabs>
        </Box>
      </Box>

      {activeTab === 0 && <ManageProblems />}
      {activeTab === 1 && <ManageTeams />}
      {activeTab === 2 && <StartHackathon />}
      {activeTab === 3 && <AssignProblems />}
      {activeTab === 4 && <HackathonHistory />}
    </Box>
  );
};

export default AdminDashboard;

function setAllSolutionsSubmitted(_allSubmitted: any) {
  throw new Error('Function not implemented.');
}
