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
  Card,
  CardContent,
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
  selectedProblem?: {
    id: string;
    title: string;
    description: string;
    track: string;
    releaseDate: string;
    requirements: string;
    deadline: string;
  };
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

interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  track: string;
  difficulty: string;
  constraints: string[];
  sampleInput?: string;
  sampleOutput?: string;
  timeLimit: string;
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
  const [showNewHackathonBanner, setShowNewHackathonBanner] = useState(false);
  const [, setSelectedProblemStatement] = useState<ProblemStatement | null>(null);


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

  const fetchProblemStatement = async (problemId: string) => {
    try {
      const response = await api.get(`/hackathon/problems/${problemId}`);
      setSelectedProblemStatement(response.data);
    } catch (err) {
      console.error('Failed to fetch problem statement:', err);
      setError('Failed to load problem statement');
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

  const isHackathonEnded = (hackathon: HackathonParticipation) => {
    const now = new Date().getTime();
    const end = new Date(hackathon.endTime).getTime();
    return now > end;
  };

  useEffect(() => {
    if (!activeHackathon) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeHackathon.endTime).getTime();
      const timeLeft = end - now;

      if (timeLeft <= 0) {
        // Move ended hackathon to previous hackathons
        setHackathonParticipations(prev => [
          ...prev.filter(h => h.hackathonId !== activeHackathon.hackathonId),
          { ...activeHackathon, active: false }
        ]);
        setActiveHackathon(null);
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
    };

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeHackathon]);

  const handleSubmitSolution = async () => {
    if (!activeHackathon || !submission.githubUrl || !userProfile) return;

    try {
      await api.post(`/hackathon/submit/${userProfile.id}`, null, {
        params: {
          githubUrl: submission.githubUrl,
          hostedUrl: submission.hostedUrl || undefined
        }
      });
      setSubmitDialogOpen(false);
      // Stop the timer
      setTimeRemaining('Submitted');
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
      // Using the correct endpoint for problem selection
      await api.post(`/hackathon/problems/${selectedProblemId}/${userProfile.id}`);
      setSelectProblemDialogOpen(false);
      
      // Fetch the selected problem statement
      await fetchProblemStatement(selectedProblemId);
      
      // Refresh user profile to get updated assignedProblemId
      await fetchUserProfile();
    } catch (err) {
      console.error('Failed to select problem:', err);
      setError('Failed to select problem');
    }
  };

  const handleEnterHackathon = async () => {
    try {
      const profile = await fetchUserProfile();
      setShowNewHackathonBanner(false);
      
      if (profile?.assignedProblemId) {
        // If problem is already assigned, fetch and display it
        await fetchProblemStatement(profile.assignedProblemId);
      } else {
        // If no problem assigned, show problem selection
        await fetchProblems();
        setSelectProblemDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to enter hackathon:', err);
      setError('Failed to enter hackathon');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
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

      {/* Show active hackathon invitation first */}
      {showNewHackathonBanner && (
        <Card sx={{ mb: 3, p: 2, bgcolor: 'primary.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  New Hackathon Available!
                </Typography>
                <Typography variant="body1">
                  Click enter to participate in the latest hackathon
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnterHackathon}
              >
                Enter Hackathon
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Active Hackathon Display */}
      {activeHackathon && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h5" gutterBottom>
              Active Hackathon: {activeHackathon.hackathonName}
            </Typography>
            
            {activeHackathon.selectedProblem ? (
              <>
                <ProblemStatementView 
                  problem={{
                    id: activeHackathon.selectedProblem.id,
                    title: activeHackathon.selectedProblem.title,
                    description: activeHackathon.selectedProblem.description,
                    track: activeHackathon.selectedProblem.track,
                    difficulty: "Standard", // You might want to add this to the API response
                    constraints: [activeHackathon.selectedProblem.requirements],
                    timeLimit: new Date(activeHackathon.selectedProblem.deadline).toLocaleString()
                  }} 
                />
                {!activeHackathon.solution && timeRemaining !== 'Submitted' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" color={
                      parseInt(timeRemaining.split(':')[0]) < 2 ? 'warning.main' : 'primary'
                    }>
                      Time Remaining: {timeRemaining}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSubmitDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Submit Solution
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  You need to select a problem statement to start the hackathon.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setSelectProblemDialogOpen(true)}
                >
                  Select Problem
                </Button>
              </Box>
            )}
            
            {activeHackathon.solution && (
              <SubmissionCard 
                solution={{
                  githubUrl: activeHackathon.solution.githubUrl ?? '',
                  hostedUrl: activeHackathon.solution.hostedUrl ?? undefined,
                  submissionTime: activeHackathon.solution.submissionTime ?? '',
                }}
                endTime={activeHackathon.endTime}
              />
            )}
          </Paper>
        </Box>
      )}

      {/* Default dashboard state */}
      {!activeHackathon && !showNewHackathonBanner && (
        <Card sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              No Active Hackathons
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You currently don't have any active hackathons.
              Please wait for an invitation to participate in the next hackathon.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Previous Hackathons Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Previous Hackathons</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {hackathonParticipations
            .filter(h => !h.active || isHackathonEnded(h))
            .map((hackathon) => (
              <Card key={hackathon.hackathonId} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {hackathon.hackathonName}
                    </Typography>
                    <Chip 
                      label={hackathon.solution ? "Solution Submitted" : "Not Submitted"}
                      color={hackathon.solution ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(hackathon.startTime).toLocaleString()} - 
                    {new Date(hackathon.endTime).toLocaleString()}
                  </Typography>
                  {hackathon.solution && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Submitted at: {new Date(hackathon.solution.submissionTime!).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        GitHub URL: <Link href={hackathon.solution.githubUrl!}>{hackathon.solution.githubUrl}</Link>
                      </Typography>
                      {hackathon.solution.hostedUrl && (
                        <Typography variant="body2">
                          Hosted URL: <Link href={hackathon.solution.hostedUrl}>{hackathon.solution.hostedUrl}</Link>
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
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

      {/* Problem Selection Dialog */}
      <Dialog 
        open={selectProblemDialogOpen} 
        onClose={() => setSelectProblemDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Problem Statement</DialogTitle>
        <DialogContent>
          {problems.map((problem) => (
            <Card 
              key={problem.id} 
              sx={{ 
                mb: 2, 
                cursor: 'pointer',
                border: selectedProblemId === problem.id ? '2px solid primary.main' : 'none'
              }}
              onClick={() => setSelectedProblemId(problem.id)}
            >
              <CardContent>
                <Typography variant="h6">{problem.title}</Typography>
                <Chip label={`Track: ${problem.track}`} size="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {problem.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectProblemDialogOpen(false)}>Cancel</Button>
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
};

const SubmissionCard = ({ solution, endTime }: { 
  solution: { 
    githubUrl: string; 
    hostedUrl?: string; 
    submissionTime: string; 
  }; 
  endTime: string;
}) => {
  const submittedBeforeEnd = new Date(solution.submissionTime) < new Date(endTime);

  return (
    <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Solution Submitted Successfully!
        </Typography>
        {submittedBeforeEnd && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Congratulations! You submitted your solution before the deadline.
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Submitted at: {new Date(solution.submissionTime).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            GitHub URL: <Link href={solution.githubUrl} target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
              {solution.githubUrl}
            </Link>
          </Typography>
          {solution.hostedUrl && (
            <Typography variant="body1">
              Hosted URL: <Link href={solution.hostedUrl} target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
                {solution.hostedUrl}
              </Link>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ProblemStatementView = ({ problem }: { problem: ProblemStatement }) => (
  <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.900', color: 'white' }}>
    <Typography variant="h5" gutterBottom>
      {problem.title}
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Chip label={`Track: ${problem.track}`} color="primary" size="small" />
      <Chip label={`Difficulty: ${problem.difficulty}`} color="secondary" size="small" />
      <Chip label={`Time Limit: ${problem.timeLimit}`} color="warning" size="small" />
    </Box>
    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
      {problem.description}
    </Typography>
    {problem.constraints && (
      <>
        <Typography variant="h6" gutterBottom>Constraints:</Typography>
        <ul>
          {problem.constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </>
    )}
    {problem.sampleInput && (
      <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Sample Input:</Typography>
        <pre style={{ margin: 0 }}>{problem.sampleInput}</pre>
      </Box>
    )}
    {problem.sampleOutput && (
      <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Sample Output:</Typography>
        <pre style={{ margin: 0 }}>{problem.sampleOutput}</pre>
      </Box>
    )}
  </Paper>
);

export default UserDashboard;