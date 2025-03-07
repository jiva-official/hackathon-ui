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
  CircularProgress
} from '@mui/material';
import { api } from '../../services/auth';

interface User {
  id: number;
  username: string;
  assignedProblemId: number | null;
}

interface Problem {
  id: number;
  title: string;
}

const AssignProblems = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<number | ''>('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, problemsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/hackathon/problems')
        ]);
        setUsers(usersResponse.data);
        setProblems(problemsResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (userId: number) => {
    if (!selectedProblem) {
      setError('Please select a problem first');
      return;
    }

    try {
      await api.post(`/users/${userId}/problem/${selectedProblem}`);
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, assignedProblemId: selectedProblem as number }
          : user
      ));
      setSuccessMessage('Problem assigned successfully');
      setSelectedProblem('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to assign problem');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assign Problems to Teams
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell>Current Problem</TableCell>
              <TableCell>Assign Problem</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                sx={{ 
                  backgroundColor: user.assignedProblemId ? '#f5f5f5' : 'inherit'
                }}
              >
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.assignedProblemId 
                    ? problems.find(p => p.id === user.assignedProblemId)?.title 
                    : 'No problem assigned'}
                </TableCell>
                <TableCell>
                  <FormControl 
                    fullWidth
                    disabled={Boolean(user.assignedProblemId)}
                  >
                    <InputLabel>Select Problem</InputLabel>
                    <Select
                      value={selectedProblem}
                      onChange={(e) => setSelectedProblem(e.target.value as number)}
                      label="Select Problem"
                    >
                      {problems.map((problem) => (
                        <MenuItem key={problem.id} value={problem.id}>
                          {problem.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleAssign(user.id)}
                    disabled={Boolean(user.assignedProblemId)}
                  >
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssignProblems;