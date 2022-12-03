import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import Web3 from "web3";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
// import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min.js";

function App() {
  const [provider, setProvider] = useState();
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();

  const providerOptions = {
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Web 3 Modal Demo",
        infuraId: "d9f3bb64fb3c42d59ec58bb01df0cdb9",
      },
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "d9f3bb64fb3c42d59ec58bb01df0cdb9",
      },
    },
  };

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  });

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const network = await web3.eth.net.getId();
      console.log(network);
      await web3.eth.personal.sign("Connecting to Dapp!", accounts[0]);
      setProvider(provider);
      setWeb3(web3);
      if (accounts) setAccount(accounts[0]);
      setNetwork(network);
    } catch (error) {
      await provider.disconnect();
      console.error(error);
    }
  };

  const disconnect = async () => {
    await provider.disconnect();
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  const refreshState = () => {
    setAccount();
    setNetwork();
    localStorage.clear();
  };

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) disconnect();
        setAccount(accounts[0]);
      };

      const handleChainChanged = (chainId) => {
        setNetwork(chainId);
      };

      const handleDisconnect = () => {
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      console.log(web3Modal);
      connectWallet();
    }
  }, []);

  return (
    <div className="App">
      <button onClick={connectWallet}>Connect Wallet</button>
      <div>Connection Status: ${!!account}</div>
      <div>Wallet Address: ${account}</div>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}

export default App;
