import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  AlbedoModule,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";

// Check if we are in the browser to prevent "window is not defined" error during SSR
const isBrowser = typeof window !== "undefined";

/**
 * Stellar Wallet Kit
 *
 * @description The Stellar Wallet Kit is used to connect to the wallet
 * @description The Stellar Wallet Kit is used to sign transactions
 * @description The Stellar Wallet Kit is used to get the wallet address
 */
export const kit: StellarWalletsKit = isBrowser
  ? new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule(), new AlbedoModule()],
    })
  : (null as unknown as StellarWalletsKit); // Placeholder for SSR

interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign Transaction Params
 *
 * @param unsignedTransaction - The unsigned transaction
 * @param address - The address of the wallet
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionParams): Promise<string> => {
  if (!kit) {
    throw new Error("StellarWalletsKit is only available in the browser.");
  }

  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  return signedTxXdr;
};
