import { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';

interface ProblemFormData {
  title: string;
  description: string;
  releaseDate: string;
  requirements: string;
  deadline: string;
  track: string;
}

// Memoized Problem Card component
const ProblemCard = memo(({ problem, onDelete }: { 
  problem: any; 
  onDelete: (id: string) => void 
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Typography variant="h6" noWrap>{problem.title}</Typography>
        <IconButton 
          onClick={() => onDelete(problem.id)} 
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <Typography color="textSecondary" gutterBottom noWrap>
        Track: {problem.track}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {problem.description}
      </Typography>
    </CardContent>
  </Card>
));

const ManageProblems = () => {
  const { showSuccess, showError } = useNotification();
  const [problems, setProblems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    description: '',
    releaseDate: new Date().toISOString().split('T')[0],
    requirements: '',
    deadline: '',
    track: ''
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await api.get('/hackathon/problems');
      setProblems(response.data);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format dates to match API requirements
      const payload = {
        ...formData,
        releaseDate: new Date(formData.releaseDate).toISOString(),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
      };

      const response = await api.post('/hackathon/problems', payload);
      
      if (response.status === 200) {
        showSuccess('Problem statement added successfully!');
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          releaseDate: new Date().toISOString().split('T')[0],
          requirements: '',
          deadline: '',
          track: ''
        });
        fetchProblems();
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add problem statement');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/hackathon/problems/${id}`);
      setProblems(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      showError('Failed to delete problem');
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
      >
        Add New Problem
      </Button>

      <Grid container spacing={2}>
        {problems.map((problem: any) => (
          <Grid item xs={12} sm={6} md={4} key={problem.id}>
            <ProblemCard problem={problem} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Problem Statement</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Problem Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Track"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="datetime-local"
                  label="Release Date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Deadline (Optional)"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Problem'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(ManageProblems);