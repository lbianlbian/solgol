import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Paper } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Buffer } from 'buffer';

import Search from './components/search';
import TopBar from './components/topbar';
import './App.css';

window.Buffer = Buffer;
// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

//function App(){
export const App = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  // helius endpoints fail on getProgramAccounts
  // const endpoint = useMemo(() => "https://mainnet.helius-rpc.com/?api-key=2be97c7b-0edf-4b14-9a19-236bc6c87135", [network]);
  const endpoint = useMemo(() => "https://spring-frosty-snowflake.solana-mainnet.quiknode.pro/5584f3ace79637af8f83a6f135554af9e0f0ffca", [network]);

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

  const [errmsg, setErrmsg] = React.useState("");

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
                  <TopBar />
                  <Search setErrmsg={setErrmsg}/>
                  {errmsg == "" ? 
                    (<></>) : 
                    (<Alert severity="error" variant="filled">{errmsg}</Alert>)
                  }
                </Paper>
              </WalletModalProvider>
          </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};
export default App;