import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../../services/auth';

interface TeamMember {
  name: string;
  email: string;
  college: string;
  leader: boolean;
}

interface UserProfile {
  id: string;
  teamName: string;
  username: string;
  email: string;
  teamMembers: TeamMember[];
  assignedProblemId: string | null;
  role: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditTeamName = () => {
    setNewTeamName(profile?.teamName || '');
    setEditDialogOpen(true);
  };

  const handleChangePassword = () => {
    setPasswordDialog(true);
  };

  if (loading) return <CircularProgress />;
  if (!profile) return <Alert severity="error">Failed to load profile</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Team Information</Typography>
              <Button variant="outlined" onClick={handleEditTeamName}>
                Edit Team Name
              </Button>
            </Box>
            <Typography><strong>Team Name:</strong> {profile.teamName}</Typography>
            <Typography><strong>Username:</strong> {profile.username}</Typography>
            <Typography><strong>Email:</strong> {profile.email}</Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleChangePassword}>
                Change Password
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Team Members</Typography>
            <List>
              {profile.teamMembers.map((member, index) => (
                <div key={member.email}>
                  <ListItem>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <>
                          <Typography variant="body2">Email: {member.email}</Typography>
                          <Typography variant="body2">College: {member.college}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < profile.teamMembers.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit Team Name Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Team Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Team Name"
            fullWidth
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={() => setPasswordDialog(false)} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;