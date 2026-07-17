"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Loader2, 
  Wallet, 
  ArrowRight, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Coins,
  Repeat,
  Egg
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Recipient Solana Address for donations
const RECIPIENT_ADDRESS = "AKkgD4kg8bq7sPUXhqWLqNPBcvtXXhevx3TQCkuxpUQY";
// Solana Subscriptions Program ID
const SUBSCRIPTIONS_PROGRAM_ID_STR = "De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44";
// USDC Mint Address on Solana Mainnet
const USDC_MINT_STR = "EPjFW3dp5G7jE23PLy1wGP3nXnu35iXcrrwv3EXmFi5m";

// Mainnet Plan PDA Mappings
const PLAN_PDAS = {
  5: "8xSDqCPB5G9ejVs84sFWxKZwxonMHNNEsyphVyW5jgM6",
  10: "7cJt28atSPDsQNBqb2QxaXmAhvnbKQHcc86h3FhVtxMy",
  25: "RQURhD8FfMXZLnkvgR2B3USNoLpzPgoSXcvcrkefghe",
  35: "Fz6kePv6VshURDQapYqGeDaNP32er9CiGqRJCz7J7VaA",
};

export function SolanaCheckout() {
  const { toast } = useToast();
  const [checkoutMode, setCheckoutMode] = useState<'one-time' | 'monthly'>('one-time');
  const [oneTimeAsset, setOneTimeAsset] = useState<'sol' | 'usdc'>('sol');

  // ONE-TIME DONATION STATE
  const [oneTimeAmount, setOneTimeAmount] = useState<string>('10');

  // SUBSCRIPTION STATE
  const [selectedTier, setSelectedTier] = useState<number>(10); // $5, $10, or $20
  const [allocation, setAllocation] = useState<string>("General Operations");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txSignature, setTxSignature] = useState<string>('');
  const [txStep, setTxStep] = useState<string>('');

  // COPY ADDRESS STATE
  const [copied, setCopied] = useState(false);

  // Reset transaction status on tab switch
  useEffect(() => {
    setTxSignature('');
    setTxStep('');
  }, [checkoutMode]);

  // Update default one-time amount when toggling between SOL and USDC assets
  useEffect(() => {
    if (oneTimeAsset === 'sol') {
      setOneTimeAmount('0.05');
    } else {
      setOneTimeAmount('10');
    }
  }, [oneTimeAsset]);

  // SOLANA PAY LINK GENERATOR
  const solanaPayUri = useMemo(() => {
    const label = encodeURIComponent("Decent Ducks Sanctuary");
    const message = encodeURIComponent(`One-Time Donation (${oneTimeAmount} ${oneTimeAsset.toUpperCase()})`);
    let uri = `solana:${RECIPIENT_ADDRESS}?amount=${oneTimeAmount}&label=${label}&message=${message}`;
    if (oneTimeAsset === 'usdc') {
      uri += `&spl-token=${USDC_MINT_STR}`;
    }
    return uri;
  }, [oneTimeAmount, oneTimeAsset]);

  // QR CODE IMAGE URL
  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(solanaPayUri)}&bgcolor=1A1A1A&color=ffffff&margin=15`;
  }, [solanaPayUri]);

  // HANDLE COPY SOLANA ADDRESS
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(RECIPIENT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // WALLET UTILITIES
  const getProvider = () => {
    if (typeof window === 'undefined') return null;
    const anyWindow = window as any;
    return anyWindow?.phantom?.solana || anyWindow?.solana || null;
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (!provider) {
      toast({
        variant: "destructive",
        title: "Wallet Not Found",
        description: "Please install Phantom or another Solana wallet extension.",
      });
      return;
    }

    try {
      setTxStep("Connecting to wallet...");
      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      setWalletAddress(pubKey);
      setWalletConnected(true);
      setTxStep("");
      toast({
        title: "Wallet Connected",
        description: `Connected to ${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
      });
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      setTxStep("");
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err.message || "User rejected the request.",
      });
    }
  };

  // BUILD AND SEND NATIVE SOL OR USDC ONE-TIME TRANSFER TRANSACTION
  const handleSendOneTimeDonation = async () => {
    const provider = getProvider();
    if (!provider || !walletConnected || !walletAddress) {
      await connectWallet();
      return;
    }

    setIsProcessingTx(true);
    setTxSignature('');
    try {
      const web3 = await import('@solana/web3.js');
      const { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction, LAMPORTS_PER_SOL } = web3;

      const fromKey = new PublicKey(walletAddress);
      const toKey = new PublicKey(RECIPIENT_ADDRESS);

      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const transaction = new Transaction();
      transaction.feePayer = fromKey;

      const amountToTransfer = parseFloat(oneTimeAmount);
      if (isNaN(amountToTransfer) || amountToTransfer <= 0) {
        throw new Error("Invalid transfer amount");
      }

      if (oneTimeAsset === 'sol') {
        const lamports = Math.round(amountToTransfer * LAMPORTS_PER_SOL);

        setTxStep("Building transaction...");
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: fromKey,
          toPubkey: toKey,
          lamports: BigInt(lamports),
        });
        transaction.add(transferInstruction);
      } else {
        const amountInUsdcUnits = Math.round(amountToTransfer * 1_000_000);

        setTxStep("Resolving token accounts...");
        const USDC_MINT = new PublicKey(USDC_MINT_STR);
        const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

        const [sourceAta] = PublicKey.findProgramAddressSync(
          [fromKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const [destinationAta] = PublicKey.findProgramAddressSync(
          [toKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        setTxStep("Building USDC transfer...");
        const data = new Uint8Array(9);
        data[0] = 3;
        
        let temp = BigInt(amountInUsdcUnits);
        for (let i = 1; i <= 8; i++) {
          data[i] = Number(temp & BigInt(0xff));
          temp = temp >> BigInt(8);
        }

        const transferInstruction = new TransactionInstruction({
          keys: [
            { pubkey: sourceAta, isSigner: false, isWritable: true },
            { pubkey: destinationAta, isSigner: false, isWritable: true },
            { pubkey: fromKey, isSigner: true, isWritable: false },
          ],
          programId: TOKEN_PROGRAM_ID,
          data: data,
        });
        transaction.add(transferInstruction);
      }

      setTxStep("Fetching blockhash...");
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      setTxStep("Awaiting wallet approval...");
      const signedTx = await provider.signTransaction(transaction);

      setTxStep("Broadcasting transaction...");
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      setTxStep("Confirming payment...");
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);
      setTxStep("Success");
      
      // Update running aggregates in database
      const usdValue = oneTimeAsset === 'sol' ? parseFloat(oneTimeAmount) * 150 : parseFloat(oneTimeAmount);
      await recordSolanaDonation(usdValue, `One-Time ${oneTimeAsset.toUpperCase()} Support`, signature);

      toast({
        title: "Donation Complete!",
        description: `Successfully donated ${oneTimeAmount} ${oneTimeAsset.toUpperCase()}. Thank you!`,
      });
    } catch (err: any) {
      console.error("Solana One-Time Donation Failed:", err);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: err.message || "Failed to submit donation.",
      });
      setTxStep("");
    } finally {
      setIsProcessingTx(false);
    }
  };

  // Update running aggregates in firestore transparency tracking
  const recordSolanaDonation = async (usdValue: number, designation: string, signature: string) => {
    try {
      const { initializeFirebase } = await import('@/firebase/init');
      const { doc, setDoc, increment, collection, addDoc } = await import('firebase/firestore');
      const { firestore } = initializeFirebase();

      // 1. Add donation record document
      await addDoc(collection(firestore, 'donations'), {
        amount: usdValue,
        designation: designation,
        allocation: allocation, // Attach selected choice as metadata attribute
        isAnonymous: isAnonymous,
        timestamp: new Date().toISOString(),
        donorDisplayName: isAnonymous ? 'Anonymous' : (walletAddress ? `Solana Wallet (${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)})` : 'Sanctuary Supporter'),
        uid: isAnonymous ? null : (walletAddress || null),
        senderWallet: walletAddress || null, // Sender wallet string
        signature: signature, // Transaction data / signature
        metadata: 'Solana Web3 Donation',
        status: 'completed'
      });

      // 2. Increment aggregates
      const totalsRef = doc(firestore, 'transparency', 'totals');
      await setDoc(totalsRef, {
        total_donations_count: increment(1),
        total_usd_value_received: increment(usdValue)
      }, { merge: true });
    } catch (e) {
      console.error("Failed to update aggregates on Solana payment completion:", e);
    }
  };



  const disconnectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      await provider.disconnect();
    }
    setWalletConnected(false);
    setWalletAddress('');
    setTxSignature('');
    setTxStep('');
  };

  // BUILD AND SEND SUBSCRIPTION DELEGATION TRANSACTION
  const handleApproveSubscription = async () => {
    const provider = getProvider();
    if (!provider || !walletConnected || !walletAddress) {
      await connectWallet();
      return;
    }

    setIsProcessingTx(true);
    setTxSignature('');
    try {
      // Dynamic import to prevent SSR issues during build time
      setTxStep("Loading Solana SDK...");
      const web3 = await import('@solana/web3.js');
      const { Connection, PublicKey, Transaction, TransactionInstruction } = web3;

      const ownerKey = new PublicKey(walletAddress);
      const SUBSCRIPTIONS_PROGRAM_ID = new PublicKey(SUBSCRIPTIONS_PROGRAM_ID_STR);
      const USDC_MINT = new PublicKey(USDC_MINT_STR);
      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

      // 1. Calculate Associated Token Account (ATA) for user's USDC
      setTxStep("Resolving token accounts...");
      const [usdcAta] = PublicKey.findProgramAddressSync(
        [ownerKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // 2. Build SPL Token Approve Instruction (Index 4 in Token Program)
      // USDC has 6 decimal places. Fixed tiers are $5, $10, or $20.
      const amountInUsdcUnits = selectedTier * 1_000_000;
      
      const data = new Uint8Array(9);
      data[0] = 4; // Approve instruction index
      
      // Write amount as a 64-bit unsigned integer (little-endian)
      let temp = BigInt(amountInUsdcUnits);
      for (let i = 1; i <= 8; i++) {
        data[i] = Number(temp & BigInt(0xff));
        temp = temp >> BigInt(8);
      }

      const approveInstruction = new TransactionInstruction({
        keys: [
          { pubkey: usdcAta, isSigner: false, isWritable: true },
          { pubkey: SUBSCRIPTIONS_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ownerKey, isSigner: true, isWritable: false },
        ],
        programId: TOKEN_PROGRAM_ID,
        data: data,
      });

      // 3. Build Solana Transaction
      setTxStep("Fetching blockhash...");
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const transaction = new Transaction().add(approveInstruction);
      transaction.feePayer = ownerKey;

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // 4. Request Signature from Wallet
      setTxStep("Awaiting wallet approval...");
      const signedTx = await provider.signTransaction(transaction);

      // 5. Send and Confirm Transaction
      setTxStep("Broadcasting transaction...");
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      setTxStep("Confirming subscription...");
      await connection.confirmTransaction(signature, "confirmed");

      setTxSignature(signature);
      setTxStep("Success");

      // Update running aggregates in database
      await recordSolanaDonation(selectedTier, 'Guardian Subscription', signature);

      toast({
        title: "Subscription Pre-approved!",
        description: `Successfully authorized $${selectedTier}/mo USDC recurring subscription.`,
      });
    } catch (err: any) {
      console.error("Solana Subscription TX Failed:", err);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: err.message || "Failed to submit subscription approval.",
      });
      setTxStep("");
    } finally {
      setIsProcessingTx(false);
    }
  };

  return (
    <Card className="border-2 border-primary/40 rounded-[2.5rem] bg-card p-4 sm:p-6 md:p-10 shadow-2xl relative overflow-hidden w-full max-w-full">
      {/* Background flare */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="flex flex-col items-center sm:items-stretch justify-center w-full max-w-full overflow-hidden space-y-6">
        {/* Component Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6 w-full">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-2">
              <Coins className="h-6 w-6 text-primary" /> Solana Pay & Subscriptions
            </h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">
              Direct, instant Web3 checkout pipeline
            </p>
          </div>
          
          {/* Tab toggles */}
          <div className="flex bg-background border border-border p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setCheckoutMode('one-time')}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center",
                checkoutMode === 'one-time' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              One-Time
            </button>
            <button
              onClick={() => setCheckoutMode('monthly')}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1",
                checkoutMode === 'monthly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Repeat className="h-3 w-3" /> Monthly
            </button>
          </div>
        </div>

        {/* Promotional Mint Card */}
        <div className="border border-secondary/30 rounded-[2rem] bg-secondary/5 p-5 md:p-6 w-full max-w-full overflow-hidden mb-8 relative">
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left flex-1">
              <Badge variant="outline" className="border-secondary/40 text-secondary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mx-auto md:mx-0 block w-max">
                Decent Ducks V2 Egg Collection
              </Badge>
              <h4 className="text-lg md:text-xl font-headline font-black uppercase text-foreground">
                Mint an Egg & Support the Sanctuary
              </h4>
              <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed max-w-xl">
                Donations go directly toward funding our offline duck sanctuary operations, and in return, you will receive one of 1,776 unique, collectible on-chain digital eggs that will hatch into a sanctuary duck!
              </p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-2">
              <Button
                asChild
                className="w-full md:w-auto px-8 min-h-[3.5rem] h-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black text-xs tracking-widest uppercase rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <a 
                  href="https://justduckeggs.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Egg className="h-4 w-4" /> MINT EGG
                </a>
              </Button>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Price: 0.2 SOL / Egg
              </span>
            </div>
          </div>
        </div>

        {/* ONE-TIME DONATIONS (SOLANA PAY) */}
        {checkoutMode === 'one-time' && (
          <div className="grid md:grid-cols-12 gap-8 items-center w-full justify-items-center">
            {/* Input & details column */}
            <div className="md:col-span-7 space-y-6 w-full">
              {/* Asset Selector */}
              <div className="space-y-2 text-center md:text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center md:text-left">
                  Select Donation Asset
                </Label>
                <div className="flex bg-background border border-border p-1 rounded-xl w-full max-w-md mx-auto md:mx-0">
                  <button
                    type="button"
                    onClick={() => setOneTimeAsset('sol')}
                    className={cn(
                      "flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center",
                      oneTimeAsset === 'sol' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    SOL
                  </button>
                  <button
                    type="button"
                    onClick={() => setOneTimeAsset('usdc')}
                    className={cn(
                      "flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all text-center",
                      oneTimeAsset === 'usdc' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    USDC
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-center md:text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center md:text-left">
                  Select Donation Amount ({oneTimeAsset.toUpperCase()})
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center w-full px-0 max-w-md mx-auto md:mx-0">
                  {(oneTimeAsset === 'usdc' ? ['5', '10', '25', '50'] : ['0.05', '0.1', '0.25', '0.5']).map((val, idx) => {
                    let sublabel = "";
                    if (oneTimeAsset === 'usdc') {
                      if (idx === 0) sublabel = "4lbs of Peas";
                      else if (idx === 1) sublabel = "2 Watermelons / Pumpkins";
                      else if (idx === 2) sublabel = "1 Bag of Flock Feed";
                      else if (idx === 3) sublabel = "Flock Care Pack";
                    }

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setOneTimeAmount(val)}
                        className={cn(
                          "w-full p-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[5.5rem]",
                          oneTimeAmount === val ? "border-primary bg-primary/10 text-primary scale-105" : "border-border hover:border-primary/30"
                        )}
                      >
                        <span className="font-headline font-black text-xs sm:text-sm">
                          {oneTimeAsset === 'usdc' ? `$${val}` : `${val} SOL`}
                        </span>
                        {sublabel && (
                          <span className="text-[9px] leading-tight text-muted-foreground font-semibold font-sans">
                            {sublabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 text-center md:text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center md:text-left">
                  Or Custom {oneTimeAsset.toUpperCase()} Amount
                </Label>
                <div className="relative w-full max-w-md mx-auto md:mx-0">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground font-black text-xs uppercase tracking-wider">{oneTimeAsset}</span>
                  <Input
                    type="number"
                    min="0.001"
                    step="any"
                    value={oneTimeAmount}
                    onChange={(e) => setOneTimeAmount(e.target.value)}
                    className="pl-16 bg-background border-border h-12 rounded-xl font-black text-sm text-center md:text-left"
                  />
                </div>
              </div>

              {/* Solana Recipient Block */}
              <div className="space-y-1 text-center md:text-left w-full max-w-md mx-auto md:mx-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                  Recipient Wallet Address
                </span>
                <div className="bg-background/50 border border-border px-4 py-3 rounded-xl flex items-center justify-between gap-2 overflow-hidden w-full">
                  <code className="text-xs font-mono break-all break-words whitespace-normal text-muted-foreground flex-1 text-center md:text-left">{RECIPIENT_ADDRESS}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyAddress} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Allocation Selector */}
              <div className="space-y-2 text-center md:text-left w-full max-w-md mx-auto md:mx-0 pt-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center md:text-left">
                  Direct Your Impact
                </Label>
                <select
                  value={allocation}
                  onChange={(e) => setAllocation(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Feed & Nutrition">Feed & Nutrition</option>
                  <option value="Medical Care">Medical Care</option>
                  <option value="Sanctuary Infrastructure">Sanctuary Infrastructure</option>
                  <option value="General Operations">General Operations</option>
                </select>
              </div>

              {/* Anonymity Toggle */}
              <div className="flex items-center gap-2 pt-2 justify-center md:justify-start w-full max-w-md mx-auto md:mx-0">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <label 
                  htmlFor="anonymous-toggle" 
                  className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer select-none"
                >
                  Hide my name on the public member dashboard ledger
                </label>
              </div>

              {/* Action Button for One-Time */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <Button
                  onClick={handleSendOneTimeDonation}
                  disabled={isProcessingTx}
                  className="w-full max-w-md min-h-[3.5rem] h-auto py-3 px-4 bg-primary text-primary-foreground font-black text-[10px] sm:text-xs tracking-widest uppercase rounded-xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center text-center break-words"
                >
                  {isProcessingTx ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> {txStep || "Processing..."}
                    </span>
                  ) : (
                    <>SEND {oneTimeAmount} {oneTimeAsset.toUpperCase()} DONATION <ArrowRight className="ml-2 h-4 w-4 shrink-0" /></>
                  )}
                </Button>

                {txSignature && (
                  <div className="w-full text-center space-y-2 animate-in fade-in">
                    <div className="text-xs text-green-500 font-black flex items-center justify-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Donation Confirmed!
                    </div>
                    <a 
                      href={`https://solscan.io/tx/${txSignature}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      Verify Transaction on Solscan <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {txStep && !txSignature && (
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    Current Step: {txStep}
                  </div>
                )}
              </div>
            </div>

            {/* QR Code column */}
            <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center space-y-4">
              <div className="relative p-4 bg-[#1A1A1A] border-4 border-primary/20 rounded-[2rem] overflow-hidden shadow-inner flex items-center justify-center w-56 h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeUrl} 
                  alt="Solana Pay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="text-center space-y-2">
                <Badge variant="outline" className="border-primary/40 text-primary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
                  Solana Pay Standard
                </Badge>
                <p className="text-[10px] text-muted-foreground font-bold leading-normal max-w-[200px]">
                  Scan this QR code with Phantom, Solflare, or any mobile Solana wallet to pay instantly.
                </p>
                <Button asChild size="sm" variant="link" className="text-primary text-[10px] font-black uppercase tracking-widest h-auto py-1">
                  <a href={solanaPayUri}>
                    Open in Local Wallet <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* RECURRING DONATIONS (SOLANA SUBSCRIPTIONS) */}
        {checkoutMode === 'monthly' && (
          <div className="space-y-6 w-full flex flex-col items-center sm:items-stretch">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline" className="border-secondary/40 text-secondary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mx-auto block w-max">
                Solana Subscriptions Protocol
              </Badge>
              <h4 className="text-lg font-headline font-black uppercase text-foreground text-center">
                Become a Monthly Flock Guardian
              </h4>
              <p className="text-[10px] text-muted-foreground font-bold leading-normal max-w-md mx-auto text-center">
                Delegate an allowance of USDC directly to our subscription executor on-chain. You can revoke it anytime directly from your wallet settings.
              </p>
            </div>

            {/* Subscription Tiers */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { level: 5, label: "Guardian", desc: "4lbs of Peas" },
                { level: 10, label: "Super Guardian", desc: "2 Watermelons / Pumpkins" },
                { level: 25, label: "Sanctuary Hero", desc: "1 Bag of Flock Feed" },
                { level: 35, label: "Flock Protector", desc: "Operational rescue support" }
              ].map((tier) => (
                <button
                  key={tier.level}
                  type="button"
                  onClick={() => setSelectedTier(tier.level)}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left flex flex-col justify-between h-36 transition-all",
                    selectedTier === tier.level 
                      ? "border-primary bg-primary/10 text-primary scale-105" 
                      : "border-border hover:border-primary/20"
                  )}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">{tier.label}</span>
                    <span className="font-headline font-black text-2xl">${tier.level}</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground leading-normal">{tier.desc}</span>
                </button>
              ))}
            </div>

            {/* Disclaimer Text */}
            <p className="text-[10px] text-muted-foreground font-semibold leading-normal max-w-xl mx-auto text-center italic py-2">
              Note: To ensure stable, predictable monthly adoptions, all recurring subscriptions are securely processed using USDC stablecoins.
            </p>

            {/* Selected Plan PDA display */}
            <div className="hidden text-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Plan Address: <code className="text-foreground font-mono select-all break-all">{PLAN_PDAS[selectedTier as keyof typeof PLAN_PDAS]}</code>
            </div>

            {/* Wallet connection / delegation transaction box */}
            <div className="bg-background/40 border border-border p-6 rounded-3xl space-y-4 w-full max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">On-Chain Wallet Status</span>
                    <span className="text-xs font-black">
                      {walletConnected 
                        ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` 
                        : "No Wallet Connected"}
                    </span>
                  </div>
                </div>
                {walletConnected ? (
                  <Button variant="outline" size="sm" onClick={disconnectWallet} className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl h-9 text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={connectWallet} className="bg-primary text-primary-foreground hover:scale-105 transition-transform rounded-xl h-9 px-4 text-[9px] font-black uppercase tracking-widest w-full sm:w-auto">
                    Connect Wallet
                  </Button>
                )}
              </div>

              {/* Allocation Selector */}
              <div className="space-y-2 text-center md:text-left w-full max-w-sm mx-auto pt-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center">
                  Direct Your Impact
                </Label>
                <select
                  value={allocation}
                  onChange={(e) => setAllocation(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Feed & Nutrition">Feed & Nutrition</option>
                  <option value="Medical Care">Medical Care</option>
                  <option value="Sanctuary Infrastructure">Sanctuary Infrastructure</option>
                  <option value="General Operations">General Operations</option>
                </select>
              </div>

              {/* Anonymity Toggle */}
              <div className="flex items-center gap-2 pt-2 justify-center w-full max-w-sm mx-auto">
                <input
                  type="checkbox"
                  id="anonymous-toggle-monthly"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                />
                <label 
                  htmlFor="anonymous-toggle-monthly" 
                  className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer select-none"
                >
                  Hide my name on the public member dashboard ledger
                </label>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleApproveSubscription}
                  disabled={isProcessingTx}
                  className="w-full max-w-sm min-h-[3.5rem] h-auto py-3 px-4 bg-primary text-primary-foreground font-black text-[10px] sm:text-xs tracking-widest uppercase rounded-xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center text-center break-words"
                >
                  {isProcessingTx ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> {txStep || "Processing..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="inline sm:hidden">APPROVE ${selectedTier} USDC/MO</span>
                      <span className="hidden sm:inline">APPROVE SUBSCRIPTION FOR ${selectedTier} USDC/MO</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </span>
                  )}
                </Button>

                {txSignature && (
                  <div className="w-full text-center space-y-2 animate-in fade-in">
                    <div className="text-xs text-green-500 font-black flex items-center justify-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Subscription Approval Confirmed!
                    </div>
                    <div className="hidden text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      Active Plan PDA: <code className="text-foreground select-all break-all">{PLAN_PDAS[selectedTier as keyof typeof PLAN_PDAS]}</code>
                    </div>
                    <a 
                      href={`https://solscan.io/tx/${txSignature}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      Verify Transaction on Solscan <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {txStep && !txSignature && (
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    Current Step: {txStep}
                  </div>
                )}
              </div>
            </div>

            {/* Smart contract security disclosure */}
            <div className="hidden text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto">
              Subscriptions program auth ID: <code className="font-mono text-foreground break-all select-all">{SUBSCRIPTIONS_PROGRAM_ID_STR}</code>.
            </div>
          </div>
        )}
        {/* Decent Ducks V1 Collection Showcase */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center w-full max-w-full">
          <div className="space-y-2 mb-4">
            <h4 className="text-lg md:text-xl font-headline font-black uppercase text-foreground">
              Decent Ducks V1 Collection
            </h4>
            <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
              Check out our legacy collection on the secondary market!
            </p>
          </div>
          
          <a 
            href="https://magiceden.us/marketplace/decent_ducks" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <img 
              src="https://i.imgur.com/K7CdYVS.png" 
              alt="Decent Ducks V1 Logo" 
              className="w-32 h-32 mx-auto rounded-xl shadow-lg mb-4 hover:scale-105 transition-transform duration-200"
            />
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 font-black text-xs tracking-widest uppercase rounded-xl h-10 px-6 mt-2"
            >
              Trade on Magic Eden <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
