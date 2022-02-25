import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

const TOKEN_ADDRESS = "0x63bfb2118771bd0da7a6936667a7bb705a06c1ba";
const TOKEN_DECIMALS = 18;

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Balancer contract`);

  // Initialize the wallet.
  const wallet = new Wallet("55e61ae8b26e7cf953644c591141a3ec9709606714527172cc31a1ecbe7d7ef7");

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("BalanceChecker");

  // Deposit some funds to L2 in order to be able to perform L2 transactions.
  const deploymentFee = await deployer.estimateDeployFee(artifact, []);

  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: deploymentFee.mul(2),
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const balancerContract = await deployer.deploy(artifact, []);

  // Show the contract info.
  const contractAddress = balancerContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  const getBalance = await balancerContract.balances(["0x9dB142a204049AbA8a82A6F69da070bE5D99358b"],["0x5c221e77624690fff6dd741493d735a17716c26b"])
  console.log(getBalance)
}