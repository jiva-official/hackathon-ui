import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../../services/auth';

interface ProblemDetailsProps {
  problemId: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  track: string;
  requirements: string;
  releaseDate: string;
  deadline?: string;
}

const ProblemDetails = ({ problemId }: ProblemDetailsProps) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/hackathon/problems/${problemId}`);
        setProblem(response.data);
      } catch (err) {
        setError('Failed to fetch problem details');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!problem) return <Alert severity="info">No problem found</Alert>;

  const requirements = problem.requirements.split('\n').filter(req => req.trim());

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {problem.title}
        </Typography>
        <Chip label={problem.track} color="primary" sx={{ mb: 2 }} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        Description
      </Typography>
      <Typography paragraph>
        {problem.description}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Requirements
      </Typography>
      <List>
        {requirements.map((requirement, index) => (
          <ListItem key={index}>
            <ListItemText primary={requirement} />
          </ListItem>
        ))}
      </List>

      {problem.deadline && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Deadline: {new Date(problem.deadline).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProblemDetails;