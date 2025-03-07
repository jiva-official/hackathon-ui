import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { api } from '../../services/auth';

interface TeamMember {
  name: string;
  email: string;
  college: string;
  leader: boolean;
}

interface Team {
  id: string;
  teamName: string;
  username: string;
  email: string;
  teamMembers: TeamMember[];
  assignedProblemId?: string;
  submissionUrl?: string;
  hostedUrl?: string;
}

const TeamRow = ({ team }: { team: Team }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{team.teamName}</TableCell>
        <TableCell>{team.email}</TableCell>
        <TableCell>{team.teamMembers.length}</TableCell>
        <TableCell>
          {team.assignedProblemId ? (
            <Chip label="Problem Assigned" color="primary" />
          ) : (
            <Chip label="No Problem" />
          )}
        </TableCell>
        <TableCell>
          {team.submissionUrl ? (
            <Chip label="Submitted" color="success" />
          ) : (
            <Chip label="Not Submitted" />
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Team Members
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>College</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team.teamMembers.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.college}</TableCell>
                      <TableCell>
                        {member.leader ? 'Team Leader' : 'Member'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      </>
    );
  };
  
  export default TeamRow;