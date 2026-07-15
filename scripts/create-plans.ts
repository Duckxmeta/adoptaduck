import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } from '@solana/web3.js';
import { getCreatePlanInstruction, findPlanPda } from '@solana/subscriptions';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Config parameters
const SANCTUARY_WALLET = "AKkgD4kg8bq7sPUXhqWLqNPBcvtXXhevx3TQCkuxpUQY";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SUBSCRIPTIONS_PROGRAM_ID_STR = "De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44";
const BILLING_CYCLE_HOURS = 720; // 30 days

const PLANS_TO_CREATE = [
  { amount: 10 * 1_000_000, index: 2, label: "$10 USD" },
  { amount: 25 * 1_000_000, index: 3, label: "$25 USD" },
  { amount: 35 * 1_000_000, index: 4, label: "$35 USD" }
];

async function run() {
  console.log("Initializing Solana Connection...");
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

  // Load merchant private key from env
  const privateKeyString = process.env.MERCHANT_PRIVATE_KEY;
  if (!privateKeyString) {
    console.error("Error: MERCHANT_PRIVATE_KEY is missing in your environment variables.");
    process.exit(1);
  }

  // Parse private key array
  let secretKey;
  try {
    secretKey = Uint8Array.from(JSON.parse(privateKeyString));
  } catch (e) {
    console.error("Error: MERCHANT_PRIVATE_KEY must be a valid JSON array of numbers.");
    process.exit(1);
  }

  const merchantKeypair = Keypair.fromSecretKey(secretKey);
  const merchantPublicKey = merchantKeypair.publicKey;
  const targetSanctuaryPublicKey = new PublicKey(SANCTUARY_WALLET);

  console.log(`Merchant Public Key: ${merchantPublicKey.toBase58()}`);
  console.log(`Target Sanctuary Wallet: ${targetSanctuaryPublicKey.toBase58()}`);

  if (merchantPublicKey.toBase58() !== targetSanctuaryPublicKey.toBase58()) {
    console.warn("Warning: The loaded merchant keypair public key does not match the configured sanctuary wallet address.");
  }

  // Loop through and create each plan
  for (const plan of PLANS_TO_CREATE) {
    console.log(`\n========================================`);
    console.log(`Starting initialization for ${plan.label} (Index: ${plan.index})...`);
    console.log(`========================================`);

    // Calculate the Plan PDA address using the official client
    const [planPdaAddress] = await findPlanPda({
      owner: merchantPublicKey.toBase58(),
      planId: BigInt(plan.index)
    });
    const planPda = new PublicKey(planPdaAddress);
    console.log(`Derived Plan PDA Address: ${planPda.toBase58()}`);

    // Construct the instruction using `@solana/subscriptions`
    const ixObj = getCreatePlanInstruction({
      merchant: merchantPublicKey.toBase58(),
      planPda: planPda.toBase58(),
      tokenMint: USDC_MINT,
      planData: {
        planId: BigInt(plan.index),
        mint: USDC_MINT,
        terms: {
          amount: BigInt(plan.amount),
          periodHours: BigInt(BILLING_CYCLE_HOURS),
          createdAt: BigInt(Math.floor(Date.now() / 1000))
        },
        endTs: 0n,
        destinations: [
          merchantPublicKey.toBase58(),
          SystemProgram.programId.toBase58(),
          SystemProgram.programId.toBase58(),
          SystemProgram.programId.toBase58()
        ],
        pullers: [
          merchantPublicKey.toBase58(),
          SystemProgram.programId.toBase58(),
          SystemProgram.programId.toBase58(),
          SystemProgram.programId.toBase58()
        ],
        metadataUri: `https://adoptaduck.org/metadata/plan${plan.index}.json`
      }
    });

    // Convert to legacy Web3.js TransactionInstruction
    const txInstruction = new TransactionInstruction({
      keys: [
        { pubkey: merchantPublicKey, isSigner: true, isWritable: true },
        { pubkey: planPda, isSigner: false, isWritable: true },
        { pubkey: new PublicKey(USDC_MINT), isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
      ],
      programId: new PublicKey(ixObj.programAddress),
      data: Buffer.from(ixObj.data)
    });

    const transaction = new Transaction().add(txInstruction);
    transaction.feePayer = merchantPublicKey;

    console.log("Fetching recent blockhash...");
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    console.log("Signing and sending transaction...");
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [merchantKeypair],
        { commitment: 'confirmed' }
      );
      console.log(`Success! Plan initialized.`);
      console.log(`Transaction Signature: ${signature}`);
      console.log(`Plan PDA Address: ${planPda.toBase58()}`);
      console.log(`Verify on Solscan: https://solscan.io/tx/${signature}`);
    } catch (err: any) {
      console.error(`Error initializing plan ${plan.label}:`, err.message || err);
      if (err.logs) {
        console.error("Simulation logs:", err.logs);
      }
    }
  }
}

run().catch((err) => {
  console.error("Execution error:", err);
});
