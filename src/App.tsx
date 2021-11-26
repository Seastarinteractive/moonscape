import Web3 from 'web3';
import React from 'react';
import './App.css';
import WalletConnectProvider from '@walletconnect/web3-provider'
import { providers } from 'ethers'

import { useCallback, useEffect, useReducer } from 'react'
import WalletLink from 'walletlink'
import Web3Modal from 'web3modal'
import { ellipseAddress, getChainData } from './lib/utilities'

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'

const providerOptions = {
  // walletconnect: {
  //   package: WalletConnectProvider, // required
  //   options: {
  //     infuraId: INFURA_ID, // required
  //   },
  // },
}

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

const loadContract = async (abi: string, address: string) => {
    const abiFile = require(`./abi/${abi}.json`);
    const web3 = new Web3(Web3.givenProvider);
    const contract = new web3.eth.Contract(abiFile, address);
    return contract;
}

function App() {

  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, web3Provider, address, chainId } = state;

  const [vestingContract, setVestingContract] = React.useState<any>(null)
  const [vestingData, setVestingData] = React.useState<any>(null)

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

  useEffect(() => {
    const load = async () => {
      const v = await loadContract('MscpVesting', process.env.VESTING_CONTRACT as string);
      setVestingContract(v)
      console.log(v)
      const allocation = await v.methods.getAllocation().call()
      const remainingTime = await v.methods.getRemainingTime().call()
      let data = {
        allocation,
        remainingTime
      }
      setVestingData(data);
    }
    load();
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

  // const chainData = getChainData(chainId)



  return (
    
    <div className="App">
       <header>
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
      </header>
      
      <div className="popup"> 
        <div className="popup-inner">
          <h1>
            DOP Token Vesting
          </h1>
            <div className="info-list" >
                <div className="info-list--item">
                  <p>
                    Total Allocated
                  </p>
  
                  <p className="number">
                    { !vestingData ? '???' : vestingData['allocation']}
                  </p>
                </div>
                <div className="info-list--item">
                  <p>
                    Total Released
                  </p>
  
                  <p className="number">
                  { !address ? '???' : '87500.00'}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Available to claim
                  </p>
  
                  <p className="number">
                  { !address ? '???' : '87500.00'}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Vesting ends in
                  </p>
  
                  <p className="number">
                  { !vestingData ? '???' : vestingData['remainingTime']}
                  </p>
                </div>
            </div>
  
            <button className="claim-btn">
              Claim
            </button>
        </div>
      </div>
      
    </div>
  );
}

export default App;
