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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUrls = () => {
    try {
      new URL(githubUrl); // Validate GitHub URL
      if (hostedUrl) new URL(hostedUrl); // Validate hosted URL if provided
      return true;
    } catch (e) {
      setError('Please enter valid URLs');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logs
    console.log('Form submission started');
    console.log('Team ID:', teamId);
    console.log('GitHub URL:', githubUrl);
    console.log('Hosted URL:', hostedUrl);

    if (!teamId) {
      setError('Team ID is missing');
      return;
    }

    if (!validateUrls()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Changed to send data in request body instead of query params
      const response = await api.post(`/hackathon/submit/${teamId}`, {
        githubUrl,
        hostedUrl
      });

      console.log('API Response:', response);
      
      if (response.data) {
        console.log('Response data:', response.data);
        setSuccess('Solution submitted successfully!');
        onSubmissionComplete();
      } else {
        throw new Error('No response data received');
      }
    } catch (err: any) {
      console.error('Detailed error:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to submit solution. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
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
          error={!!error && error.includes('URL')}
          helperText="Example: https://github.com/username/repository"
        />
        <TextField
          fullWidth
          label="Hosted Application URL (Optional)"
          value={hostedUrl}
          onChange={(e) => setHostedUrl(e.target.value)}
          sx={{ mb: 2 }}
          error={!!error && error.includes('URL')}
          helperText="Example: https://your-app.herokuapp.com"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!githubUrl || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SubmitSolution;