import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { api } from '../../services/auth';

interface TeamMember {
  name: string;
  email: string;
  college: string;
  leader: boolean;
}

interface Team {
  id: string;  // This is the userId
  teamName: string;
  username: string;
  email: string;
  teamMembers: TeamMember[];
  assignedProblemId: string | null;
  submissionUrl: string | null;
  hostedUrl: string | null;
  solutionSubmitted: boolean;
}

const ManageTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/users');
        setTeams(response.data);
      } catch (err) {
        setError('Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleTeamClick = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setSelectedTeam(response.data);
      setDialogOpen(true);
    } catch (err) {
      setError('Failed to fetch team details');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => handleTeamClick(team.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {team.teamName}
                </Typography>
                <Typography color="text.secondary">
                  Username: {team.username}
                </Typography>
                <Typography color="text.secondary">
                  Members: {team.teamMembers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTeam && (
          <>
            <DialogTitle>
              Team Details: {selectedTeam.teamName}
            </DialogTitle>
            <DialogContent>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Username:</strong> {selectedTeam.username}</Typography>
                    <Typography><strong>Email:</strong> {selectedTeam.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Problem Status:</strong>{' '}
                      {selectedTeam.assignedProblemId ? 'Assigned' : 'Not Assigned'}
                    </Typography>
                    <Typography>
                      <strong>Solution Status:</strong>{' '}
                      {selectedTeam.solutionSubmitted ? 'Submitted' : 'Not Submitted'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Team Members</Typography>
                <List>
                  {selectedTeam.teamMembers.map((member, index) => (
                    <div key={member.email}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {member.name}
                              {member.leader && (
                                <Chip label="Leader" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2">
                                Email: {member.email}
                              </Typography>
                              <Typography variant="body2">
                                College: {member.college}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < selectedTeam.teamMembers.length - 1 && <Divider />}
                    </div>
                  ))}
                </List>
              </Paper>

              {(selectedTeam.submissionUrl || selectedTeam.hostedUrl) && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Submission Details</Typography>
                  {selectedTeam.submissionUrl && (
                    <Typography>
                      <strong>Submission URL:</strong>{' '}
                      <a href={selectedTeam.submissionUrl} target="_blank" rel="noopener noreferrer">
                        {selectedTeam.submissionUrl}
                      </a>
                    </Typography>
                  )}
                  {selectedTeam.hostedUrl && (
                    <Typography>
                      <strong>Hosted URL:</strong>{' '}
                      <a href={selectedTeam.hostedUrl} target="_blank" rel="noopener noreferrer">
                        {selectedTeam.hostedUrl}
                      </a>
                    </Typography>
                  )}
                </Paper>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ManageTeams;