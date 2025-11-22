import axios from "axios";

const GAS_URL = "https://script.google.com/macros/s/AKfycbwrW3Ti0J_i80RS-8sZyFnFaPvjck4wQLmfs56P7kU3Sxuk5V5Q_0IvAz8cLwG1fTmJ/exec";

export async function getGame(){
    return (await axios.get(GAS_URL)).data;
}

/*
needs to return
"there_are_games": True,
"other_option_1": other_option_1,
"other_option_2": other_option_2,
"betting_team": betting_team,
"airesp": user_bet, not actually needed for default bet
"event": game["title"],
"user_query": user_query,
"start_time": game["endDate"]  

"tok_addr": tok_addr,
"numbers": 
    "total_return": total_return,
    "stake": {
        "was_increased": stake_was_increased,
        "was_decreased": stake_was_decreased,
        "amount": stake,
        "skim": skim,
    },
    "price": token_price
*/
const URL = "https://gamma-api.polymarket.com/events?tag_id=100350&closed=false&limit=5&order=endDate,volume&ascending=True";
const SKIM = 0.05;

async function movedToGoogleAppsScript(){
    let output = {
        there_are_games: false,
        other_option_1: "Draw",
        user_query: "default user query"
    };
    let fullISOStr = (new Date()).toISOString();
    let no_milliseconds = `${fullISOStr.split(".")[0]}Z`;
    let url = `${URL}&end_date_min=${no_milliseconds}`;
    let resp = (await axios.get(url)).data;

    for(let game of resp){
        let foundGameTag = false;
        for(let tag of game.tags){
            if(tag.slug == "games"){
                foundGameTag = true;
                break;
            }
        }
        if(!foundGameTag){
            continue;
        }
        if(!game.title.includes(" vs. ")){
            continue;
        }
        if(game.title.includes("More Markets")){
            continue;
        }

        output.there_are_games = true;
        output.event = game.title;
        let [homeTeam, awayTeam] = game.title.split(" vs. ");
        output.betting_team = homeTeam;
        output.other_option_2 = awayTeam;
        output.start_time = game.endDate;

        output.tok_addr = JSON.parse(game.markets[0].clobTokenIds)[0];
        
        output.numbers = {}
        output.numbers.price = JSON.parse(game.markets[0].outcomePrices)[0];
        output.numbers.stake = {
            was_increased: false,
            was_decreased: false
        };
        let skim = SKIM;
        let stake = 5;
        let adjStake = stake * (1 - skim);
        let totalReturn = adjStake / output.numbers.price;
        if(totalReturn <= stake){
            let odds = 1 / output.numbers.price;
            skim = (odds - 1) / 2
            adjStake = stake * (1 - skim)
            totalReturn = adjStake / output.numbers.price
        }

        output.numbers.total_return = totalReturn;
        output.numbers.stake.amount = stake;
        output.numbers.skim = skim;
        break;
    }

    return output;
}