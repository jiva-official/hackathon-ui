import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../../services/auth';

interface TeamInfo {
  teamName: string;
  memberNames: string[];
  hasSolution: boolean;
}

interface Hackathon {
  hackathonId: string;
  hackathonName: string;
  startTime: string;
  endTime: string;
  active: boolean;
  teams: TeamInfo[];
}

const HackathonHistory = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await api.get('/hackathon/all');
        setHackathons(response.data.sort((a: Hackathon, b: Hackathon) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
      } catch (err) {
        setError('Failed to fetch hackathon history');
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Hackathon History
      </Typography>

      {hackathons.map((hackathon) => (
        <Accordion key={hackathon.hackathonId} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>
                {hackathon.hackathonName}
              </Typography>
              <Chip 
                label={hackathon.active ? 'Active' : 'Completed'}
                color={hackathon.active ? 'success' : 'default'}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(hackathon.startTime).toLocaleDateString()}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" gutterBottom>
                Start: {new Date(hackathon.startTime).toLocaleString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                End: {new Date(hackathon.endTime).toLocaleString()}
              </Typography>

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Name</TableCell>
                      <TableCell>Members</TableCell>
                      <TableCell>Solution Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hackathon.teams.map((team) => (
                      <TableRow key={team.teamName}>
                        <TableCell>{team.teamName}</TableCell>
                        <TableCell>{team.memberNames.join(', ')}</TableCell>
                        <TableCell>
                          <Chip
                            label={team.hasSolution ? 'Submitted' : 'Not Submitted'}
                            color={team.hasSolution ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default HackathonHistory;