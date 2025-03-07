import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    Alert,
    Chip,
    Grid
} from '@mui/material';
import { api } from '../../services/auth';

interface Team {
    id: string;
    teamName: string;
}

const StartHackathon = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [hackathonName, setHackathonName] = useState('');
    const [duration, setDuration] = useState<number>(24);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/users');
                setTeams(response.data.filter((user: any) => user.role === 'ROLE_USER'));
            } catch (error) {
                setError('Failed to fetch teams');
            }
        };
        fetchTeams();
    }, []);

    const handleStartHackathon = async () => {
        try {
            await api.post('/hackathon/start', null, {
                params: {
                    hackathonName,
                    teamIds: selectedTeams,
                    durationInHours: duration
                }
            });
            setSuccess('Hackathon started successfully!');
            setError('');
        } catch (err) {
            setError('Failed to start hackathon');
            setSuccess('');
        }
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Start Hackathon
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Box component="form" noValidate autoComplete="off">
                <TextField
                    label="Hackathon Name"
                    value={hackathonName}
                    onChange={(e) => setHackathonName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Duration (hours)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Teams</InputLabel>
                    <Select
                        multiple
                        value={selectedTeams}
                        onChange={(e) => setSelectedTeams(e.target.value as string[])}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={teams.find((team) => team.id === value)?.teamName} />
                                ))}
                            </Box>
                        )}
                    >
                        {teams.map((team) => (
                            <MenuItem key={team.id} value={team.id}>
                                {team.teamName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleStartHackathon}>
                    Start Hackathon
                </Button>
            </Box>
        </Paper>
    );
};

export default StartHackathon;