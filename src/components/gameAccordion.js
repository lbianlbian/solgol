import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

/**
 * @param {List of Objects}  eventObj event object from the API 
 * @returns the search result part of the page
 */
function GameAccordion({eventObj}){
  // outcome = {name: home/draw/away, styledName: actual team name}
  const [outcome, setOutcome] = React.useState({name: "none", styledName: "outcome"});  
  const [stake, setStake] = React.useState(10);
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{eventObj.event}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/*secondary color is blue, home */}
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              setOutcome({name: "home", styledName: `${eventObj.homeTeam} to win`})
            }}
          >
            {eventObj.homeTeam} to win
          </Button>
          {/* draw */}
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              setOutcome({name: "draw", styledName: "Draw"})
            }}
          >
            Draw
          </Button>
          {/* away */}
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              setOutcome({name: "away", styledName: `${eventObj.awayTeam} to win`})
            }}
          >
            {eventObj.awayTeam} to win
          </Button>
        </Stack>
        <br />
        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-number"
            label="Stake"
            
            size="small"
            defaultValue="10"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(event) => {setStake(event.target.value)}}
          />
          <div>USDC bet on {outcome.styledName} returns {stake * eventObj?.full_time_result[outcome.name]?.back?.highestOdds} USDC</div>
        </Stack>
        <Button variant="contained" onClick={() => {alert("you got to the part of placing a bet")}}> Place Bet </Button>
      </AccordionDetails>
    </Accordion>
  )
}

export default GameAccordion;