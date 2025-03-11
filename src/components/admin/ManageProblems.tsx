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
  Chip
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

// Add this utility function at the top of the file, after imports
const formatDateForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

// Memoized Problem Card component
const ProblemCard = memo(({ problem, onDelete, onClick }: { 
  problem: any; 
  onDelete: (id: string) => void;
  onClick: (problem: any) => void;
}) => (
  <Card 
    sx={{ 
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      }
    }}
    onClick={() => onClick(problem)}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {problem.title}
        </Typography>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(problem.id);
          }} 
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 1, mb: 2 }}>
        <Chip 
          label={problem.track}
          size="small"
          color="secondary"
          sx={{ mr: 1 }}
        />
        <Chip
          label={new Date(problem.releaseDate).toLocaleDateString()}
          size="small"
          variant="outlined"
        />
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary"
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

const ProblemDetailDialog = memo(({ problem, open, onClose }: {
  problem: any;
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{problem?.title}</Typography>
        <Chip label={problem?.track} color="secondary" />
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Release Date
            </Typography>
            <Typography>
              {new Date(problem?.releaseDate).toLocaleString()}
            </Typography>
          </Grid>
          {problem?.deadline && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Deadline
              </Typography>
              <Typography>
                {new Date(problem?.deadline).toLocaleString()}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {problem?.description}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Requirements
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {problem?.requirements}
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
));

const ManageProblems = () => {
  const { showSuccess, showError } = useNotification();
  const [problems, setProblems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    description: '',
    releaseDate: formatDateForInput(new Date()), // Initialize with current date and time
    requirements: '',
    deadline: '',
    track: ''
  });
  const [selectedProblem, setSelectedProblem] = useState<any>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await api.get('/hackathon/problems');
      if (response.status === 200) {
        setProblems(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch problems:', error);
      showError('Failed to load problems');
    }
  };

  const validateForm = (data: ProblemFormData): string | null => {
    if (!data.title.trim()) return 'Title is required';
    if (!data.description.trim()) return 'Description is required';
    if (!data.track.trim()) return 'Track is required';
    if (!data.requirements.trim()) return 'Requirements are required';
    if (!data.releaseDate) return 'Release date is required';
    
    // Validate dates
    const release = new Date(data.releaseDate);
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (deadline <= release) {
        return 'Deadline must be after release date';
      }
    }
    
    return null;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm(formData);
    if (validationError) {
      showError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      // Ensure dates are in ISO format with time
      const formatDateForApi = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toISOString();
      };

      const payload = {
        ...formData,
        releaseDate: formatDateForApi(formData.releaseDate),
        deadline: formData.deadline ? formatDateForApi(formData.deadline) : null,
      };

      console.log('Sending payload:', payload); // For debugging

      const response = await api.post('/hackathon/problems', payload);
      
      if (response.status === 200) {
        showSuccess('Problem statement added successfully!');
        setOpen(false);
        // Reset form with proper date format
        setFormData({
          title: '',
          description: '',
          releaseDate: formatDateForInput(new Date()),
          requirements: '',
          deadline: '',
          track: ''
        });
        await fetchProblems(); // Refresh the list
      }
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      showError(error.response?.data?.message || 'Failed to add problem statement');
    } finally {
      setLoading(false);
    }
  }, [formData, showSuccess, showError]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/hackathon/problems/${id}`);
      setProblems(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      showError('Failed to delete problem');
    }
  }, []);

  const handleProblemClick = useCallback((problem: any) => {
    setSelectedProblem(problem);
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
            <ProblemCard 
              problem={problem} 
              onDelete={handleDelete}
              onClick={handleProblemClick}
            />
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
                  inputProps={{
                    min: formatDateForInput(new Date()) // Prevent past dates
                  }}
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
                  inputProps={{
                    min: formData.releaseDate // Prevent deadline before release date
                  }}
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

      <ProblemDetailDialog
        problem={selectedProblem}
        open={!!selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />
    </Box>
  );
};

export default memo(ManageProblems);