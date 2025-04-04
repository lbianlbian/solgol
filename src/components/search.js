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
import levenshtein from "./utils/levenshtein";
import GameAccordion from "./gameAccordion";

const URL = "https://script.google.com/macros/s/AKfycbzOHT0zHPAt9m8qO4e65XBCOgCyvL5UlVEN6CpRwVziO0kEDo0OmQskdtWCYsbW2J1uUg/exec?url=http://35.183.47.211/events?sport=soccer";
const TOP_RESULTS_TO_SHOW = 3;

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
 * calls purebet api for events
 * @returns array of event objects unchanged from api (example shown in pbapi.json)
 */
async function getEvents(){
  let resp = await axios.get(URL);
  let output = [];
  for(let league in resp.data.soccer){
    output = output.concat(resp.data.soccer[league]);
  }
  return output;
}

class LevenshteinSorter{
  constructor(query){
    this.query = query.toLowerCase();
  }
  /**
   * picksk closest levenshtein distance from away team name, home team name, and event name
   * and also min of each individual word (make sure shenhua = Shanghai Shenhua)
   * @param {Object} eventObj event object that must have attributes .awayTeam, .homeTeam, and .event
   * @returns number
   */
  minLevDist(eventObj){
    let wordLevDists = [];
    for(let word of eventObj.event.split(" ")){
      wordLevDists.push(levenshtein(word.toLowerCase(), this.query));
    }
    return Math.min(
      levenshtein(eventObj.event.toLowerCase(), this.query),
      levenshtein(eventObj.awayTeam.toLowerCase(), this.query),
      levenshtein(eventObj.homeTeam.toLowerCase(), this.query),
      ...wordLevDists
    );
  }
  /**
   * for use in sorting an array of event objects from most to least similar to query
   * @param {Object} eventObjA must have .awayTeam and .homeTeam and .event attrributes
   * @param {Object} eventObjB 
   * @returns number, negative if A goes in front, positive if B
   */
  sort(eventObjA, eventObjB){
    let levA = this.minLevDist(eventObjA);
    let levB = this.minLevDist(eventObjB);
    if(levA < levB){
      return -1;
    }
    else if(levA > levB){
      return 1;
    }
    else{
      return 0;
    }
  }
}

export default function Search(props) {
  const setErrmsg = props.setErrmsg;
  const [isLoading, setIsLoading] = React.useState(false);
  const [events, setEvents] = React.useState([]);
  const handleSubmit = async (event) => {
    event.preventDefault();  // stop default refresh
    setIsLoading(true);
    const data = new FormData(event.currentTarget);
    let query = data.get("query");
    let currQuerySorter = new LevenshteinSorter(query);
    let bindedSorter = currQuerySorter.sort.bind(currQuerySorter);
    try{
      let apiEvents = await getEvents();
      apiEvents.sort(bindedSorter);
      if(apiEvents.length > 0){
        setEvents(apiEvents);
      }
      else{
        setErrmsg("We're sorry, but we do not have any games available for betting at this time.");
      }
    } catch(err){
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
            What soccer game will you bet on?
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
                placeholder="Find a soccer game"
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
      <Card variant="outlined">
        {
          events.slice(0, TOP_RESULTS_TO_SHOW).map(
            (eventObj, index) => (<GameAccordion key={index} eventObj={eventObj}/>)
          )
        }
      </Card>
    </AppTheme>
  );
}
