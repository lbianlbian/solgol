import {WalletMultiButton} from '@solana/wallet-adapter-react-ui';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

const TWITTER_URL = "https://twitter.com/purebet_io";
const DISCORD_URL = "https://discord.gg/22tr2FYAh9";
const EMAIL = "mailto:jupaloa@gmail.com";

function TopBar() {

  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  function openDiscord(){
    window.open(DISCORD_URL, "_blank")
  }
  function openTwitter(){
    window.open(TWITTER_URL, "_blank")
  }
  function openEmail(){
    window.open(EMAIL);
  }

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const walletStyle = isMobile ? {padding: '0px'} : {};

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop title  */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SolGol
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            {/* mobile menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem key="discord" onClick={openDiscord}>
                <Typography sx={{ textAlign: 'center' }}>Discord </Typography>
              </MenuItem>
              <MenuItem key="twitter" onClick={openTwitter}>
                <Typography sx={{ textAlign: 'center' }}>Twitter/X </Typography>
              </MenuItem>
              <MenuItem key="email" onClick={openEmail}>
                <Typography sx={{ textAlign: 'center' }}>Email </Typography>
              </MenuItem>
            </Menu>
          </Box>
          {/* mobile title */}
          <Typography
            variant="string"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SolGol
          </Typography>
          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              key="discordDesktop"
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={openDiscord}
            >
              Discord
            </Button>
            <Button
              key="twitterDesktop"
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={openTwitter}
            >
              Twitter/X
            </Button>
            <Button
              key="emailDesktop"
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={openEmail}
            >
              Email
            </Button>
          </Box>
          <WalletMultiButton style={walletStyle}/>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default TopBar;