import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import axios from "axios";
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import AppTheme from './styling/AppTheme';
import Bet from './bet';
import {exampleBet, question, seeBet} from "./utils/text";
import {getGame} from "./utils/prefillGame";

const URL = "https://j7k0y6mnxd.execute-api.ca-central-1.amazonaws.com/betLambda"

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  //marginBottom: "2%",
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SearchContainer = styled(Stack)(({ theme }) => ({
  //height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Search(props) {
  const setMsg = props.setMsg;
  const [isLoading, setIsLoading] = React.useState(false);
  const [userBet, setUserBet] = React.useState({there_are_games: false});
  const [defaultBet, setDefaultBet] = React.useState(null);
  React.useEffect(() => {
    // This code runs only once after the initial render
    async function callGetGame(){
      setDefaultBet(await getGame());
    }
    callGetGame();
  }, []); // Empty array ensures this runs just once

  const handleSubmit = async (event) => {
    event.preventDefault();  // stop default refresh
    setIsLoading(true);
    const data = new FormData(event.currentTarget);
    let query = data.get("query");
    let payload = {query: query};
    try{
      if(query == null || query == "" || query == undefined){
        // use the default bet
        setUserBet(defaultBet);
      }
      else{
        let betResp = await axios.post(URL, payload);
        let bet = betResp.data;
        if(bet.there_are_games){
          setUserBet(bet);  // for some reason lambda gives the body attribute back with statusCode
        }
        else{
          setMsg(
            {
              severity: "error",
              message: "We're sorry, but we do not have any games available for betting at this time."
            }
          );
        }
      }
    } catch(err){
      console.error(err);
      setMsg(
        {
          severity: "error",
          message: "We're sorry, but there is an issue on our end with getting our games. Please contact us and we will fix it as soon as possible."
        }
      );
    }
      
    setIsLoading(false);
  };
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SearchContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <img src="solgol_banner.jpg" />
          <Typography
            component="p"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              letterSpacing: '0.05em',
              textAlign: 'center',
              userSelect: 'none',
              marginY: 2,
            }}
          >
            <Box component="span" sx={{ color: 'green' }}>Memecoins</Box>{' '}
            -{' '}
            <Box component="span" sx={{ color: 'red' }}>Rugpulls</Box>{' '}
            ={' '}
            <br />
            <Box component="span" sx={{ color: 'gold' , fontSize: '1.75rem'}}>Sports Betting</Box>
          </Typography>

          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            {question(props.language)}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <TextField
                id="query"
                name="query"
                placeholder={exampleBet(props.language, defaultBet)}
                autoFocus
                required
                fullWidth
                variant="outlined"
                color="primary"
                sx={{
                  '& input::placeholder': {
                    color: '#339999',   // Aquamarine, bright but soft futuristic hue
                    opacity: 0.7,       // Semi-transparent to signal placeholder status
                    fontStyle: 'italic' // Optional: italic style for distinction
                  }
                }}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              {seeBet(props.language)}
            </Button>
          </Box>
          {isLoading ? (<LinearProgress />) : (<></>)}
        </Card>
      </SearchContainer>
      {userBet?.there_are_games ?
        <Card sx={{ 
          maxWidth: 400,
          margin: 'auto',
          bgcolor: 'background.paper',
          boxShadow: '0 0 15px 2px #00e5ff', // neon blue glow for futuristic vibe
          borderRadius: 3,
        }}>
          <Bet userBet={userBet} language={props.language} setMsg={setMsg} />
        </Card>
        :
        <> </>
      }
    </AppTheme>
  );
}
