import { Buffer } from 'buffer';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {createTransferInstruction, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'; 
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

import { LoseDescription, BetDescription, returnDescription, placeBet, getStakeMessage } from './utils/text';

const RECORD_URL = "https://j7k0y6mnxd.execute-api.ca-central-1.amazonaws.com/betRecordContainerSource";
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const HOUSE_ATA = new PublicKey("G1g89Q3R98nGNMdPk1ZC6GMqwnMTEhybsDzX5NmzqwSx");
const USDC_DECIMALS = 6;

export default function Bet({ userBet, language }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const [telegramAddr, setTelegramAddr] = useState('');
  const [processingBet, setProcessingBet] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // New state for stake change notice
  const stakeWasRaised = userBet.numbers.stake.was_increased;
  const stakeWasLowered = userBet.numbers.stake.was_decreased;
  const stakeMessage = getStakeMessage(language, stakeWasRaised, stakeWasLowered);

  function handlePlaceBetClick() {
    if (!connected) {
      alert("Please connect your wallet to place a bet.");
      return;
    }
    setShowTelegramPopup(true);
  }

  function round(num, dec){
    return Math.round(num * 10**dec) / 10**dec;
  }

  async function onchainBet(){
    console.log(TOKEN_2022_PROGRAM_ID.toBase58());
    let sourceResp = await connection.getTokenAccountsByOwner(publicKey, {mint: USDC_MINT});
    let source = sourceResp.value[0].pubkey;
    let betInstr = createTransferInstruction(
      source,
      HOUSE_ATA,  // DESTINATION
      publicKey,  // owner of the source
      userBet.numbers.stake.amount * 10**USDC_DECIMALS,  // amount
      [],  // multisigners, not applicable to this
      TOKEN_PROGRAM_ID
    );

    let messageObj = {
      bet: round(userBet.numbers.stake.amount, 2),
      for: round(userBet.numbers.total_return, 2),
      on: userBet.betting_team,
      in: userBet.event,
      at: userBet.start_time
    };
    let memoInstr = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],  // only need payer
      data: Buffer.from(JSON.stringify(messageObj), "utf-8"),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });
    
    let transaction = new Transaction();
    transaction.add(betInstr);
    transaction.add(memoInstr);
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
      console.log("handle errors later");
    }
    return signature;
  }

  async function handleTelegramSubmit() {
    setProcessingBet(true);
    let txsig = await onchainBet();
    await processBet(telegramAddr, txsig);
    setProcessingBet(false);
    setShowTelegramPopup(false);
    setConfirmationOpen(true);
  }

  async function processBet(telegramUsername, txsig) {
    let payload = {
      bettor: {
        addr: publicKey.toBase58(),
        telegram: telegramUsername
      },
      bet: {
        txsig: txsig,
        team: userBet.betting_team,
        event_name: userBet.event,
        start_time: userBet.start_time,
        numbers: {
          stake: userBet.numbers.stake.amount,
          skim: userBet.numbers.stake.skim,
          potential_return: userBet.numbers.total_return
        }
      },
      user_query: userBet.user_query,
      polymarket_info: {
        tok_addr: userBet.tok_addr,
        price: userBet.numbers.price
      }
    };
    await axios.post(RECORD_URL, payload);
  }

  return (
    <CardContent>
      <Stack spacing={2} alignItems="center">
        {/* Optional stake message section */}
        {stakeMessage && (
          <Typography
            variant="body2"
            color="info.main"
            sx={{ fontFamily: '"Orbitron", monospace', textAlign: 'center' }}
          >
            {stakeMessage}
          </Typography>
        )}

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
          color={userBet.numbers.total_return === 'unavailable' ? 'error.main' : 'success.main'}
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
          onClick={handlePlaceBetClick}
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

        {/* Telegram Username Popup */}
        <Dialog open={showTelegramPopup} onClose={() => setShowTelegramPopup(false)}>
          <DialogTitle
            sx={{
              fontFamily: '"Orbitron", monospace, sans-serif',
              letterSpacing: 2,
              bgcolor: '#24263e',
              color: '#00e5ff'
            }}
          >
            {language === "spanish" 
              ? "Ingrese su nombre de usuario de Telegram"
              : "Enter your Telegram username"}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#0e1623', color: '#b2ebf2' }}>
            <TextField
              fullWidth
              label={language === "spanish" 
                ? "Usuario de Telegram" 
                : "Telegram Username"}
              variant="outlined"
              value={telegramAddr}
              onChange={e => setTelegramAddr(e.target.value)}
              sx={{
                input: { color: '#b2ebf2', fontFamily: '"Orbitron", monospace' },
              }}
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#0e1623'}}>
            <Button
              onClick={() => setShowTelegramPopup(false)}
              color="secondary"
              sx={{ fontWeight: 'bold', letterSpacing: 1 }}
            >
              {language === 'spanish' ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={handleTelegramSubmit}
              variant="contained"
              color="primary"
              disabled={!telegramAddr || processingBet}
              sx={{
                fontWeight: 'bold',
                bgcolor: '#00e5ff',
                color: '#24263e',
                letterSpacing: 1,
                boxShadow: '0 0 10px 3px #00e5ff'
              }}
            >
              {language === "spanish" ? "Enviar" : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* bet confirmation popup */}
        <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
            <DialogContent 
                sx={{
                    bgcolor: '#16182b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    minWidth: 320,
                    minHeight: 150,
                    borderRadius: 5
                }}
            >
            <SportsSoccerIcon sx={{ fontSize: 48, color: '#00e5ff' }} />
            <Typography
                variant="h5"
                sx={{
                    bgcolor: 'transparent',
                    color: '#00e5ff',
                    fontWeight: 700,
                    fontFamily: '"Orbitron", monospace, sans-serif',
                    textAlign: 'center',
                    letterSpacing: 2,
                    mb: 1
                }}
                >
                {language === 'spanish' 
                    ? "¡Apuesta registrada!"
                    : "Bet Confirmed!"}
                </Typography>
                <Typography
                variant="body1"
                sx={{
                    color: '#b2ebf2',
                    fontFamily: '"Orbitron", monospace, sans-serif',
                    textAlign: 'center',
                    mb: 2
                }}
                >
                {language === 'spanish'
                    ? "Te enviaremos actualizaciones de la apuesta a Telegram en breve."
                    : "You’ll receive updates about your bet through Telegram soon."}
                </Typography>
                <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setConfirmationOpen(false)}
                sx={{
                    bgcolor: '#00e5ff',
                    color: '#16182b',
                    borderRadius: 3,
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontFamily: '"Orbitron", monospace, sans-serif',
                    boxShadow: '0 0 10px 2px #00e5ff'
                }}
                >
                {language === 'spanish' ? "Cerrar" : "Close"}
                </Button>
            </DialogContent>
        </Dialog>

      </Stack>
    </CardContent>
  );
}