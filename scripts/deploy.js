const hre = require("hardhat");

async function main() {
  console.log("Deploying TalentStake contract...");

  // Get the USDC contract address for Base Sepolia
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

  // Get the contract factory
  const TalentStake = await hre.ethers.getContractFactory("TalentStake");

  // Deploy the contract
  const talentStake = await TalentStake.deploy(USDC_ADDRESS);

  // Wait for deployment to complete
  await talentStake.waitForDeployment();

  const contractAddress = await talentStake.getAddress();

  console.log("TalentStake deployed to:", contractAddress);
  console.log("USDC Address:", USDC_ADDRESS);

  // Verify contract on Etherscan (Base Sepolia)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Base Sepolia...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [USDC_ADDRESS],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
