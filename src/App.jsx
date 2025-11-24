import React, { useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Paper } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Buffer } from 'buffer';
import axios from "axios";

import Search from './components/search';
import TopBar from './components/topbar';
import './App.css';

window.Buffer = Buffer;

const ANALYTICS_URL = "https://script.google.com/macros/s/AKfycbyPrWZG-86GxUJVvYu99zueqLhH2lxBMvmqEy-ps4BI_Ld2HaLmy0tLrFjL9gX89gTi/exec";

// Default styles that can be overridden by your app
import * as idk from '@solana/wallet-adapter-react-ui/styles.css';

//function App(){
export const App = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  // helius endpoints fail on getProgramAccounts
  const endpoint = useMemo(() => "https://mainnet.helius-rpc.com/?api-key=2be97c7b-0edf-4b14-9a19-236bc6c87135", [network]);

  const wallets = useMemo(
      () => [],  // empty array means only show wallets that user has installed
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [network]
  );

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  // analytics for website traffic
  useEffect(() => {axios.get(ANALYTICS_URL)}, [])

  const [msg, setMsg] = React.useState({severity: "init"});  // attributes of severity and message
  const [language, setLanguage] = React.useState("english");

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Paper
                  sx={{
                      minHeight: '100vh',
                      display: 'flex',
                      flexDirection: 'column',
                  }}
                >
                  <TopBar setLanguage={setLanguage} language={language}/>
                  <Search setMsg={setMsg} language={language} />
                  {msg.severity == "init" ? 
                    (<></>) : 
                    (<Alert 
                      severity={msg.severity} 
                      variant="filled"
                      onClose={() => {setMsg({severity: "init"})}} 
                    >
                      {msg.message} 
                    </Alert>)
                  }
                </Paper>
              </WalletModalProvider>
          </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};
export default App;