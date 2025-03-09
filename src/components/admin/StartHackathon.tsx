import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { api } from '../../services/auth';

interface Team {
  id: string;
  teamName: string;
  hackathonParticipations?: {
    active: boolean;
  }[];
}

const StartHackathon = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [hackathonName, setHackathonName] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, setActiveHackathons] = useState([]);

  const isTeamInActiveHackathon = (team: Team) => {
    return team.hackathonParticipations?.some(h => h.active) ?? false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsResponse, hackathonsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/hackathon/all')
        ]);

        const teamsWithStatus = teamsResponse.data.map((team: Team) => ({
          ...team,
          hasActiveHackathon: team.hackathonParticipations?.some(h => h.active) ?? false
        }));
        setTeams(teamsWithStatus);

        // Filter active hackathons
        const active = hackathonsResponse.data.filter((h: any) => h.active);
        setActiveHackathons(active);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleStartHackathon = async () => {
    if (!hackathonName || !duration || selectedTeams.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await api.post('/hackathon/start', null, {
        params: {
          hackathonName,
          teamNames: selectedTeams.join(','),
          durationInHours: parseInt(duration)
        }
      });
      setSuccess('Hackathon started successfully!');
      // Reset form
      setHackathonName('');
      setDuration('');
      setSelectedTeams([]);
    } catch (err) {
      setError('Failed to start hackathon');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Start New Hackathon
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Hackathon Name"
          value={hackathonName}
          onChange={(e) => setHackathonName(e.target.value)}
          required
        />

        <TextField
          label="Duration (hours)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />

        <FormControl>
          <InputLabel>Select Teams</InputLabel>
          <Select
            multiple
            value={selectedTeams}
            onChange={(event: SelectChangeEvent<string[]>) => {
              const value = event.target.value;
              // Handle array of selected values
              const selectedValues = typeof value === 'string' ? value.split(',') : value;
              // Filter out any teams that are in active hackathons
              const validSelections = selectedValues.filter(teamName => {
                const team = teams.find(t => t.teamName === teamName);
                return team && !isTeamInActiveHackathon(team);
              });
              setSelectedTeams(validSelections);
            }}
            input={<OutlinedInput label="Select Teams" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((teamName) => (
                  <Chip 
                    key={teamName} 
                    label={teamName}
                    onDelete={() => {
                      setSelectedTeams(prev => prev.filter(t => t !== teamName));
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation(); // Prevent Select from opening when clicking delete
                    }}
                  />
                ))}
              </Box>
            )}
          >
            {teams.map((team) => (
              <MenuItem 
                key={team.id} 
                value={team.teamName}
                disabled={isTeamInActiveHackathon(team)}
                sx={{
                  opacity: 1, // Remove opacity change
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    // Keep text content faded but not the chip
                    '& .MuiTypography-root': {
                      opacity: 0.5
                    },
                    // Ensure chip stays visible
                    '& .MuiChip-root': {
                      opacity: 1,
                      zIndex: 1  // Ensure chip appears above other content
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography>{team.teamName}</Typography>
                  {isTeamInActiveHackathon(team) && (
                    <Chip 
                      label="In Active Hackathon" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        backgroundColor: '#e8f5e9',  // Light green background
                        color: '#2e7d32',           // Darker green text for contrast
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleStartHackathon}
          disabled={!hackathonName || !duration || selectedTeams.length === 0}
        >
          Start Hackathon
        </Button>
      </Box>
    </Paper>
  );
};

export default StartHackathon;