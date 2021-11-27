import Web3 from 'web3';
import React from 'react';
import './App.css';
import WalletConnectProvider from '@walletconnect/web3-provider'
import { providers } from 'ethers'

import { useCallback, useEffect, useReducer } from 'react'
import WalletLink from 'walletlink'
import Web3Modal from 'web3modal'
import { ellipseAddress, getChainData } from './lib/utilities'
import Countdown from 'react-countdown';
import { numberWithCommas } from './utils';

require('dotenv').config();

const DURATION_STRATEGIC = 43200; //150 days
const DURATION_PRIVATE = 86400; // 300 days

const SUPPLY_PRIVATE = 8500000;
const SUPPLY_STRATEGIC = 8000000;

const BONUS_PRIVATE = 1500000;
const BONUS_STRATEGIC = 2000000;

const TOTAL = 10000000;

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

export const loadContract = async (abi: string, address: string) => {
    const abiFile = require(`./abi/${abi}.json`);
    const web3 = new Web3(Web3.givenProvider);
    const contract = new web3.eth.Contract(abiFile, address);
    return contract;
}


function App() {

  const [state, dispatch] = useReducer(reducer, initialState)
  const { provider, address } = state;

  const [vestingContract, setVestingContract] = React.useState<any>(null)
  const [vestingData, setVestingData] = React.useState<any>(null)

  let [totalReleased, setTotalReleased] = React.useState<number>(0)
  const [totalAvailable, setTotalAvailable] = React.useState<number>(0)
  const [remainingTime, setRemainingTime] = React.useState<number>(0)

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

  let a = 0;

  useEffect(() => {
    const load = async () => {
      console.log(address, 'curent user address')
      const vesting = await loadContract('MscpVesting', "0x636f5B7f2f14FeD506967E3CC4C3D45271F30b98" as string);
      (window as any).vesting = vesting;
      setVestingContract(vesting)
      console.log(vesting)
      const allocation = await vesting.methods.getAllocation().call({from: address})
      const remainingTime = await vesting.methods.getRemainingTime().call()
      const startTime = await vesting.methods.startTime().call()
      setRemainingTime(remainingTime);
      let data: any = {
        allocation: parseFloat(Web3.utils.fromWei(allocation, "ether")).toFixed(6),
        remainingTime,
        startTime,
      }
      let balances;
      if(address) {
        balances = await vesting.methods.balances(address).call()
        data['claimedBonus'] = balances['claimedBonus'];
        data['remainingCoins'] = parseFloat(Web3.utils.fromWei(balances['remainingCoins'], "ether")).toFixed(6);
        data['strategicInvestor'] = balances['strategicInvestor'];
        console.log('ready af')
        setVestingData(data);

        calculate(data);
        // setInterval(() => {
        //   calculate(data);
        // }, 1000);
      } else {
        setVestingData(data);
      }
       
      
      


    }
    load();
//calculate
//   setInterval(() => {
//     calculate()
//     console.log('doing smth')
//  }, 1000)
console.log(vestingData, 'vest')

  }, [address])

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

  const claim = async () => {
    const response = await vestingContract.methods.withdraw().send({from: address});
    console.log(response);
  }

  const getDuration = async () => {
    const isStrategicInvestor = vestingData?.strategicInvestor;
    const now = Math.floor(new Date().getTime()/1000);
    if(isStrategicInvestor) {
      if(now < (vestingData?.startTime + DURATION_STRATEGIC)) {
        return now - vestingData?.startTime;
      }
      return DURATION_STRATEGIC
    } else {
      if(now < (vestingData?.startTime + DURATION_PRIVATE)) {
        return now - vestingData?.startTime;
      }
      return DURATION_PRIVATE;
    }
  }

  const getAvailableTokens = async (vestingData: any) => {
    const isStrategicInvestor = vestingData?.strategicInvestor;
    const timePassed = await getDuration();
    const remainingCoins = vestingData?.remainingCoins;
    let tokenCount = 0;
    if(isStrategicInvestor) {
      const unclaimedPotential = (timePassed * SUPPLY_STRATEGIC / DURATION_STRATEGIC);
      tokenCount = unclaimedPotential - (SUPPLY_STRATEGIC - remainingCoins);
    } else {
      const unclaimedPotential = (timePassed * SUPPLY_PRIVATE / DURATION_PRIVATE);
      tokenCount = unclaimedPotential - (SUPPLY_PRIVATE - remainingCoins);
    }

    return tokenCount;
  }

  const calculate = async (vestingData: any) => {
    let resetTotalReleased = 0;
    const available = await getAvailableTokens(vestingData)
      if (vestingData?.claimedBonus) {
        if(vestingData?.strategicInvestor) {
          totalReleased = 0;
          setTotalReleased(resetTotalReleased);
          setTotalReleased(BONUS_STRATEGIC)
          setTotalReleased(parseFloat((totalReleased += SUPPLY_STRATEGIC - vestingData?.remainingCoins).toFixed(6)))
        } else {
          totalReleased = 0;
          setTotalReleased(resetTotalReleased);
          setTotalReleased(BONUS_PRIVATE)
          setTotalReleased(parseFloat((totalReleased += SUPPLY_PRIVATE - vestingData?.remainingCoins).toFixed(6)))
        }
        
        setTotalAvailable(available);
      } else {
        if(vestingData?.strategicInvestor) {
          setTotalAvailable(BONUS_STRATEGIC + available);
        } else {
          setTotalAvailable(BONUS_PRIVATE + available);
        }
        
      }

  }

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
                    {numberWithCommas(TOTAL)}
                    {/* { !vestingData ? '???' : vestingData['allocation']} */}
                  </p>
                </div>
                <div className="info-list--item">
                  <p>
                    Total Released
                  </p>
  
                  <p className="number">
                  { !totalReleased ? '???' : numberWithCommas(totalReleased)}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Available to claim
                  </p>
  
                  <p className="number">
                  { !totalAvailable ? '???' : numberWithCommas(totalAvailable)}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Vesting ends in
                  </p>
  
                  <p className="number">
                  { !vestingData ? '???' :  <Countdown date={Date.now() + (remainingTime * 1000)} /> }
                  </p>
                </div>
            </div>
  
            <button className="claim-btn" onClick={()=>{
              claim();
            }}>
              Claim
            </button>
        </div>
      </div>
      
    </div>
  );
}

export default App;
