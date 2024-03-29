import { useState } from "react"
import Countdown from "react-countdown";
import Web3 from "web3";
import { DURATION_PRIVATE, DURATION_STRATEGIC, numberWithCommas, renderer, TOTAL_BANTER } from "../utils"

const BanterPage = (props: any) => {
    const {address, contract} = props;
    const [startTime, setStartTime] = useState<any>(0);
    const [totalReleased, setTotalReleased] = useState<any>(0);
    const [totalAvailable, setTotalAvailable] = useState<any>(0);
    const [isStrategic, setIsStrategic] = useState<any>(false);
    const [showData, setShowData] = useState<any>(false);

 
    let start = (async () => {
        if(contract){
          const startTime = await contract.methods.startTime().call();
          setStartTime(startTime);
          if(startTime <= Math.round(new Date().getTime()/1000)){
            if(showData === false) {
              setShowData(true)
            }
          }
            if(address) {
                let totalReleased = await contract.methods.getTotalReleased().call({from: address});
                totalReleased = parseFloat(Web3.utils.fromWei(totalReleased, "ether")).toFixed(6);
                setTotalReleased(totalReleased);
                let totalAvailable = await contract.methods.getAvailableAmount().call({from: address});
                totalAvailable = parseFloat(Web3.utils.fromWei(totalAvailable, "ether")).toFixed(6);
                if(totalAvailable.toString().substr(-4) === "e+59"){
                  setTotalAvailable(0);
                } else {
                  setTotalAvailable(totalAvailable);
                }
            } else {
                setTotalAvailable(0);
                setTotalReleased(0);
            }
        }

    })

    start();

    setInterval(async () => {
        start();
    }, 1000 * 60)



    const claim = async () => {
        const response = await contract.methods.withdraw().send({from: address});
        if(response && response.status === true) {
            let totalReleased = await contract.methods.getTotalReleased().call({from: address});
            totalReleased = parseFloat(Web3.utils.fromWei(totalReleased, "ether")).toFixed(6);
            setTotalReleased(totalReleased);

            let totalAvailable = await contract.methods.getAvailableAmount().call({from: address});
            totalAvailable = parseFloat(Web3.utils.fromWei(totalAvailable, "ether")).toFixed(6);
            setTotalAvailable(totalAvailable);
        }
      }
      
      return (
        <div className="popup"> 
        <div className="popup-inner">
          <h1>
            MSCP Token Vesting
          </h1>
            <div className="info-list" >
                <div className="info-list--item">
                  <p>
                    Total Allocated
                  </p>
  
                  <p className="number">
                    {numberWithCommas(TOTAL_BANTER)}
                  </p>
                </div>
                <div className="info-list--item">
                  <p>
                    Total Released
                  </p>
  
                  <p className="number">
                  { (!showData) ? '???' : numberWithCommas(totalReleased)}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Available to claim
                  </p>
  
                  <p className="number">
                  { (!showData) ? '???' : numberWithCommas(totalAvailable)}
                  </p>
                </div>
  
                <div className="info-list--item">
                  <p>
                    Vesting ends in
                  </p>
  
                  <p className="number">
                  { (!showData || !startTime) ? '???' :  <Countdown renderer={renderer} date={startTime*1000 + (isStrategic ? Number(DURATION_STRATEGIC) : Number(DURATION_PRIVATE)) * 1000} /> }
                  </p>
                </div>
            </div>
            <span className="spacer"></span>
            <button className={`claim-btn ${(address && showData && totalAvailable > 0) ? 'active': 'inactive'}`} onClick={()=>{
                if(address && totalAvailable > 0) {
                    claim();
                }
            }}>
              Claim
            </button>
        </div>
      </div>
    );
}
export default BanterPage;