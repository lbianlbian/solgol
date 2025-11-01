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
  const setErrmsg = props.setErrmsg;
  const [isLoading, setIsLoading] = React.useState(false);
  const [userBet, setUserBet] = React.useState({there_are_games: false});
  const handleSubmit = async (event) => {
    event.preventDefault();  // stop default refresh
    setIsLoading(true);
    const data = new FormData(event.currentTarget);
    let query = data.get("query");
    let payload = {query: query};
    try{
      let betResp = await axios.post(URL, payload);
      let bet = betResp.data.body;
      if(bet.there_are_games){
        setUserBet(bet);  // for some reason lambda gives the body attribute back with statusCode
      }
      else{
        setErrmsg("We're sorry, but we do not have any games available for betting at this time.");
      }
    } catch(err){
      console.error(err);
      setErrmsg("We're sorry, but there is an issue on our end with getting our games. Please contact us and we will fix it as soon as possible.");
    }
      
    setIsLoading(false);
  };
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SearchContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <img src="purebetwordaswideaspossible.png" />
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
                placeholder={exampleBet(props.language)}
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={'primary'}
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
      <Card sx={{ 
        maxWidth: 400,
        margin: 'auto',
        bgcolor: 'background.paper',
        boxShadow: '0 0 15px 2px #00e5ff', // neon blue glow for futuristic vibe
        borderRadius: 3,
      }}>
        {userBet.there_are_games ? <Bet userBet={userBet} language={props.language} /> : <></>}
      </Card>
    </AppTheme>
  );
}
