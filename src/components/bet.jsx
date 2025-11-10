import { Buffer } from 'buffer';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as borsh from "borsh";
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'; 

import { LoseDescription, BetDescription, returnDescription, placeBet } from './utils/text';

window.Buffer = Buffer;

/**
 * 
 * userBet: object with attrs  
 * "there_are_games": 
    "other_option_1":
    "other_option_2": 
    "betting_team": 
    "tok_addr": 
    "event": 
    "airesp": 
    "user_query": 
    "numbers": {
      "total_return": 
        "stake": {
            "was_increased": 
            "was_decreased": 
            "amount":  (amount user placed, not the amoutn to hedge)
            "skim": (number in between 0 and 1)
        },
        "price": 
    }
    "start_time": game["endDate"]  # iso format string, eventStartDate in mkt obj is null
 * language: english or spanish
 * @returns confirmation of bet and button to place it
 */
export default function Bet({userBet, language}){
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    
    /*
    async function need to name this not placeBet(){
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

    return (
      <CardContent>
        <Stack spacing={2} alignItems="center">

          <Typography variant="body1" color="text.primary" textAlign="center">
            <BetDescription 
              stake={userBet.numbers.stake.amount} 
              team={userBet.betting_team} 
              event={userBet.event} 
              language={language}
            />
          </Typography>

          <Typography 
            variant="h6" 
            color={
              /* Polymarkets API likely won't have missing odds but keep this here in case that needs to be handled */
              userBet.numbers.total_return === 'unavailable' ? 'error.main' : 'success.main'
            } 
            sx={{ 
                fontWeight: 600, 
                fontFamily: '"Orbitron", monospace, sans-serif',
                textAlign: 'center'  
            }}
          >
            {returnDescription(language, userBet.betting_team, userBet.numbers.total_return)}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            <LoseDescription 
              language={language} 
              otherOption1={userBet.other_option_1} 
              otherOption2={userBet.other_option_2} 
            />
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