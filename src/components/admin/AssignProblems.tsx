import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { api } from '../../services/auth';
import { useTheme } from '@mui/material/styles';

interface User {
  id: number;
  username: string;
  assignedProblemId: number | null;
}

// First update the Problem interface to match MongoDB IDs
interface Problem {
  id: string;  // Change to string for MongoDB ObjectId
  title: string;
}

interface Team {
  teamName: string;
  memberNames: string[];
  hasSolution: boolean;
  selectedProblemTitle: string;
}

interface Hackathon {
  hackathonId: string;
  hackathonName: string;
  startTime: string;
  endTime: string;
  active: boolean;
  teams: Team[];
}

const AssignProblems = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsResponse, hackathonsResponse, usersResponse] = await Promise.all([
          api.get('/hackathon/problems'),
          api.get('/hackathon/all'),
          api.get('/users')  // Add users endpoint
        ]);

        setProblems(problemsResponse.data);
        setUsers(usersResponse.data);
        
        const activeHackathons = hackathonsResponse.data.filter((hackathon: Hackathon) => {
          const now = new Date();
          const endTime = new Date(hackathon.endTime);
          return hackathon.active && endTime > now;
        });
        
        setActiveHackathons(activeHackathons);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Update the handleAssign function to properly use the problem ID
  const handleAssign = async (teamName: string) => {
    if (!selectedHackathon || !selectedProblem) {
      setError('Please select both hackathon and problem');
      return;
    }
  
    try {
      const problemToAssign = problems.find(p => p.id === selectedProblem);
      if (!problemToAssign) {
        setError('Selected problem not found');
        return;
      }
  
      // Process all users in parallel using Promise.all
      await Promise.all(users.map(async (user) => {
        const response = await api.post(
          `/users/${user.id}/problem/${problemToAssign.id}/${selectedHackathon}`
        );
        
        if (response.status !== 200) {
          console.error(`Error assigning problem to user ${user.id}:`, response);
          return false;
        }
        return true;
      }));
  
      // Update UI immediately after successful assignment
      setSelectedTeams(prevTeams => 
        prevTeams.map(t => 
          t.teamName === teamName 
            ? {
                ...t,
                selectedProblemTitle: problemToAssign.title,
                hasSolution: false
              }
            : t
        )
      );
  
      // Update active hackathons state
      setActiveHackathons(prevHackathons => 
        prevHackathons.map(h => 
          h.hackathonId === selectedHackathon
            ? {
                ...h,
                teams: h.teams.map(t => 
                  t.teamName === teamName
                    ? {
                        ...t,
                        selectedProblemTitle: problemToAssign.title,
                        hasSolution: false
                      }
                    : t
                )
              }
            : h
        )
      );
  
      setSuccessMessage('Problem assigned successfully');
      setSelectedProblem('');
      setTimeout(() => setSuccessMessage(''), 3000);
  
    } catch (err) {
      console.error('Assignment error:', err);
      setError('Failed to assign problem. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleHackathonChange = (hackathonId: string) => {
    setSelectedHackathon(hackathonId);
    const selectedHackathon = activeHackathons.find(h => h.hackathonId === hackathonId);
    setSelectedTeams(selectedHackathon?.teams || []);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assign Problems to Teams
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Active Hackathon</InputLabel>
          <Select
            value={selectedHackathon}
            onChange={(e) => handleHackathonChange(e.target.value)}
            label="Select Active Hackathon"
          >
            {activeHackathons.map((hackathon) => (
              <MenuItem key={hackathon.hackathonId} value={hackathon.hackathonId}>
                {hackathon.hackathonName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedHackathon && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Name</TableCell>
                <TableCell>Team Members</TableCell>
                <TableCell>Current Problem</TableCell>
                <TableCell>Assign Problem</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedTeams.map((team) => (
                <TableRow 
                  key={team.teamName}
                  sx={{ 
                    backgroundColor: team.hasSolution
                      ? theme.palette.success.light
                      : team.selectedProblemTitle !== "Not selected"
                      ? theme.palette.info.light
                      : 'inherit'
                  }}
                >
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell>{team.memberNames.join(', ')}</TableCell>
                  <TableCell>{team.selectedProblemTitle}</TableCell>
                  <TableCell>
                    <FormControl 
                      fullWidth
                      disabled={team.hasSolution || team.selectedProblemTitle !== "Not selected"}
                    >
                      <Select
                        value={selectedProblem}
                        onChange={(e) => setSelectedProblem(e.target.value as string)}
                        displayEmpty
                      >
                        <MenuItem value="">Select Problem</MenuItem>
                        {problems.map((problem) => (
                          <MenuItem key={problem.id} value={problem.id}>
                            {problem.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={team.hasSolution || team.selectedProblemTitle !== "Not selected" || !selectedProblem}
                        onClick={() => handleAssign(team.teamName)}
                      >
                        Assign
                      </Button>
                      <Chip 
                        label={team.hasSolution ? "Solution Submitted" 
                              : team.selectedProblemTitle !== "Not selected" 
                              ? "Problem Assigned"
                              : "No Problem Assigned"}
                        color={team.hasSolution ? "success" 
                              : team.selectedProblemTitle !== "Not selected"
                              ? "primary"
                              : "default"}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AssignProblems;