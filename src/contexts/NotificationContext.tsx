import { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showSuccess: () => {},
  showError: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const handleClose = () => setOpen(false);

  const showSuccess = useCallback((msg: string) => {
    setMessage(msg);
    setSeverity('success');
    setOpen(true);
  }, []);

  const showError = useCallback((msg: string) => {
    setMessage(msg);
    setSeverity('error');
    setOpen(true);
  }, []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);