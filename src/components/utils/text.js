export function question(language){
    if(language == "english"){
        return "What's your bet? (Amount & Team)";
    }
    else{
        return "¿Cuál es tu apuesta? (Monto y equipo)";
    }
}

export function exampleBet(language){
    if(language == "english"){
        return "Ex: I'll bet 10 on Man Utd to beat Arsenal";
    }
    else{
        return "Ej: Apuesto 10 a que el Arsenal le ganará al Chelsea";
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

export function BetDescription({language, stake, team, event}){ 
    return (
        <>
            {language == "english" ? "I'll bet " : "Apuesto "}
            <strong>{stake}</strong> 
            {language == "english" ? " on " : " al "}
            <strong>{team}</strong> 
            {language == "english" ? " in " : " en "} 
            <strong>{event}</strong>
        </>    
    );
}

export function returnDescription(language, team, totalReturn){
    if(language == "english"){
        if(totalReturn == "unavailable"){
            return "Potential return: Unavailable";
        }
        else{
            return `If ${team} wins, I win a total of ${totalReturn.toFixed(2)}`;
        }
    }
    else{
        if(totalReturn == "unavailable"){
            return "Rendimiento potencial: no disponible";
        }
        else{
            return `Si gana el ${team}, gano un total de ${totalReturn.toFixed(2).replace(".", ",")}`;
        }
    }
}

export function LoseDescription({language, otherOption1, otherOption2}){
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
                    gana el <strong>{otherOption1}</strong> o gana el <strong>{otherOption2}</strong> 
                    </>
                )
            } 
            {language == "english" ? "my bet loses" : "mi apuesta pierde"}.
        </>
    )
    
}

export function placeBet(language){
    if(language == "english"){
        return "Place Bet!";
    }
    else{
        return "¡Haz mi apuesta!";
    }
}

