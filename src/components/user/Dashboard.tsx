import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../../services/auth';

interface HackathonParticipation {
  hackathonId: string;
  hackathonName: string;
  startTime: string;
  endTime: string;
  solution: {
    githubUrl: string | null;
    hostedUrl: string | null;
    submissionTime: string | null;
  } | null;
  active: boolean;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  track: string;
}

interface UserProfile {
  id: string;
  assignedProblemId: string | null;
}

const UserDashboard = () => {
  const [hackathonParticipations, setHackathonParticipations] = useState<HackathonParticipation[]>([]);
  const [activeHackathon, setActiveHackathon] = useState<HackathonParticipation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submission, setSubmission] = useState({
    githubUrl: '',
    hostedUrl: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectProblemDialogOpen, setSelectProblemDialogOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const response = await api.get('/users/profile');
      console.log('User data received:', response.data);
      
      const participations = response.data.hackathonParticipations || [];
      setHackathonParticipations(participations);
      
      const active = participations.find((h: HackathonParticipation) => h.active);
      console.log('Active hackathon:', active);
      setActiveHackathon(active || null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUserProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await api.get('/hackathon/problems');
      setProblems(response.data);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
      setError('Failed to load problems');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const profile = await fetchUserProfile();
      if (!profile.assignedProblemId) {
        await fetchProblems();
      }
      await fetchUserData();
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!activeHackathon) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeHackathon.endTime).getTime();
      const timeLeft = end - now;

      if (timeLeft <= 0) {
        setTimeRemaining('Time Up!');
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const totalDuration = new Date(activeHackathon.endTime).getTime() - 
                           new Date(activeHackathon.startTime).getTime();
      const percentageLeft = (timeLeft / totalDuration) * 100;

      setTimeRemaining(`${hours}:${minutes}:${seconds}`);

      // Alert if less than 20% time remaining
      if (percentageLeft < 20 && !activeHackathon.solution) {
        // You might want to show a more prominent alert here
      }
    };

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeHackathon]);

  const handleSubmitSolution = async () => {
    if (!activeHackathon || !submission.githubUrl) return;

    try {
      await api.post(`/hackathon/submit/${activeHackathon.hackathonId}`, null, {
        params: {
          githubUrl: submission.githubUrl,
          hostedUrl: submission.hostedUrl || undefined
        }
      });
      setSubmitDialogOpen(false);
      // Refresh data immediately after submission
      await fetchUserData();
    } catch (err) {
      console.error('Failed to submit solution:', err);
      setError('Failed to submit solution');
    }
  };

  const handleSelectProblem = async () => {
    if (!selectedProblemId || !userProfile) return;

    try {
      await api.post(`/hackathon/problems/${selectedProblemId}/select`, null, {
        params: { userId: userProfile.id }
      });
      setSelectProblemDialogOpen(false);
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to select problem:', err);
      setError('Failed to select problem');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!userProfile?.assignedProblemId) {
    return (
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
          <Typography variant="h5" gutterBottom>
            Problem Statement Required
          </Typography>
          <Typography paragraph>
            You need to select a problem statement before participating in the hackathon.
            You can either:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setSelectProblemDialogOpen(true)}
            >
              Select Problem Statement
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Note: If you cannot select a problem statement, please contact your administrator.
          </Typography>
        </Paper>

        <Dialog
          open={selectProblemDialogOpen}
          onClose={() => setSelectProblemDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Select Problem Statement</DialogTitle>
          <DialogContent>
            {problems.map((problem) => (
              <Paper
                key={problem.id}
                sx={{
                  p: 2,
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedProblemId === problem.id ? 2 : 0,
                  borderColor: 'primary.main'
                }}
                onClick={() => setSelectedProblemId(problem.id)}
              >
                <Typography variant="h6">{problem.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Track: {problem.track}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {problem.description}
                </Typography>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectProblemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSelectProblem}
              disabled={!selectedProblemId}
              variant="contained"
            >
              Select Problem
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activeHackathon ? (
        <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
          <Typography variant="h5" gutterBottom>
            Active Hackathon: {activeHackathon.hackathonName}
          </Typography>
          <Typography variant="h6" color={
            timeRemaining === 'Time Up!' ? 'error' : 
            parseInt(timeRemaining.split(':')[0]) < 2 ? 'warning.main' : 'primary'
          }>
            Time Remaining: {timeRemaining}
          </Typography>
          {!activeHackathon.solution && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSubmitDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Submit Solution
            </Button>
          )}
          {activeHackathon.solution && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Solution submitted at ${new Date(activeHackathon.solution.submissionTime!).toLocaleString()}`}
                color="success"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                GitHub URL: <Link href={activeHackathon.solution.githubUrl!} target="_blank" rel="noopener">
                  {activeHackathon.solution.githubUrl}
                </Link>
              </Typography>
              {activeHackathon.solution.hostedUrl && (
                <Typography variant="body2">
                  Hosted URL: <Link href={activeHackathon.solution.hostedUrl} target="_blank" rel="noopener">
                    {activeHackathon.solution.hostedUrl}
                  </Link>
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No active hackathon at the moment
        </Alert>
      )}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Previous Hackathons</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {hackathonParticipations
            .filter(h => !h.active)
            .map((hackathon) => (
              <Paper key={hackathon.hackathonId} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{hackathon.hackathonName}</Typography>
                <Typography>
                  {new Date(hackathon.startTime).toLocaleString()} - 
                  {new Date(hackathon.endTime).toLocaleString()}
                </Typography>
                {hackathon.solution && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`Submitted: ${new Date(hackathon.solution.submissionTime!).toLocaleString()}`}
                      color="success"
                    />
                  </Box>
                )}
              </Paper>
            ))}
        </AccordionDetails>
      </Accordion>

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Solution</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="GitHub URL"
            fullWidth
            required
            value={submission.githubUrl}
            onChange={(e) => setSubmission({ ...submission, githubUrl: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Hosted URL (Optional)"
            fullWidth
            value={submission.hostedUrl}
            onChange={(e) => setSubmission({ ...submission, hostedUrl: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitSolution}
            disabled={!submission.githubUrl}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;