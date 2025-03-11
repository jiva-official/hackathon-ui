import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme as useMuiTheme } from '@mui/material/styles';

// Add these types at the top of the file
interface MenuItem {
  text: string;
  path?: string;
  action?: () => void;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const menuItems: MenuItem[] = [
    { text: 'Home', path: '/' },
  ];

  const authItems: MenuItem[] = isAuthenticated
    ? [{ text: 'Logout', action: handleLogout }]
    : [
        { text: 'Login', path: '/login' },
        { text: 'Register', path: '/register' },
      ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CodeSurge Hackathon
          </Typography>
          {!isMobile && (
            <>
              {menuItems.map((item) => (
                <Button color="inherit" component={Link} to={item.path!} key={item.text}>
                  {item.text}
                </Button>
              ))}
              {authItems.map((item) => (
                item.path ? (
                  <Button color="inherit" component={Link} to={item.path} key={item.text}>
                    {item.text}
                  </Button>
                ) : (
                  <Button color="inherit" onClick={item.action} key={item.text}>
                    {item.text}
                  </Button>
                )
              ))}
            </>
          )}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      {isMobile && (
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
              {menuItems.map((item) => (
                <ListItem button component={Link} to={item.path!} key={item.text}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              {authItems.map((item) => (
                item.path ? (
                  <ListItem button component={Link} to={item.path} key={item.text}>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ) : (
                  <ListItem button onClick={item.action} key={item.text}>
                    <ListItemText primary={item.text} />
                  </ListItem>
                )
              ))}
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
};

export default Header;