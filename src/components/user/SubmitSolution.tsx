import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import { api } from '../../services/auth';

interface SubmitSolutionProps {
  teamId: string;
  onSubmissionComplete: () => void;
}

const SubmitSolution = ({ teamId, onSubmissionComplete }: SubmitSolutionProps) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/hackathon/submit/${teamId}`, null, {
        params: {
          githubUrl,
          hostedUrl
        }
      });
      setSuccess('Solution submitted successfully!');
      setError('');
      onSubmissionComplete();
    } catch (err) {
      setError('Failed to submit solution');
      setSuccess('');
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Solution
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="GitHub Repository URL"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Hosted Application URL (Optional)"
          value={hostedUrl}
          onChange={(e) => setHostedUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!githubUrl}
        >
          Submit Solution
        </Button>
      </Box>
    </Paper>
  );
};

export default SubmitSolution;