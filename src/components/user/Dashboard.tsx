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
  Grid,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ExtensionIcon from '@mui/icons-material/Extension';
import AbcIcon from '@mui/icons-material/Abc';
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

// Add a polling mechanism to check for updates
const POLLING_INTERVAL = 30000; // 30 seconds

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
  const [success, setSuccess] = useState<string>('');

  // Add this helper function at the top level

  const formatDateWithTimezone = (date: string) => {
    // Create a date object in UTC
    const utcDate = new Date(date);
    
    // Format the date in user's local timezone with timezone name
    return new Date(utcDate).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  // For timer calculations, convert UTC to local time
  const convertUTCToLocal = (utcDate: string): Date => {
    return new Date(utcDate);
  };

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
    const end = convertUTCToLocal(hackathon.endTime).getTime();
    return now > end;
  };

  // Update the timer effect
  useEffect(() => {
    if (!activeHackathon) return;

    const updateTimer = () => {
      const now = new Date();
      const end = convertUTCToLocal(activeHackathon.endTime);
      const timeLeft = end.getTime() - now.getTime();

      if (timeLeft <= 0) {
        setHackathonParticipations(prev => [
          ...prev.filter(h => h.hackathonId !== activeHackathon.hackathonId),
          { ...activeHackathon, active: false }
        ]);
        setActiveHackathon(null);
        return;
      }

      // Convert milliseconds to hours, minutes, seconds
      const totalMilliseconds = timeLeft;
      const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
      const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const totalSeconds = Math.floor((totalMilliseconds % (1000 * 60)) / 1000);

      // Format with leading zeros
      const formattedHours = String(totalHours).padStart(2, '0');
      const formattedMinutes = String(totalMinutes).padStart(2, '0');
      const formattedSeconds = String(totalSeconds).padStart(2, '0');

      setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);

      // Log time details for verification with timezone info
      if (totalHours !== parseInt(timeRemaining.split(':')[0])) {
        console.log('Time details:', {
          localTime: now.toLocaleString(),
          endTime: end.toLocaleString(),
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          remaining: {
            hours: totalHours,
            minutes: totalMinutes,
            seconds: totalSeconds
          }
        });
      }
    };

    // Update immediately and then set interval
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    
    // Log initial time values for verification
    console.log('Timer initialized:', {
      startTime: formatDateWithTimezone(activeHackathon.startTime),
      endTime: formatDateWithTimezone(activeHackathon.endTime),
      currentTime: new Date().toLocaleString(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return () => clearInterval(timer);
  }, [activeHackathon]);

  // Add polling effect to check for updates
  useEffect(() => {
    const pollForUpdates = async () => {
      await fetchUserData();
    };

    // Initial fetch
    pollForUpdates();

    // Set up polling interval
    const intervalId = setInterval(pollForUpdates, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only on mount

  const handleSubmitSolution = async () => {
    if (!activeHackathon || !submission.githubUrl || !userProfile) return;

    try {
      const response = await api.post(`/hackathon/submit/${userProfile.id}`, null, {
        params: {
          githubUrl: submission.githubUrl,
          hostedUrl: submission.hostedUrl || undefined
        }
      });
      
      if (response.status === 200) {
        setSubmitDialogOpen(false);
        // Stop the timer
        setTimeRemaining('Submitted');
        // Show success message
        setSuccess('Solution submitted successfully! You can view your submission details below.');
        // Refresh data immediately after submission
        await fetchUserData();
      }
    } catch (err) {
      console.error('Failed to submit solution:', err);
      setError('Failed to submit solution');
    }
  };

  const handleSelectProblem = async () => {
    if (!selectedProblemId || !userProfile) return;

    try {
      await api.post(`/hackathon/problems/${selectedProblemId}/${userProfile.id}`);
      setSelectProblemDialogOpen(false);
      
      // Immediately fetch updated data
      await Promise.all([
        fetchUserData(),
        fetchProblemStatement(selectedProblemId)
      ]);
      
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

  // Add a function to verify time synchronization
  const verifyTimeSync = (hackathon: HackathonParticipation) => {
    const now = new Date().getTime();
    const start = convertUTCToLocal(hackathon.startTime).getTime();
    const end = convertUTCToLocal(hackathon.endTime).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const remaining = end - now;

    console.log('Time verification:', {
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      totalDuration: totalDuration / (1000 * 60 * 60) + ' hours',
      elapsed: elapsed / (1000 * 60 * 60) + ' hours',
      remaining: remaining / (1000 * 60 * 60) + ' hours',
      localTime: new Date().toLocaleString(),
      startTime: new Date(start).toLocaleString(),
      endTime: new Date(end).toLocaleString()
    });
  };

  // Call verifyTimeSync when activeHackathon changes
  useEffect(() => {
    if (activeHackathon) {
      verifyTimeSync(activeHackathon);
    }
  }, [activeHackathon]);

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
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setSuccess('')}
        >
          {success}
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
                    {formatDateWithTimezone(hackathon.startTime)} - 
                    {formatDateWithTimezone(hackathon.endTime)}
                  </Typography>
                  {hackathon.solution && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Submitted at: {formatDateWithTimezone(hackathon.solution.submissionTime!)}
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

      <SimpleGames />
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

// Simple TicTacToe Game
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  
  const calculateWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(board);
  const status = winner
    ? `Winner: ${winner}`
    : board.every(square => square)
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{status}</Typography>
      <Grid container spacing={1} sx={{ width: 300 }}>
        {board.map((square, i) => (
          <Grid item xs={4} key={i}>
            <Button
              variant="outlined"
              onClick={() => handleClick(i)}
              sx={{
                height: 80,
                width: '100%',
                fontSize: '2rem'
              }}
            >
              {square}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Button 
        sx={{ mt: 2 }}
        variant="contained"
        onClick={() => setBoard(Array(9).fill(null))}
      >
        Reset Game
      </Button>
    </Box>
  );
};

// Memory Game Component
const MemoryGame = () => {
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const numbers = [...Array(8)].map((_, i) => i).concat([...Array(8)].map((_, i) => i));
    setCards(numbers.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleClick = (index: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Moves: {moves}</Typography>
      <Grid container spacing={1} sx={{ maxWidth: 400 }}>
        {cards.map((number, index) => (
          <Grid item xs={3} key={index}>
            <Button
              variant="contained"
              sx={{
                height: 60,
                width: '100%',
                bgcolor: matched.includes(index) ? 'success.light' : 
                         flipped.includes(index) ? 'primary.main' : 'grey.300'
              }}
              onClick={() => handleClick(index)}
            >
              {(flipped.includes(index) || matched.includes(index)) && number}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" onClick={initializeGame}>
        New Game
      </Button>
    </Box>
  );
};

// Word Scramble Game
const WordScramble = () => {
  const words = ['HACKATHON', 'PROGRAMMING', 'DEVELOPER', 'JAVASCRIPT', 'TYPESCRIPT'];
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);

  const scrambleWord = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const newGame = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserInput('');
  };

  useEffect(() => {
    newGame();
  }, []);

  const handleSubmit = () => {
    if (userInput.toUpperCase() === currentWord) {
      setScore(s => s + 1);
      newGame();
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>Score: {score}</Typography>
      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
        {scrambledWord}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <input
          style={{
            padding: '10px',
            fontSize: '1.2rem',
            width: '200px',
            textAlign: 'center'
          }}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.toUpperCase())}
          placeholder="Enter your guess"
        />
      </Box>
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

// Main Games Component
const SimpleGames = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic game of X\'s and O\'s. Play with a teammate!',
      component: <TicTacToe />,
      icon: <SportsEsportsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Test your memory by matching pairs',
      component: <MemoryGame />,
      icon: <ExtensionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
    },
    {
      id: 'wordscramble',
      name: 'Word Scramble',
      description: 'Unscramble coding-related words',
      component: <WordScramble />,
      icon: <AbcIcon sx={{ fontSize: 40, color: 'success.main' }} />
    }
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quick Games While You Wait
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Play these simple games alone or with your teammates while waiting for your next hackathon!
      </Typography>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 6 
                }
              }}
              onClick={() => setSelectedGame(game.id)}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                p: 3
              }}>
                <Box sx={{ mb: 2 }}>
                  {game.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {game.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {game.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={!!selectedGame} 
        onClose={() => setSelectedGame(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {games.find(g => g.id === selectedGame)?.icon}
              <Typography variant="h6">
                {games.find(g => g.id === selectedGame)?.name}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setSelectedGame(null)}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'action.hover' 
                } 
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {games.find(g => g.id === selectedGame)?.component}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;