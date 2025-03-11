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
  Button,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from '@mui/material';
import { api } from '../../services/auth';

interface TeamMember {
  name: string;
  email: string;
  college: string;
  leader: boolean;
}

interface HackathonParticipation {
  hackathonId: string;
  hackathonName: string;
  startTime: string;
  endTime: string;
  active: boolean;
  solution?: {
    githubUrl: string;
    hostedUrl?: string;
    submissionTime: string;
  } | null;
  selectedProblem?: {
    id: string;
    title: string;
  } | null;
}

interface Team {
  id: string;
  teamName: string;
  username: string;
  email: string;
  teamMembers: TeamMember[];
  hackathonParticipations: HackathonParticipation[];
}

const HackathonSelector = ({ participations, onSelect }: {
  participations: HackathonParticipation[];
  onSelect: (hackathonId: string) => void;
}) => {
  const [selectedHackathon, setSelectedHackathon] = useState<string>('all');

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="hackathon-select-label">Filter by Hackathon</InputLabel>
        <Select
          labelId="hackathon-select-label"
          value={selectedHackathon}
          label="Filter by Hackathon"
          onChange={(e) => {
            setSelectedHackathon(e.target.value);
            onSelect(e.target.value);
          }}
        >
          <MenuItem value="all">All Hackathons</MenuItem>
          {participations.map(h => (
            <MenuItem key={h.hackathonId} value={h.hackathonId}>
              {h.hackathonName} ({new Date(h.startTime).toLocaleDateString()})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

interface TeamCardProps {
  team: Team;
  selectedHackathonId: string;
  onTeamClick: (teamId: string) => void;
}

const TeamCard = ({ team, selectedHackathonId, onTeamClick }: TeamCardProps) => {
  const participation = selectedHackathonId === 'all' 
    ? null 
    : team.hackathonParticipations.find(h => h.hackathonId === selectedHackathonId);

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 }
      }}
      onClick={() => onTeamClick(team.id)}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {team.teamName}
        </Typography>
        <Typography color="text.secondary">
          Members: {team.teamMembers.length}
        </Typography>
        {participation && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={participation.active ? "Active" : "Completed"}
              color={participation.active ? "success" : "default"}
              size="small"
              sx={{ mr: 1 }}
            />
            {participation.solution && (
              <Chip 
                label="Solution Submitted"
                color="primary"
                size="small"
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const TeamDetailDialog = ({ team, onClose }: { 
  team: Team | null; 
  onClose: () => void;
}) => {
  const sortedParticipations = team?.hackathonParticipations
    .slice()
    .sort((a, b) => {
      // Sort by active status first (active ones on top)
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      
      // Then sort by start time (most recent first)
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

  return (
    <Dialog open={!!team} onClose={onClose} maxWidth="md" fullWidth>
      {team && (
        <>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              Team Details: {team.teamName}
              {team.hackathonParticipations.some(h => h.active) && (
                <Chip 
                  label="Active Hackathon" 
                  color="success" 
                  size="small" 
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {/* Basic Info */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Team Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography><strong>Username:</strong> {team.username}</Typography>
                  <Typography><strong>Email:</strong> {team.email}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Hackathon Participations */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Hackathon Participations ({team.hackathonParticipations.length})
              </Typography>
              <List>
                {sortedParticipations?.map((participation) => (
                  <ListItem 
                    key={participation.hackathonId} 
                    divider 
                    sx={{
                      backgroundColor: participation.active ? 'action.selected' : 'inherit'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {participation.hackathonName}
                          <Chip 
                            label={participation.active ? "Active" : "Completed"}
                            color={participation.active ? "success" : "default"}
                            size="small"
                          />
                          {participation.solution && (
                            <Chip 
                              label="Solution Submitted"
                              color="primary"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                Start: {new Date(participation.startTime).toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                End: {new Date(participation.endTime).toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                          {participation.selectedProblem && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Problem:</strong> {participation.selectedProblem.title}
                            </Typography>
                          )}
                          {participation.solution && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="primary">
                                <strong>Submitted:</strong> {new Date(participation.solution.submissionTime).toLocaleString()}
                              </Typography>
                              <Box sx={{ mt: 0.5, display: 'flex', gap: 2 }}>
                                <Link 
                                  href={participation.solution.githubUrl} 
                                  target="_blank"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  GitHub Repository
                                </Link>
                                {participation.solution.hostedUrl && (
                                  <Link 
                                    href={participation.solution.hostedUrl} 
                                    target="_blank"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                  >
                                    Hosted Application
                                  </Link>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Team Members */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Team Members</Typography>
              <List>
                {team.teamMembers.map((member) => (
                  <ListItem key={member.email}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {member.name}
                          {member.leader && (
                            <Chip label="Leader" color="primary" size="small" />
                          )}
                        </Box>
                      }
                      secondary={`${member.email} - ${member.college}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};


const ManageTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState('all');
  const [, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

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


  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
      await api.delete(`/users/${teamToDelete.id}`);
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
      // Close details dialog if the deleted team was being viewed
      if (selectedTeam?.id === teamToDelete.id) {
        setDialogOpen(false);
        setSelectedTeam(null);
      }
    } catch (err) {
      setError('Failed to delete team');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <HackathonSelector 
        participations={Array.from(new Set(
          teams.flatMap(t => t.hackathonParticipations)
        ))}
        onSelect={setSelectedHackathonId}
      />

      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <TeamCard 
              team={team} 
              selectedHackathonId={selectedHackathonId}
              onTeamClick={handleTeamClick}
            />
          </Grid>
        ))}
      </Grid>

      <TeamDetailDialog 
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete team "{teamToDelete?.teamName}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageTeams;