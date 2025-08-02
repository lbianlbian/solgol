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
import LevenshteinSorter from './utils/sorter';
import Bet from './bet';

const URL = "https://prod.events.api.betdex.com/events";
const LLM_URL = "https://api.mistral.ai/v1/chat/completions";
const LLM_AUTH = {Authorization: "Bearer ut3fvNH5z4BBiAq88V07cMAGNLXos48P"};
const PROMPT = `Based on the user's query, give me a properly formatted JSON object with attributes
  stake (a number, ignore any currencies)
  team1 (all lowercase, one of the teams in the game the user wants to bet on)
  team2 (all lowercase, the other team in this game)
  bettingTeam (all lowercase, the team that user is betting on, could also be 'draw')
  I will call JSON.parse() on the entire response so do not respond with anything else besides the JSON object.
  Here is the user's query: `;
const RESP_MAX_TOKENS = 100;

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

/**
 * calls betdex api for soccer events
 * @returns array of event objects, each with event, homeTeam, awayTeam, and mktPubkey
 */
async function getEvents(){
  let resp = await axios.get(URL);
  let output = [];
  for(let sport of resp.data.eventCategories){
    if(sport.id != "FOOTBALL"){
      continue;
    }
    for(let league of sport.eventGroup){
      for(let event of league.events){
        let outputObj = {
          event: event.eventName,
          homeTeam: event.participants[0].name,
          awayTeam: event.participants[1].name
        };
        for(let market of event.markets){
          if(market.marketName == 'Full Time Result'){
            outputObj.mktPubkey = market.marketAccount;
          }
        }
        output.push(outputObj);
      }
    }
  }
  return output;
}

export default function Search(props) {
  const setErrmsg = props.setErrmsg;
  const [isLoading, setIsLoading] = React.useState(false);
  const [events, setEvents] = React.useState([]);
  const [userBet, setUserBet] = React.useState({});
  const handleSubmit = async (event) => {
    event.preventDefault();  // stop default refresh
    setIsLoading(true);
    const data = new FormData(event.currentTarget);
    let query = data.get("query");
    let payload = {
        model: "mistral-small-2409",
        max_tokens: RESP_MAX_TOKENS,
        messages: [{
            role: "user",
            content: PROMPT + query
        }]
    };
    let resp = await axios.post(LLM_URL, payload, {headers: LLM_AUTH});
    let rawUserBet = resp.data.choices[0].message.content;
    // sometimes mistral doesnt listen and still gives it in the format for web view
    let cleanedUserBet = rawUserBet.replace("```json", "").replace("```", "");
    let currUserBet = JSON.parse(cleanedUserBet);
    let currQuerySorter = new LevenshteinSorter(currUserBet);
    let bindedSorter = currQuerySorter.sort.bind(currQuerySorter);
    try{
      let apiEvents = await getEvents();
      apiEvents.sort(bindedSorter);
      if(apiEvents.length > 0){
        setEvents(apiEvents);
        setUserBet(currUserBet);
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
            What's your bet? (Amount & Team)
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
                placeholder="Ex: I'll bet 10 on Man Utd to beat Arsenal"
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
              Search
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
        {events.length == 0 ? (<></>) : (<Bet events={events} userBet={userBet}/>)}
      </Card>
    </AppTheme>
  );
}
