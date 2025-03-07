import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Grid
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    teamName: '',
    teamMembers: [
      { name: '', email: '', college: '', leader: true },  // First member is always leader
      { name: '', email: '', college: '', leader: false },
      { name: '', email: '', college: '', leader: false },
      { name: '', email: '', college: '', leader: false },
    ]
  });

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index] = { 
      ...updatedMembers[index], 
      [field]: value,
      leader: index === 0  // Ensure first member is always leader
    };
    setFormData({ ...formData, teamMembers: updatedMembers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      showSuccess('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      showError('Registration failed. Please try again.');
      setError('Registration failed. Please check your details.');
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Team Registration
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <TextField
                required
                fullWidth
                label="Team Name"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              />
              <TextField
                required
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Team Members
            </Typography>

            {formData.teamMembers.map((member, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {index === 0 ? 'Team Leader' : `Member ${index + 1}`}
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <TextField
                    required
                    label="Name"
                    value={member.name}
                    onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                  />
                  <TextField
                    required
                    label="Email"
                    type="email"
                    value={member.email}
                    onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                  />
                  <TextField
                    required
                    label="College"
                    value={member.college}
                    onChange={(e) => handleTeamMemberChange(index, 'college', e.target.value)}
                  />
                </Box>
              </Box>
            ))}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register Team
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;