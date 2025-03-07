import { Box, Typography, Button } from '@mui/material';

const ErrorPage = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Oops! Something went wrong.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        We're sorry, but there was an error processing your request.
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleGoHome}
        size="large"
      >
        Go Back Home
      </Button>
    </Box>
  );
};

export default ErrorPage;