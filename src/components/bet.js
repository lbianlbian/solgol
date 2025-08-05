import { Buffer } from 'buffer';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as borsh from "borsh";
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'; 

import levenshtein from "./utils/levenshtein";
import {mktLiqSchema, filterFactory} from "./utils/monacoConfigs";
import { LoseDescription, BetDescription, returnDescription, placeBet } from './utils/text';

window.Buffer = Buffer;
const EVENTS_TO_DISPLAY = 1;
const programID = new PublicKey("monacoUXKtUi6vKsQwaLyxmXKSievfNWEcYXTgkbCih");

/**
 * 
 * events: array of event object, each with attrs event, homeTeam, awayTeam, and mktPubkey
 * userBet: object with attrs stake and bettingTeam
 * language: english or spanish
 * @returns confirmation of bet and button to place it
 */
export default function Bet({events, userBet, language}){
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    const [totalReturn, setTotalReturn] = useState(0);
    const [userStake, setUserStake] = useState(1);
/*
    async function placeBet(){
        let transaction = new Transaction();
        const signature = await sendTransaction(transaction, connection);
        try{
        await connection.confirmTransaction(signature);
        const status = await connection.getSignatureStatus(signature, {
            searchTransactionHistory: true
        });

        if (status.value?.err) {
            throw Error("tx was confirmed but was a failed tx");
        }
        } catch(err){
        
        }
    }
        */
    // determine what the user is betting on
    let otherOption1;
    let otherOption2;
    let bettingTeam;  // user could have entered team with a typo, correct it here
    let outcomeIndex;
    
    if(userBet.bettingTeam == "draw"){
        bettingTeam = "Draw";
        outcomeIndex = 1;
        otherOption1 = events[0].homeTeam;
        otherOption2 = events[0].awayTeam;
    }
    else{
        let homeLevScore = levenshtein(userBet.bettingTeam, events[0].homeTeam);
        let awayLevScore = levenshtein(userBet.bettingTeam, events[0].awayTeam);
        if(homeLevScore < awayLevScore){
            bettingTeam = events[0].homeTeam;
            outcomeIndex = 0;
            otherOption1 = "Draw";
            otherOption2 = events[0].awayTeam;
        }
        else{
            bettingTeam = events[0].awayTeam;
            outcomeIndex = 2;
            otherOption1 = events[0].homeTeam;
            otherOption2 = "Draw";
        }
    }

    useEffect(() => {
        connection.getProgramAccounts(programID, filterFactory(events[0].mktPubkey)).then(
            (mktLiqAccs) => {
                if (mktLiqAccs.length === 0) {
                    setTotalReturn("unavailable");
                    return;
                }
                let mktLiqAccDataBytes = mktLiqAccs[0].account.data.slice(8);
                let mktLiqAccData = borsh.deserialize(mktLiqSchema, mktLiqAccDataBytes);
                // liquiditiesFor actually means bets that have been placed for and are waiting for against bets to match
                for (let liq of mktLiqAccData.liquiditiesAgainst) {
                    if (liq.outcome === outcomeIndex) {
                        if(!isNaN(userBet.stake)){
                          setUserStake(userBet.stake);
                        }
                        setTotalReturn(userStake * liq.price);
                        return;
                    }
                }
                setTotalReturn("unavailable");
            }
        );
    }, [events, userBet]);

    return (
      <CardContent>
        <Stack spacing={2} alignItems="center">

          <Typography variant="body1" color="text.primary" textAlign="center">
            <BetDescription stake={userStake} team={bettingTeam} event={events[0].event} language={language}/>
          </Typography>

          <Typography 
            variant="h6" 
            color={totalReturn === 'unavailable' ? 'error.main' : 'success.main'} 
            sx={{ 
                fontWeight: 600, 
                fontFamily: '"Orbitron", monospace, sans-serif',
                textAlign: 'center'  
            }}
          >
            {returnDescription(language, bettingTeam, totalReturn)}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            <LoseDescription language={language} otherOption1={otherOption1} otherOption2={otherOption2} />
          </Typography>

          <Button
            variant="contained"
            color="primary"
            endIcon={<SportsSoccerIcon />}
            sx={{
              borderRadius: 5,
              textTransform: 'none',
              fontWeight: 'bold',
              letterSpacing: 1,
              bgcolor: 'primary.main',
              boxShadow: '0 0 10px 3px #00e5ff',
              '&:hover': {
                bgcolor: '#00b8d4',
                boxShadow: '0 0 15px 5px #00e5ff',
              }
            }}
          >
            {placeBet(language)}
          </Button>
        </Stack>
      </CardContent>
    );
}