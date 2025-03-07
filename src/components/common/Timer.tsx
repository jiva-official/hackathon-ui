import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface TimerProps {
  startTime: string;
  duration: number;
}

const Timer = ({ startTime, duration }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime();
      const end = start + (duration * 60 * 60 * 1000); // Convert hours to milliseconds
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        return 'Time Up!';
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration]);

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Typography variant="h4" color="primary">
        {timeLeft}
      </Typography>
    </Box>
  );
};

export default Timer;