import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css';
import Greeter from './contracts/Greeter.json'
import Token from './contracts/Token.json'

const greeterAddress = process.env.REACT_APP_GREETER_ADDRESS
const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS

function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState()
  const [result, setResult] = useState('')

  const [userAccount, setUserAccount] = useState()
  const [amount, setAmount] = useState()
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    fetchGreeting()
    getBalance()
  }, [])

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        setResult(data)
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
        alert('Something went wrong. Please check connection your wallet such as network, account')
      }
    } else {
      alert('Add a some Crypto Wallet')
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      console.log({ account })
      const balance = await contract.balanceOf(account);
      setBalance(+balance.toString())
      console.log("Balance: ", balance.toString());
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>{result}</h2>
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />

        <hr style={{ width: '100%' }} />

        <h2>Balance: {balance}</h2>
        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
        <input onChange={e => setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Amount" />
      </header>
    </div>
  );
}

export default App;
