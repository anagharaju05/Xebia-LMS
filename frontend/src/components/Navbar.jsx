import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

const Navbar = () => {
  const { sidebarOpen, toggleSidebar, themeMode, toggleTheme } = useUI();
  const { user } = useAuth();
  const location = useLocation();
  const [notiAnchorEl, setNotiAnchorEl] = useState(null);

  const handleOpenNotiMenu = (event) => setNotiAnchorEl(event.currentTarget);
  const handleCloseNotiMenu = () => setNotiAnchorEl(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/category')) return 'Categories';
    if (path.startsWith('/course')) return 'Courses';
    if (path.startsWith('/module')) return 'Modules';
    if (path.startsWith('/submodule')) return 'Submodules';
    if (path.startsWith('/content')) return 'Content';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          xs: '100%',
          md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        },
        ml: {
          xs: 0,
          md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
        },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        transition: (theme) =>
          theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar sx={{ height: 64, px: { xs: 1.5, sm: 3 } }}>
        {/* Toggle Sidebar Button (Mobile/Tablet only) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Clean Page Title (Mockup style) */}
        <Typography
          variant="h6"
          fontWeight={700}
          fontFamily='"Outfit", sans-serif'
          sx={{ flexGrow: 1, display: 'block', color: 'text.primary' }}
        >
          {getPageTitle()}
        </Typography>

        {/* Toolbar Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Light/Dark Toggle */}
          <Tooltip title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleOpenNotiMenu}>
              <Badge badgeContent={3} color="warning">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notiAnchorEl}
            open={Boolean(notiAnchorEl)}
            onClose={handleCloseNotiMenu}
            PaperProps={{
              sx: { width: 320, mt: 1.5, borderRadius: 2, p: 1 },
            }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Box sx={{ p: 1, pb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Recent Notifications
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <MenuItem onClick={handleCloseNotiMenu} sx={{ py: 1, borderRadius: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>Course sync complete</Typography>
                <Typography variant="caption" color="text.secondary">All 3 active courses loaded in cache.</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCloseNotiMenu} sx={{ py: 1, borderRadius: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>User session started</Typography>
                <Typography variant="caption" color="text.secondary">Authenticated at 15:45.</Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* User Profile */}
          <Tooltip title="Profile">
          {user && (
            <Tooltip title={`${user.name} (${user.email})`}>
              <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center' }}>
                <Avatar alt={user.name} src={user.avatar} sx={{ width: 36, height: 36, border: '2px solid #6C1D5F' }} />
              </Box>
            </Tooltip>
          )}</Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
export { DRAWER_WIDTH };
