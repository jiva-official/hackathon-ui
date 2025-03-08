import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { api } from '../../services/auth';

interface Team {
  teamName: string;
  memberNames: string[];
  hasSolution: boolean;
  selectedProblemTitle: string;
}

interface Hackathon {
  hackathonId: string;
  hackathonName: string;
  startTime: string;
  endTime: string;
  active: boolean;
  teams: Team[];
}

interface TeamDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  teams: Team[];
  hackathonName: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TeamDetailsDialog = ({ open, onClose, teams, hackathonName }: TeamDetailsDialogProps) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>
      Teams in {hackathonName}
    </DialogTitle>
    <DialogContent>
      <List>
        {teams.map((team) => (
          <ListItem
            key={team.teamName}
            divider
            sx={{
              backgroundColor: team.hasSolution ? 'success.light' : 'inherit',
              '&:hover': {
                backgroundColor: team.hasSolution ? 'success.light' : 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={team.teamName}
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    Members: {team.memberNames.join(', ')}
                  </Typography>
                  <br />
                  <Typography variant="body2" component="span">
                    Problem: {team.selectedProblemTitle}
                  </Typography>
                  <br />
                  <Typography 
                    variant="body2" 
                    component="span"
                    color={team.hasSolution ? 'success.main' : 'error.main'}
                  >
                    {team.hasSolution ? 'Solution Submitted' : 'No Solution Submitted'}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const HackathonHistory = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [selectedHackathonName, setSelectedHackathonName] = useState('');

  const validateHackathonStatus = (hackathon: Hackathon): boolean => {
    const now = new Date();
    const endTime = new Date(hackathon.endTime);
    const allTeamsSubmitted = hackathon.teams.every(team => team.hasSolution);
    
    // A hackathon should be active if:
    // 1. It's marked as active AND
    // 2. Current time is before end time AND
    // 3. Not all teams have submitted solutions
    return hackathon.active && endTime > now && !allTeamsSubmitted;
  };

  const fetchHackathons = async () => {
    try {
      const response = await api.get('/hackathon/all');
      const validatedHackathons = response.data.map((hackathon: Hackathon) => ({
        ...hackathon,
        active: validateHackathonStatus(hackathon)
      }));

      // Sort by start time (newest first)
      const sortedHackathons = validatedHackathons.sort((a: Hackathon, b: Hackathon) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setHackathons(sortedHackathons);
    } catch (err) {
      setError('Failed to fetch hackathon history');
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleCloseHackathon = async () => {
    if (!selectedHackathon) return;
    try {
      await api.post(`/hackathon/close/${selectedHackathon.hackathonId}`, {
        endedByOrganizer: true
      });
      await fetchHackathons();
      setConfirmDialog(false);
      setSelectedHackathon(null);
    } catch (err) {
      setError('Failed to close hackathon');
    }
  };

  const openConfirmDialog = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setConfirmDialog(true);
  };

  const handleViewTeams = (hackathon: Hackathon) => {
    setSelectedTeams(hackathon.teams);
    setSelectedHackathonName(hackathon.hackathonName);
    setTeamDetailsOpen(true);
  };

  const getHackathonStatus = (hackathon: Hackathon) => {
    const now = new Date();
    const endTime = new Date(hackathon.endTime);
    const allTeamsSubmitted = hackathon.teams.every(team => team.hasSolution);

    if (hackathon.active && endTime > now && !allTeamsSubmitted) {
      return {
        label: 'Active',
        color: 'success' as const
      };
    } else if (allTeamsSubmitted) {
      return {
        label: 'All Solutions Submitted',
        color: 'info' as const
      };
    } else if (endTime <= now) {
      return {
        label: 'Ended',
        color: 'default' as const
      };
    }
    return {
      label: 'Completed',
      color: 'default' as const
    };
  };

  const activeHackathons = hackathons.filter(h => h.active);
  const pastHackathons = hackathons.filter(h => !h.active);

  const renderHackathonCard = (hackathon: Hackathon) => {
    const status = getHackathonStatus(hackathon);
    const teamsWithSolutions = hackathon.teams.filter(team => team.hasSolution).length;
    const totalTeams = hackathon.teams.length;

    return (
      <Grid item xs={12} md={6} lg={4} key={hackathon.hackathonId}>
        <Paper 
          sx={{ 
            p: 3, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderLeft: (theme) => hackathon.active ? 
              `4px solid ${theme.palette.success.main}` : 
              `4px solid ${theme.palette.grey[300]}`
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              {hackathon.hackathonName}
            </Typography>
            <Box>
              <Tooltip title="View Teams">
                <IconButton 
                  size="small" 
                  onClick={() => handleViewTeams(hackathon)}
                  sx={{ mr: 1 }}
                >
                  <GroupIcon />
                </IconButton>
              </Tooltip>
              <Chip 
                label={status.label}
                color={status.color}
                size="small"
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Started: {formatDate(hackathon.startTime)}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ends: {formatDate(hackathon.endTime)}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Solutions: {teamsWithSolutions}/{totalTeams} teams
          </Typography>

          {hackathon.active && (
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button 
                fullWidth
                variant="contained" 
                color="error"
                onClick={() => openConfirmDialog(hackathon)}
              >
                Close Hackathon
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {activeHackathons.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>Active Hackathons</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {activeHackathons.map(renderHackathonCard)}
          </Grid>
        </>
      )}

      {pastHackathons.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>Past Hackathons</Typography>
          <Grid container spacing={3}>
            {pastHackathons.map(renderHackathonCard)}
          </Grid>
        </>
      )}

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Close Hackathon</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to close this hackathon? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleCloseHackathon} color="error" variant="contained">
            Close Hackathon
          </Button>
        </DialogActions>
      </Dialog>

      <TeamDetailsDialog
        open={teamDetailsOpen}
        onClose={() => setTeamDetailsOpen(false)}
        teams={selectedTeams}
        hackathonName={selectedHackathonName}
      />

      {hackathons.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No hackathons found
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default HackathonHistory;