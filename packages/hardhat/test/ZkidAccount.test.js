const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ZkidAccount Test", () => {
  let owner;
  let newOwner;
  let verifier0;
  let verifier1;
  let verifier2;
  let guardian0;
  let guardian1;
  let guardian2;

  let verifier0Addr;
  let verifier1Addr;
  let verifier2Addr;
  let guardian0Addr;
  let guardian1Addr;
  let guardian2Addr;

  let zkidAccount;

  const MOCK_ENTRYPOINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const ADDRESS_ZERO = ethers.constants.AddressZero;
  const MOCK_PROPOSAL_NUM = 0;

  beforeEach(async () => {
    [
      owner,
      newOwner,
      verifier0,
      verifier1,
      verifier2,
      guardian0,
      guardian1,
      guardian2,
    ] = await ethers.getSigners();

    verifier0Addr = await verifier0.getAddress();
    verifier1Addr = await verifier1.getAddress();
    verifier2Addr = await verifier2.getAddress();

    guardian0Addr = await guardian0.getAddress();
    guardian1Addr = await guardian1.getAddress();
    guardian2Addr = await guardian2.getAddress();

    const ZkidAccountFactory = await ethers.getContractFactory(
      "ZkidAccountFactory",
      owner
    );
    const zkidAccountFactory = await ZkidAccountFactory.deploy(MOCK_ENTRYPOINT);
    await zkidAccountFactory.deployed();

    const salt = 0;
    const counterfactualAccountAddress = await zkidAccountFactory.getAddress(
      await owner.getAddress(),
      salt
    );

    await zkidAccountFactory.createAccount(await owner.getAddress(), salt);

    zkidAccount = await ethers.getContractAt(
      "ZkidAccount",
      counterfactualAccountAddress,
      owner
    );
  });

  describe("Passing Test", () => {
    it("Should success if set newOwner", async () => {
      expect(await zkidAccount.newOwner()).to.equal(ADDRESS_ZERO);

      const newOwnerAddr = await newOwner.getAddress();
      await zkidAccount.connect(owner).recordNewOwner(newOwnerAddr);
      expect(await zkidAccount.newOwner()).to.equal(newOwnerAddr);
    });

    it("Should success if registrate verifier", async () => {
      expect(await zkidAccount.VERIFIER0()).to.equal(ADDRESS_ZERO);
      expect(await zkidAccount.VERIFIER1()).to.equal(ADDRESS_ZERO);
      expect(await zkidAccount.VERIFIER2()).to.equal(ADDRESS_ZERO);

      await zkidAccount.verifierRegistrate([
        verifier0Addr,
        verifier1Addr,
        verifier2Addr,
      ]);

      expect(await zkidAccount.VERIFIER0()).to.equal(verifier0Addr);
      expect(await zkidAccount.VERIFIER1()).to.equal(verifier1Addr);
      expect(await zkidAccount.VERIFIER2()).to.equal(verifier2Addr);
    });

    it("Should success if submit vpVerify Result", async () => {
      await zkidAccount.verifierRegistrate([
        verifier0Addr,
        verifier1Addr,
        verifier2Addr,
      ]);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier0Addr
        )
      ).to.equal(0);

      await zkidAccount
        .connect(verifier0)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, true);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier0Addr
        )
      ).to.equal(1);

      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(true);
    });

    it("Should success if guardian submit recovery", async () => {
      // owner registrate verifier
      await zkidAccount.verifierRegistrate([
        verifier0Addr,
        verifier1Addr,
        verifier2Addr,
      ]);

      // verifier submit guardian qualification certification result
      await zkidAccount
        .connect(verifier0)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, false);
      await zkidAccount
        .connect(verifier1)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, true);
      await zkidAccount
        .connect(verifier2)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, true);

      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(0);
      await expect(
        zkidAccount.connect(guardian0).submitRecovery(MOCK_PROPOSAL_NUM, true)
      )
        .to.emit(zkidAccount, "RecoveryProposal")
        .withArgs(MOCK_PROPOSAL_NUM, guardian0Addr);
      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(1);
    });
  });

  describe("Reverting Test", () => {
    it("Should revert if registrate same verifier", async () => {
      expect(await zkidAccount.VERIFIER0()).to.equal(ADDRESS_ZERO);
      expect(await zkidAccount.VERIFIER1()).to.equal(ADDRESS_ZERO);
      expect(await zkidAccount.VERIFIER2()).to.equal(ADDRESS_ZERO);

      await expect(
        zkidAccount.verifierRegistrate([
          verifier0Addr,
          verifier0Addr,
          verifier2Addr,
        ])
      ).to.be.revertedWith("must input 3 different verifiers");
    });
  });

  describe("Complete Process", () => {
    it("Success: complete process", async () => {
      // step0: owner record newOwner
      const newOwnerAddr = await newOwner.getAddress();
      await zkidAccount.connect(owner).recordNewOwner(newOwnerAddr);

      // step1: owner registrate three verifiers
      await zkidAccount.verifierRegistrate([
        verifier0Addr,
        verifier1Addr,
        verifier2Addr,
      ]);

      // step2: verifier submit qulification certification for every guardians
      // for guardian0
      await zkidAccount
        .connect(verifier0)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, false);
      await zkidAccount
        .connect(verifier1)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, true);
      await zkidAccount
        .connect(verifier2)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian0Addr, true);

      // for guardian1
      await zkidAccount
        .connect(verifier0)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian1Addr, true);
      await zkidAccount
        .connect(verifier1)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian1Addr, false);
      await zkidAccount
        .connect(verifier2)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian1Addr, true);

      // for guardian2
      await zkidAccount
        .connect(verifier0)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian2Addr, true);
      await zkidAccount
        .connect(verifier1)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian2Addr, true);
      await zkidAccount
        .connect(verifier2)
        .submitVpVerifyRes(MOCK_PROPOSAL_NUM, guardian2Addr, false);

      // step3: guardian submit recovery feedback
      // guardian0
      await zkidAccount
        .connect(guardian0)
        .submitRecovery(MOCK_PROPOSAL_NUM, false);
      await zkidAccount
        .connect(guardian1)
        .submitRecovery(MOCK_PROPOSAL_NUM, true);
      await zkidAccount
        .connect(guardian2)
        .submitRecovery(MOCK_PROPOSAL_NUM, true);

      // reset pre-check
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(true);
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian1Addr)
      ).to.equal(true);
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian2Addr)
      ).to.equal(true);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier0Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier0Addr
        )
      ).to.equal(1);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier0Addr
        )
      ).to.equal(1);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier1Addr
        )
      ).to.equal(1);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier1Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier1Addr
        )
      ).to.equal(1);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier2Addr
        )
      ).to.equal(1);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier2Addr
        )
      ).to.equal(1);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier2Addr
        )
      ).to.equal(0);

      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(0);
      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian1Addr)
      ).to.equal(1);
      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian2Addr)
      ).to.equal(1);

      // step4: owner request a changeOwner request
      expect(await zkidAccount.owner()).to.equal(await owner.getAddress());
      await expect(
        zkidAccount.changeOwner(MOCK_PROPOSAL_NUM, [
          guardian0Addr,
          guardian1Addr,
          guardian2Addr,
        ])
      )
        .to.emit(zkidAccount, "ChangeOwner")
        .withArgs(await owner.getAddress(), newOwnerAddr);
      expect(await zkidAccount.owner()).to.equal(newOwnerAddr);

      // reset check
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(false);
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian1Addr)
      ).to.equal(false);
      expect(
        await zkidAccount.isGuardian(MOCK_PROPOSAL_NUM, guardian2Addr)
      ).to.equal(false);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier0Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier0Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier0Addr
        )
      ).to.equal(0);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier1Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier1Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier1Addr
        )
      ).to.equal(0);

      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian0Addr,
          verifier2Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian1Addr,
          verifier2Addr
        )
      ).to.equal(0);
      expect(
        await zkidAccount.isQualified(
          MOCK_PROPOSAL_NUM,
          guardian2Addr,
          verifier2Addr
        )
      ).to.equal(0);

      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian0Addr)
      ).to.equal(0);
      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian1Addr)
      ).to.equal(0);
      expect(
        await zkidAccount.aggreeOrNot(MOCK_PROPOSAL_NUM, guardian2Addr)
      ).to.equal(0);
    });
  });
});
