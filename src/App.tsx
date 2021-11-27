import React, { useState } from "react";
import './App.css';
import VestingPage from './pages/vesting_page';
import { providers } from 'ethers'
import { useCallback, useEffect, useReducer } from 'react'
import Web3Modal from 'web3modal'
import { ellipseAddress } from './lib/utilities'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  
} from "react-router-dom";
import DailyPage from "./pages/daily_page";
import BanterPage from "./pages/banter_page";
import { loadContract } from "./utils";

const providerOptions = {};
let web3Modal: any
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions, // required
  })
}

type StateType = {
    provider?: any
    web3Provider?: any
    address?: string
    chainId?: number
}

type ActionType =
  | {
      type: 'SET_WEB3_PROVIDER'
      provider?: StateType['provider']
      web3Provider?: StateType['web3Provider']
      address?: StateType['address']
      chainId?: StateType['chainId']
    }
  | {
      type: 'SET_ADDRESS'
      address?: StateType['address']
    }
  | {
      type: 'SET_CHAIN_ID'
      chainId?: StateType['chainId']
    }
  | {
      type: 'RESET_WEB3_PROVIDER'
}


const initialState: StateType = {
    provider: null,
    web3Provider: null,
    address: null as any,
    chainId: null as any,
  }

  function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
      case 'SET_WEB3_PROVIDER':
        return {
          ...state,
          provider: action.provider,
          web3Provider: action.web3Provider,
          address: action.address,
          chainId: action.chainId,
        }
      case 'SET_ADDRESS':
        return {
          ...state,
          address: action.address,
        }
      case 'SET_CHAIN_ID':
        return {
          ...state,
          chainId: action.chainId,
        }
      case 'RESET_WEB3_PROVIDER':
        return initialState
      default:
        throw new Error()
    }
  }


/// web 3 end

const App = () => {

    const [state, dispatch] = useReducer(reducer, initialState)
    const { provider, address } = state;
    const [vestingContract, setVestingContract] = useState<any>(null);
    const [banterContract, setBanterContract] = useState<any>(null);
    const [dailyContract, setDailyContract] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const vesting = await loadContract("MscpVesting", process.env.REACT_APP_VESTING_ADDRESS as string);
            (window as any).vesting = vesting;
            setVestingContract(vesting);

            const banter = await loadContract("MscpVesting30M", process.env.REACT_APP_BANTER_ADDRESS as string);
            (window as any).banter = banter;
            setBanterContract(banter);

            const daily = await loadContract("MscpVesting5M", process.env.REACT_APP_DAILY_ADDRESS as string);
            (window as any).daily = daily;
            setDailyContract(daily);
          })()
    }, [])

    const connect = useCallback(async function () {
        const provider = await web3Modal.connect()
        const web3Provider = new providers.Web3Provider(provider)
    
        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()
    
        const network = await web3Provider.getNetwork()

        
    
    
    
        dispatch({
          type: 'SET_WEB3_PROVIDER',
          provider,
          web3Provider,
          address,
          chainId: network.chainId,
        })
      }, [])


      const disconnect = useCallback(
        async function () {
          await web3Modal.clearCachedProvider()
          if (provider?.disconnect && typeof provider.disconnect === 'function') {
            await provider.disconnect()
          }
          dispatch({
            type: 'RESET_WEB3_PROVIDER',
          })
        },
        [provider]
      )
    
      useEffect(() => {
        if (web3Modal.cachedProvider) {
          connect()
        }
      }, [connect])


      useEffect(() => {
        if (provider?.on) {
          const handleAccountsChanged = (accounts: string[]) => {
            console.log('accountsChanged', accounts)
            dispatch({
              type: 'SET_ADDRESS',
              address: accounts[0],
            })
          }
    
          const handleChainChanged = (_hexChainId: string) => {
            window.location.reload()
          }
    
          const handleDisconnect = (error: { code: number; message: string }) => {
            console.log('disconnect', error)
            disconnect()
          }
    
          provider.on('accountsChanged', handleAccountsChanged)
          provider.on('chainChanged', handleChainChanged)
          provider.on('disconnect', handleDisconnect)
    
          return () => {
            if (provider.removeListener) {
              provider.removeListener('accountsChanged', handleAccountsChanged)
              provider.removeListener('chainChanged', handleChainChanged)
              provider.removeListener('disconnect', handleDisconnect)
            }
          }
        }
      }, [provider, disconnect])

    return (
      <div>
      <header>
        <div className="wallet-section">
        {!address && <button
       className="connect-btn" id="btn-connect"
       onClick={async () => {
         console.log('cicked');
         connect();
       }}
       >
              Connect wallet
          </button>}

          {address && <div>
            <p>
            {ellipseAddress(address)}
          </p> <button
       className="connect-btn" id="btn-connect"
       onClick={async () => {
         console.log('cicked');
         disconnect();
       }}
       >
              Disconnect
          </button>
            </div>}
        </div>
      </header>
        
        <Routes>
          <Route path="/vesting" element={<VestingPage address={address} contract={vestingContract} />}>
          </Route>
          <Route path="/daily" element={<DailyPage  address={address} contract={dailyContract} />}>
            
          </Route>
          <Route path="/banter" element={<BanterPage  address={address} contract={banterContract} />}>
            
          </Route>
        </Routes>
      </div>
    );
}

export default App;