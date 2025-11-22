export function question(language){
    if(language == "english"){
        return "What's your bet? (Amount & Team)";
    }
    else{
        return "¿Cuál es tu apuesta? (Monto y equipo)";
    }
}

export function exampleBet(language, defaultBet){
    if(defaultBet == null){
        return "Loading example bet...";
    }
    let bettingTeam = defaultBet.betting_team;  // in default bet, betting team is always home team
    let otherTeam = defaultBet.other_option_2;  // this is the away team
    if(language == "english"){
        return `Ex: 5 on ${bettingTeam} to beat ${otherTeam}`;
    }
    // redo spanish transaltion later
    else{
        return "Ej: 10 a que el Arsenal le ganará al Chelsea";
    }
}

export function seeBet(language){
    if(language == "english"){
        return "See Bet";
    }
    else{
        return "Ver Apuesta";
    }
}

import { Typography, Box } from '@mui/material';

export function BetDescription({ language, stake, team, event, startTime }) {
  // Format date: month + date (no year), 24hr time without timezone/day of week
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(startTime));

  return (
     <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // centers horizontally
        textAlign: 'center',  // centers text inside Typography
        gap: 1,               // spacing between lines
      }}
    >
      <Typography variant="body1" component="span">
        {language === 'english' ? "You'll bet " : "Apuestas "}
        <strong>{stake.toFixed(2)} USDC </strong>
        {language === 'english' ? ' on ' : ' al '}
        <strong>{team}</strong>
      </Typography>

      <Typography variant="body1" component="span">
        {language === 'english' ? ' in ' : ' en '}
        <strong>{event}</strong>
        {language === 'english' ? ' at ' : ' a '}
        <strong>{formattedDate}</strong>
      </Typography>
    </Box>
  );
}

export function returnDescription(language, team, totalReturn){
    if(language == "english"){
        if(totalReturn == "unavailable"){
            return "Potential return: Unavailable";
        }
        else{
            return `If ${team} wins, you win a total of ${totalReturn.toFixed(2)} USDC`;
        }
    }
    else{
        if(totalReturn == "unavailable"){
            return "Rendimiento potencial: no disponible";
        }
        else{
            return `Si gana el ${team}, ganas un total de ${totalReturn.toFixed(2).replace(".", ",")} USDC`;
        }
    }
}

export function LoseDescription({language, otherOption1, otherOption2}){
    if(language != "english"){
        if(otherOption1 == "Draw"){
            otherOption1 = "Empate";
        }
        if(otherOption2 == "Draw"){
            otherOption2 = "Empate";
        }
    }
    return (
        <>
            {language == "english" ? "If " : "Si "}
            {
                language == "english" ? 
                (   
                    <>
                    <strong>{otherOption1}</strong> or <strong>{otherOption2}</strong> wins
                    </>
                ) : 
                (
                    <>
                    gana el <strong>{otherOption1}</strong> o el <strong>{otherOption2}</strong> 
                    </>
                )
            } 
            {language == "english" ? " your bet loses" : " tu apuesta pierde"}.
        </>
    )
    
}

export function placeBet(language){
    if(language == "english"){
        return "Place Bet!";
    }
    else{
        return "¡Haz apuesta!";
    }
}

export function getStakeMessage(language, stakeWasRaised, stakeWasLowered) {
  if (stakeWasRaised) {
    return language === 'spanish'
      ? "Nota: Su apuesta fue aumentada para cumplir con el mínimo permitido."
      : "Note: Your stake was increased to meet the minimum allowed.";
  }
  if (stakeWasLowered) {
    return language === 'spanish'
      ? "Nota: Su apuesta fue reducida para cumplir con el máximo permitido."
      : "Note: Your stake was lowered to meet the maximum allowed.";
  }
  return '';
}
