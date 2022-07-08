const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const { impersonateFundErc20 } = require("../utils/utilities");

const {
  abi,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

const provider = waffle.provider;

describe("FlashSwap Contract", () => {
  let FLASHSWAP,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage,
    gasUsedUSD;

  const DECIMALS = 18;

  const BUSD_WHALE = "0xf977814e90da44bfa03b6295a0616a897441acec";

  const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
  const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
  const CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
  const USDT = "0x55d398326f99059ff775485246999027b3197955";
  const CROX = "0x2c094f5a7d1146bb93850f629501eb749f6ed491";

  const BASE_TOKEN_ADRESS = BUSD;

  const tokenBase = new ethers.Contract(BASE_TOKEN_ADRESS, abi, provider);

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const whale_balance = await provider.getBalance(BUSD_WHALE);
    console.log(
      "whale balance : ",
      ethers.utils.formatUnits(whale_balance.toString(), DECIMALS)
    );
    expect(whale_balance).not.equal("0");

    const FlashSwap = await ethers.getContractFactory("PancakeFlashSwap");
    FLASHSWAP = await FlashSwap.deploy();
    await FLASHSWAP.deployed();

    const borrowAmountHuman = "1";
    BORROW_AMOUNT = ethers.utils.parseUnits(borrowAmountHuman, DECIMALS);

    initialFundingHuman = "100";
    FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS);

    await impersonateFundErc20(
      tokenBase,
      BUSD_WHALE,
      FLASHSWAP.address,
      initialFundingHuman
    );
  });

  describe("Arbitrage Execution", () => {
    it("ensures the contract is funded", async () => {
      const flashSwapBalance = await FLASHSWAP.getBalanceOfToken(
        BASE_TOKEN_ADRESS
      );
      const flashSwapBalanceHuman = ethers.utils.formatUnits(
        flashSwapBalance,
        DECIMALS
      );

      expect(Number(flashSwapBalanceHuman)).equal(Number(initialFundingHuman));
    });

    it("excutes the arbitrage", async () => {
      txArbitrage = await FLASHSWAP.startArbitrage(
        BASE_TOKEN_ADRESS,
        BORROW_AMOUNT
      );

      assert(txArbitrage);

      const contractBalanceBUSD = await FLASHSWAP.getBalanceOfToken(BUSD);
      const formattedBalanceBUSD = Number(
        ethers.utils.formatUnits(contractBalanceBUSD, DECIMALS)
      );
      console.log("Balance of BUSD : ", formattedBalanceBUSD);
    });
  });
});
