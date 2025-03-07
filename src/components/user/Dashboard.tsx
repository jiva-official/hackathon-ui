import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { api } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

interface Problem {
  id: string;
  title: string;
  description: string;
  track: string;
}

interface HackathonStatus {
  isActive: boolean;
  name?: string;
  startTime?: string;
  endTime?: string;
  assignedProblemId?: string | null;
  userId?: string;
}

const UserDashboard = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [assignedProblem, setAssignedProblem] = useState<Problem | null>(null);
  const [hackathonStatus, setHackathonStatus] = useState<HackathonStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAssignProblem = async (problemId: string) => {
    if (!user?.id) {
      setError('User ID not found');
      return;
    }

    try {
      await api.post(`/users/${user.id}/problem/${problemId}`);
      // Refetch data to update the UI
      const [problemsRes, statusRes] = await Promise.all([
        api.get('/hackathon/problems'),
        api.get('/hackathon/status')
      ]);
      setProblems(problemsRes.data);
      setHackathonStatus(statusRes.data);
      
      const assigned = problemsRes.data.find((p: Problem) => p.id === problemId);
      setAssignedProblem(assigned || null);
    } catch (err) {
      setError('Failed to assign problem');
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedProblemId || !user?.id) {
      setError('User ID or Problem ID not found');
      return;
    }
    
    try {
      await api.post(`/users/${user.id}/problem/${selectedProblemId}`);
      // Refetch data to update the UI
      const [problemsRes, statusRes] = await Promise.all([
        api.get('/hackathon/problems'),
        api.get('/hackathon/status')
      ]);
      setProblems(problemsRes.data);
      setHackathonStatus(statusRes.data);
      
      const assigned = problemsRes.data.find((p: Problem) => p.id === selectedProblemId);
      setAssignedProblem(assigned || null);
    } catch (err) {
      setError('Failed to assign problem');
    } finally {
      setDialogOpen(false);
      setSelectedProblemId(null);
    }
  };

  const handleAssignClick = (problemId: string) => {
    setSelectedProblemId(problemId);
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, statusRes] = await Promise.all([
          api.get('/hackathon/problems'),
          api.get('/hackathon/status')
        ]);
        
        setProblems(problemsRes.data);
        setHackathonStatus(statusRes.data);
        
        // Check for assigned problem
        if (statusRes.data.assignedProblemId) {
          console.log('Assigned Problem ID:', statusRes.data.assignedProblemId);
          const assigned = problemsRes.data.find(
            (p: Problem) => p.id === statusRes.data.assignedProblemId
          );
          console.log('Found Assigned Problem:', assigned);
          setAssignedProblem(assigned || null);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartPreparing = () => {
    // Add your logic for starting preparation
    console.log('Start preparing');
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hackathonStatus?.isActive ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Active Hackathon: {hackathonStatus.name}
          </Typography>
          <Typography>
            Time Remaining: [Timer Component Here]
          </Typography>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No active hackathon at the moment
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="My Problem" />
          <Tab label="All Problems" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          {assignedProblem ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Your Assigned Problem
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {assignedProblem.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Track: {assignedProblem.track}
                </Typography>
                <Typography variant="body2" paragraph>
                  {assignedProblem.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartPreparing}
                >
                  Start Preparing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              No problem has been assigned to you yet. You can select one from the All Problems section.
            </Alert>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Paper>
          <List>
            {problems.map((problem, index) => (
              <Box key={problem.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{problem.title}</Typography>
                        {!hackathonStatus?.assignedProblemId && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleAssignClick(problem.id)}
                          >
                            Assign to Me
                          </Button>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Track: {problem.track}
                        </Typography>
                        <Typography variant="body2">
                          {problem.description}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < problems.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirm Problem Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Warning: Once you assign this problem, it cannot be changed or reverted. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAssign} color="primary" variant="contained">
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;