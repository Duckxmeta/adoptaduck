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
  Repeat
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Recipient Solana Address for donations
const RECIPIENT_ADDRESS = "AKkgD4kg8bq7sPUXhqWLqNPBcvtXXhevx3TQCkuxpUQY";
// Solana Subscriptions Program ID
const SUBSCRIPTIONS_PROGRAM_ID_STR = "De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44";
// USDC Mint Address on Solana Mainnet
const USDC_MINT_STR = "EPjFW3dp5G7jE23PLy1wGP3nXnu35iXcrrwv3EXmFi5m";

export function SolanaCheckout() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'one-time' | 'subscription'>('one-time');

  // ONE-TIME DONATION STATE
  const [usdAmount, setUsdAmount] = useState<string>('10');
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [solAmount, setSolAmount] = useState<string>('0.07');

  // SUBSCRIPTION STATE
  const [selectedTier, setSelectedTier] = useState<number>(10); // $5, $10, or $20
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txSignature, setTxSignature] = useState<string>('');
  const [txStep, setTxStep] = useState<string>('');

  // COPY ADDRESS STATE
  const [copied, setCopied] = useState(false);

  // FETCH SOL PRICE FROM JUPITER API
  const fetchSolPrice = async () => {
    setIsFetchingPrice(true);
    try {
      const res = await fetch('https://api.jup.ag/price/v2?ids=SOL');
      const json = await res.json();
      const price = parseFloat(json?.data?.SOL?.price);
      if (price && !isNaN(price)) {
        setSolPrice(price);
        const amount = parseFloat(usdAmount);
        if (!isNaN(amount) && amount > 0) {
          setSolAmount((amount / price).toFixed(4));
        }
      }
    } catch (e) {
      console.error("Failed to fetch SOL price from Jupiter:", e);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  useEffect(() => {
    fetchSolPrice();
  }, []);

  // UPDATE SOL AMOUNT WHEN USD AMOUNT CHANGES
  useEffect(() => {
    const amount = parseFloat(usdAmount);
    if (solPrice && !isNaN(amount) && amount > 0) {
      setSolAmount((amount / solPrice).toFixed(4));
    } else if (isNaN(amount) || amount <= 0) {
      setSolAmount('0.00');
    }
  }, [usdAmount, solPrice]);

  // SOLANA PAY LINK GENERATOR
  const solanaPayUri = useMemo(() => {
    const label = encodeURIComponent("Decent Ducks Sanctuary");
    const message = encodeURIComponent(`One-Time Donation ($${usdAmount})`);
    return `solana:${RECIPIENT_ADDRESS}?amount=${solAmount}&label=${label}&message=${message}`;
  }, [solAmount, usdAmount]);

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
    <Card className="border-2 border-primary/40 rounded-[2.5rem] bg-card p-6 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="flex flex-col space-y-6">
        {/* Component Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" /> Solana Pay & Subscriptions
            </h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">
              Direct, instant Web3 checkout pipeline
            </p>
          </div>
          
          {/* Tab toggles */}
          <div className="flex bg-background border border-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('one-time')}
              className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                activeTab === 'one-time' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              One-Time
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1",
                activeTab === 'subscription' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Repeat className="h-3 w-3" /> Monthly
            </button>
          </div>
        </div>

        {/* ONE-TIME DONATIONS (SOLANA PAY) */}
        {activeTab === 'one-time' && (
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Input & details column */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Select Donation Amount (USD)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {['5', '10', '25', '50'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setUsdAmount(val)}
                      className={cn(
                        "py-3 border rounded-xl text-sm font-black transition-all",
                        usdAmount === val ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                      )}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Or Custom USD Amount
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground font-black text-sm">$</span>
                  <Input
                    type="number"
                    min="1"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    className="pl-8 bg-background border-border h-12 rounded-xl font-black text-sm"
                  />
                </div>
              </div>

              {/* Conversion Display */}
              <div className="bg-background/40 border border-border p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                    Solana Transfer Amount
                  </span>
                  <span className="text-lg font-headline font-black text-foreground">
                    {solAmount} SOL
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={fetchSolPrice}
                  disabled={isFetchingPrice}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RefreshCw className={cn("h-4 w-4", isFetchingPrice && "animate-spin")} />
                </Button>
              </div>

              {/* Solana Recipient Block */}
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                  Recipient Wallet Address
                </span>
                <div className="bg-background/50 border border-border px-4 py-3 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                  <code className="text-xs font-mono truncate text-muted-foreground">{RECIPIENT_ADDRESS}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyAddress} className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* QR Code column */}
            <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
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
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline" className="border-secondary/40 text-secondary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
                Solana Subscriptions Protocol
              </Badge>
              <h4 className="text-lg font-headline font-black uppercase text-foreground">
                Become a Monthly Flock Guardian
              </h4>
              <p className="text-xs text-muted-foreground font-medium">
                Delegate an allowance of USDC directly to our subscription executor on-chain. You can revoke it anytime directly from your wallet settings.
              </p>
            </div>

            {/* Subscription Tiers */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { level: 5, label: "Guardian", desc: "Covers snack funding" },
                { level: 10, label: "Super Guardian", desc: "Covers habitat upkeep" },
                { level: 20, label: "Sanctuary Hero", desc: "Covers rescue logistics" }
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

            {/* Wallet connection / delegation transaction box */}
            <div className="bg-background/40 border border-border p-6 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
                <div className="flex items-center gap-2">
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
                  <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-[10px] font-black uppercase tracking-widest text-red-500 h-8 px-3">
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={connectWallet} className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl hover:scale-105 transition-transform">
                    Connect Wallet
                  </Button>
                )}
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleApproveSubscription}
                  disabled={isProcessingTx}
                  className="w-full max-w-sm h-14 bg-primary text-primary-foreground font-black text-xs tracking-widest uppercase rounded-xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  {isProcessingTx ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> {txStep || "Processing..."}
                    </span>
                  ) : (
                    <>APPROVE SUBSCRIPTION FOR ${selectedTier} USDC/MO <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>

                {txSignature && (
                  <div className="w-full text-center space-y-2 animate-in fade-in">
                    <div className="text-xs text-green-500 font-black flex items-center justify-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Subscription Approval Confirmed!
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
            <div className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto">
              Subscriptions program auth ID: <code className="font-mono text-foreground break-all select-all">{SUBSCRIPTIONS_PROGRAM_ID_STR}</code>.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
