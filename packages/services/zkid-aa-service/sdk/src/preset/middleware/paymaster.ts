import { ethers } from "ethers";
import { UserOperationMiddlewareFn } from "../../types";
import { ERC4337 } from "../../constants";
import { POLICY_ID, DUMMY_PM_SIG } from "../../constants/alchemy_pm";

interface VerifyingPaymasterResult {
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
}

// Assumes the paymaster interface in https://hackmd.io/@stackup/H1oIvV-qi
export const verifyingPaymaster =
  (paymasterRpc: string, context: any): UserOperationMiddlewareFn =>
  async (ctx) => {
    ctx.op.verificationGasLimit = ethers.BigNumber.from(
      ctx.op.verificationGasLimit
    ).mul(3);

    const provider = new ethers.providers.JsonRpcProvider(paymasterRpc);
    const pm = (await provider.send("alchemy_requestGasAndPaymasterAndData", [
      {
        policyId: POLICY_ID,
        entryPoint: ERC4337.EntryPoint,
        dummySignature: DUMMY_PM_SIG,
        userOperation: {
          sender: ctx.op.sender,
          nonce: ethers.BigNumber.from(ctx.op.nonce).toHexString(),
          initCode: ctx.op.initCode,
          callData: ctx.op.callData,
        },
      },
    ])) as VerifyingPaymasterResult;

    ctx.op.paymasterAndData = pm.paymasterAndData;
    ctx.op.preVerificationGas = pm.preVerificationGas;
    ctx.op.verificationGasLimit = pm.verificationGasLimit;
    ctx.op.callGasLimit = pm.callGasLimit;
  };
