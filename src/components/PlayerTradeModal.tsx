import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  RefreshCw, 
  ArrowRightLeft, 
  Coins, 
  Dna, 
  Sparkles, 
  Check, 
  Copy, 
  Send, 
  Users, 
  ShieldCheck, 
  History, 
  PlusCircle, 
  AlertCircle, 
  Filter, 
  CheckCircle2,
  Swords,
  Crown,
  Eye,
  Zap,
  ArrowUpDown
} from 'lucide-react';
import { Animal, GameState, Rarity } from '../types';
import { ANIMALS } from '../constants';
import { getActiveBadge } from '../badges';

interface PlayerTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

interface TradeOffer {
  id: string;
  traderName: string;
  traderAvatar: string;
  traderRep: string;
  offeredUnitId: string;
  offeredUnit: Animal;
  askingType: 'meat' | 'dna' | 'shards' | 'unit';
  askingAmount?: number;
  askingUnitRarity?: Rarity;
  askingUnitId?: string;
  timeRemaining?: string;
  isPopular?: boolean;
  isPlayerPost?: boolean;
  sellerSlot?: string;
  createdAt?: number;
}

interface TradeHistoryItem {
  id: string;
  traderName: string;
  unitReceived: string;
  costPaid: string;
  timestamp: string;
}

const TRADE_BOARD_STORAGE_KEY = 'primal_defense_global_trade_board_v2';
const P2P_CODES_STORAGE_KEY = 'primal_defense_p2p_codes_v2';

const sortTradeOffers = (
  offers: TradeOffer[], 
  sortBy: 'newest' | 'price_low' | 'price_high' | 'rarity' = 'newest'
): TradeOffer[] => {
  const RARITY_WEIGHT: Record<string, number> = {
    'Common': 1,
    'Rare': 2,
    'Epic': 3,
    'Legendary': 4,
    'Mythic': 5,
    'Secret': 6,
    'Celestial': 7,
    '???': 8,
    'Unrivaled': 9,
    'Original': 10,
    'Overseer': 11,
    'Arcane': 12
  };

  return [...offers].sort((a, b) => {
    if (sortBy === 'newest') {
      // Player posts stay at top in newest mode
      if (a.isPlayerPost && !b.isPlayerPost) return -1;
      if (!a.isPlayerPost && b.isPlayerPost) return 1;

      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA !== timeB) return timeB - timeA;
    } else if (sortBy === 'price_low') {
      const costA = a.askingAmount || 0;
      const costB = b.askingAmount || 0;
      if (costA !== costB) return costA - costB;
    } else if (sortBy === 'price_high') {
      const costA = a.askingAmount || 0;
      const costB = b.askingAmount || 0;
      if (costA !== costB) return costB - costA;
    } else if (sortBy === 'rarity') {
      const weightA = RARITY_WEIGHT[a.offeredUnit.rarity] || 0;
      const weightB = RARITY_WEIGHT[b.offeredUnit.rarity] || 0;
      if (weightA !== weightB) return weightB - weightA;
    }

    // Strict deterministic tie-breaker
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeA !== timeB) return timeB - timeA;
    return a.id.localeCompare(b.id);
  });
};

const saveAndBroadcastOffers = (offers: TradeOffer[], actionType = 'SYNC_MARKET_OFFERS', extraData?: any) => {
  try {
    const sorted = sortTradeOffers(offers, 'newest');
    localStorage.setItem(TRADE_BOARD_STORAGE_KEY, JSON.stringify(sorted));
    const channel = new BroadcastChannel('primal_defense_trade_network');
    channel.postMessage({
      type: actionType,
      offers: sorted,
      senderSlot: localStorage.getItem('primal_defense_active_slot') || '1',
      timestamp: Date.now(),
      ...extraData
    });
    channel.close();
  } catch (e) {
    console.error('Trade sync error:', e);
  }
};

const PRESET_TRADERS = [
  { name: 'Commander Vane', avatar: '🛡️', rep: '99.4% (480 Trades)' },
  { name: 'Dr. Evelyn Void', avatar: '🔬', rep: '98.9% (1,240 Trades)' },
  { name: 'Alpha Survivor Jax', avatar: '⚡', rep: '100% (89 Trades)' },
  { name: 'Geneticist Seth', avatar: '🧬', rep: '97.8% (610 Trades)' },
  { name: 'Sovereign Kai', avatar: '👑', rep: '99.8% (2,100 Trades)' },
  { name: 'Overseer Nova', avatar: '🌌', rep: '100% (3,400 Trades)' },
  { name: 'Bio-Hacker Nyx', avatar: '💻', rep: '96.5% (320 Trades)' },
  { name: 'Collector Thorne', avatar: '💎', rep: '99.1% (850 Trades)' }
];

// Helper to play trade sound effects
const playTradeSound = (type: 'accept' | 'error' | 'create', soundEnabled = true) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (type === 'accept') {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

// Generate randomized sample market trade offers
const generateMarketOffers = (ownedUnitIds: string[], baseTime = Date.now()): TradeOffer[] => {
  // Exclude overseer and original as requested by prompt constraints
  const availableAnimals = ANIMALS.filter(a => a.rarity !== 'Overseer' && a.rarity !== 'Original');
  const offers: TradeOffer[] = [];

  // Create 6-8 varied market offers
  const shuffledTraders = [...PRESET_TRADERS].sort(() => 0.5 - Math.random());

  shuffledTraders.slice(0, 7).forEach((trader, idx) => {
    // Pick an animal
    const offeredAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
    
    // Decide asking type
    const askingTypes: ('meat' | 'dna' | 'shards' | 'unit')[] = ['meat', 'meat', 'dna', 'shards', 'unit'];
    const askingType = askingTypes[Math.floor(Math.random() * askingTypes.length)];

    let askingAmount = 0;
    let askingUnitRarity: Rarity | undefined;

    if (askingType === 'meat') {
      askingAmount = Math.max(50, Math.floor(offeredAnimal.cost * (0.2 + Math.random() * 0.2)));
    } else if (askingType === 'dna') {
      const baseDna = offeredAnimal.cost > 500000 ? 10000 : offeredAnimal.cost > 20000 ? 2500 : 500;
      askingAmount = Math.floor(baseDna * (0.8 + Math.random() * 0.4));
    } else if (askingType === 'shards') {
      askingAmount = offeredAnimal.rarity === 'Secret' ? 2 : offeredAnimal.rarity === 'Celestial' ? 5 : 1;
    } else {
      const rarities: Rarity[] = ['Rare', 'Epic', 'Legendary', 'Mythic'];
      askingUnitRarity = rarities[Math.floor(Math.random() * rarities.length)];
    }

    offers.push({
      id: `mkt-offer-${idx}-${offeredAnimal.id}-${Math.random().toString(36).substring(2, 6)}`,
      traderName: trader.name,
      traderAvatar: trader.avatar,
      traderRep: trader.rep,
      offeredUnitId: offeredAnimal.id,
      offeredUnit: offeredAnimal,
      askingType,
      askingAmount,
      askingUnitRarity,
      timeRemaining: `${Math.floor(Math.random() * 45) + 5}m left`,
      isPopular: idx === 0 || offeredAnimal.rarity === 'Secret' || offeredAnimal.rarity === 'Celestial',
      createdAt: baseTime - (idx + 1) * 1000
    });
  });

  return sortTradeOffers(offers, 'newest');
};

export const PlayerTradeModal: React.FC<PlayerTradeModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'direct' | 'create' | 'history'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rarity'>('newest');
  const [marketOffers, setMarketOffers] = useState<TradeOffer[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [stockCountdown, setStockCountdown] = useState<string>('59m 59s');
  
  // Toast notifications inside trade modal
  const [tradeToast, setTradeToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Hourly Global Stock countdown timer logic
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const minsLeft = 59 - now.getMinutes();
      const secsLeft = 59 - now.getSeconds();
      setStockCountdown(`${String(minsLeft).padStart(2, '0')}m ${String(secsLeft).padStart(2, '0')}s`);

      // At top of the hour (00m 00s), auto-refresh the global stock!
      if (minsLeft === 0 && secsLeft === 0) {
        const fresh = generateMarketOffers(gameState.summonedAnimals);
        const sorted = sortTradeOffers(fresh, sortBy);
        setMarketOffers(sorted);
        saveAndBroadcastOffers(sorted);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [gameState.summonedAnimals, sortBy]);

  // Offer Inspection state
  const [inspectedOffer, setInspectedOffer] = useState<TradeOffer | null>(null);

  // Direct P2P Code state
  const [p2pCodeInput, setP2pCodeInput] = useState('');
  const [createdCodeOutput, setCreatedCodeOutput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Post Trade Offer state
  const [selectedTradeUnitId, setSelectedTradeUnitId] = useState<string>('');
  const [postAskingType, setPostAskingType] = useState<'meat' | 'dna' | 'shards'>('meat');
  const [postAskingAmount, setPostAskingAmount] = useState<number>(500);

  const isSoundEnabled = gameState.soundEffectsEnabled !== false && !gameState.globalMute;

  const showToast = (message: string, type: 'success' | 'error') => {
    setTradeToast({ message, type });
    playTradeSound(type === 'success' ? 'accept' : 'error', isSoundEnabled);
    setTimeout(() => {
      setTradeToast(null);
    }, 3500);
  };

  // Cross-tab / Multi-Account Real-time Synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('primal_defense_trade_network');
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    const currentSlot = localStorage.getItem('primal_defense_active_slot') || '1';

    // 1. Load offers from localStorage on mount or modal open
    try {
      const stored = localStorage.getItem(TRADE_BOARD_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMarketOffers(sortTradeOffers(parsed, sortBy));
        } else {
          const fresh = generateMarketOffers(gameState.summonedAnimals);
          const sorted = sortTradeOffers(fresh, sortBy);
          setMarketOffers(sorted);
          saveAndBroadcastOffers(sorted, 'SYNC_MARKET_OFFERS', channel);
        }
      } else {
        const fresh = generateMarketOffers(gameState.summonedAnimals);
        const sorted = sortTradeOffers(fresh, sortBy);
        setMarketOffers(sorted);
        saveAndBroadcastOffers(sorted, 'SYNC_MARKET_OFFERS', channel);
      }
    } catch (e) {
      const fresh = generateMarketOffers(gameState.summonedAnimals);
      setMarketOffers(sortTradeOffers(fresh, sortBy));
    }

    // 2. BroadcastChannel message listener
    const handleBroadcastMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'SYNC_MARKET_OFFERS' && Array.isArray(data.offers)) {
        setMarketOffers(sortTradeOffers(data.offers, sortBy));
      } else if (data.type === 'TRADE_SOLD' && data.offer) {
        // Remove sold offer from board
        setMarketOffers(prev => sortTradeOffers(prev.filter(o => o.id !== data.offer.id), sortBy));

        // If this account was the seller, award payment!
        if (data.offer.sellerSlot === currentSlot || (data.offer.isPlayerPost && data.offer.sellerSlot === currentSlot)) {
          const rewardAmount = data.offer.askingAmount || 0;
          const rewardType = data.offer.askingType || 'meat';

          if (rewardAmount > 0) {
            setGameState(prev => ({
              ...prev,
              meat: rewardType === 'meat' ? prev.meat + rewardAmount : prev.meat,
              dna: rewardType === 'dna' ? prev.dna + rewardAmount : prev.dna,
              shardsOfGods: rewardType === 'shards' ? (prev.shardsOfGods || 0) + rewardAmount : prev.shardsOfGods
            }));

            showToast(
              `🎉 TRADE SOLD! A buyer on another account bought your ${data.offer.offeredUnit.name}! +${rewardAmount.toLocaleString()} ${rewardType.toUpperCase()} earned!`,
              'success'
            );
          }
        }
      } else if (data.type === 'P2P_CODE_CLAIMED' && data.sellerSlot === currentSlot) {
        // P2P Seller Payout
        const rewardAmount = data.askingAmount || 0;
        const rewardType = data.askingType || 'meat';

        if (rewardAmount > 0) {
          setGameState(prev => ({
            ...prev,
            meat: rewardType === 'meat' ? prev.meat + rewardAmount : prev.meat,
            dna: rewardType === 'dna' ? prev.dna + rewardAmount : prev.dna,
            shardsOfGods: rewardType === 'shards' ? (prev.shardsOfGods || 0) + rewardAmount : prev.shardsOfGods
          }));

          showToast(
            `🎉 P2P TRADE CLAIMED! Your code for ${data.unitName || 'Unit'} was redeemed! Earned +${rewardAmount.toLocaleString()} ${rewardType.toUpperCase()}!`,
            'success'
          );
        }
      }
    };

    if (channel) {
      channel.onmessage = handleBroadcastMessage;
    }

    // 3. Storage event listener for cross-tab sync
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === TRADE_BOARD_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setMarketOffers(sortTradeOffers(parsed, sortBy));
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [isOpen, sortBy]);

  const handleRefreshMarket = () => {
    const playerPosts = marketOffers.filter(o => o.isPlayerPost);
    const npcOffers = generateMarketOffers(gameState.summonedAnimals);
    const combined = sortTradeOffers([...playerPosts, ...npcOffers], sortBy);

    setMarketOffers(combined);
    saveAndBroadcastOffers(combined);
    showToast('Market listings refreshed with active network trades!', 'success');
  };

  // Execute a market trade
  const handleAcceptTrade = (offer: TradeOffer) => {
    // 1. Validate asking payment
    if (offer.askingType === 'meat') {
      if (gameState.meat < (offer.askingAmount || 0)) {
        showToast(`Trade Failed: You need ${offer.askingAmount} Meat to accept this offer!`, 'error');
        return;
      }
    } else if (offer.askingType === 'dna') {
      if (gameState.dna < (offer.askingAmount || 0)) {
        showToast(`Trade Failed: You need ${offer.askingAmount} DNA to accept this offer!`, 'error');
        return;
      }
    } else if (offer.askingType === 'shards') {
      if ((gameState.shardsOfGods || 0) < (offer.askingAmount || 0)) {
        showToast(`Trade Failed: You need ${offer.askingAmount} God Shards to accept this offer!`, 'error');
        return;
      }
    } else if (offer.askingType === 'unit') {
      const matchingUnits = ANIMALS.filter(
        a => a.rarity === offer.askingUnitRarity && gameState.summonedAnimals.includes(a.id)
      );
      if (matchingUnits.length === 0) {
        showToast(`Trade Failed: You do not own a ${offer.askingUnitRarity} unit to trade!`, 'error');
        return;
      }
    }

    // 2. Deduct payment & award unit
    setGameState(prev => {
      let nextMeat = prev.meat;
      let nextDna = prev.dna;
      let nextShards = prev.shardsOfGods || 0;

      if (offer.askingType === 'meat') nextMeat -= (offer.askingAmount || 0);
      if (offer.askingType === 'dna') nextDna -= (offer.askingAmount || 0);
      if (offer.askingType === 'shards') nextShards -= (offer.askingAmount || 0);

      const nextSummoned = prev.summonedAnimals.includes(offer.offeredUnitId)
        ? prev.summonedAnimals
        : [...prev.summonedAnimals, offer.offeredUnitId];

      return {
        ...prev,
        meat: nextMeat,
        dna: nextDna,
        shardsOfGods: nextShards,
        summonedAnimals: nextSummoned
      };
    });

    // Remove fulfilled offer from board
    const remainingOffers = marketOffers.filter(o => o.id !== offer.id);
    setMarketOffers(remainingOffers);

    // Save & broadcast sale to seller account
    saveAndBroadcastOffers(remainingOffers, 'TRADE_SOLD', { offer });

    // Log to history
    const costText = offer.askingType === 'meat' ? `${offer.askingAmount} Meat` :
                     offer.askingType === 'dna' ? `${offer.askingAmount} DNA` :
                     offer.askingType === 'shards' ? `${offer.askingAmount} God Shards` :
                     `1x ${offer.askingUnitRarity} Unit`;

    setTradeHistory(prev => [
      {
        id: `th-${Date.now()}`,
        traderName: offer.traderName,
        unitReceived: offer.offeredUnit.name,
        costPaid: costText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    showToast(`Trade Completed! Acquired ${offer.offeredUnit.name} (${offer.offeredUnit.rarity}) from ${offer.traderName}!`, 'success');
  };

  // Redeem P2P Direct Trade Code
  const handleRedeemP2PCode = () => {
    if (!p2pCodeInput.trim()) {
      showToast('Please enter a valid P2P Trade Code!', 'error');
      return;
    }

    const code = p2pCodeInput.trim().toUpperCase();

    // Check built-in preset trade codes
    if (code === 'TRD-VIPER-888' || code === 'VIPER') {
      if (gameState.summonedAnimals.includes('secret_cyber_viper')) {
        showToast('You already own Hyper Cyber Viper in your inventory!', 'error');
        return;
      }
      setGameState(prev => ({
        ...prev,
        summonedAnimals: [...new Set([...prev.summonedAnimals, 'secret_cyber_viper'])]
      }));
      showToast('🎉 Direct Code Redeemed! Received Secret Hyper Cyber Viper!', 'success');
      setP2pCodeInput('');
      return;
    }

    if (code === 'TRD-HYDRA-777' || code === 'HYDRA') {
      if (gameState.summonedAnimals.includes('hydra')) {
        showToast('You already own Nine-Headed Hydra in your inventory!', 'error');
        return;
      }
      setGameState(prev => ({
        ...prev,
        summonedAnimals: [...new Set([...prev.summonedAnimals, 'hydra'])]
      }));
      showToast('🎉 Direct Code Redeemed! Received Mythic Nine-Headed Hydra!', 'success');
      setP2pCodeInput('');
      return;
    }

    if (code === 'TRD-MEAT-5000' || code === 'MEAT5000') {
      setGameState(prev => ({
        ...prev,
        meat: prev.meat + 5000
      }));
      showToast('🎉 Direct Code Redeemed! Received +5,000 Meat supply drop!', 'success');
      setP2pCodeInput('');
      return;
    }

    // Check shared localStorage P2P codes dictionary first
    try {
      const storedCodes = JSON.parse(localStorage.getItem(P2P_CODES_STORAGE_KEY) || '{}');
      const foundCode = storedCodes[code];

      if (foundCode) {
        if (foundCode.status === 'REDEEMED') {
          showToast('Trade Failed: This P2P Trade Code has already been redeemed!', 'error');
          return;
        }

        const targetAnimal = ANIMALS.find(a => a.id === foundCode.unitId);
        if (!targetAnimal) {
          showToast('Invalid unit in trade code!', 'error');
          return;
        }

        const askingAmt = foundCode.askingAmount || 0;
        if (foundCode.askingType === 'meat' && gameState.meat < askingAmt) {
          showToast(`Need ${askingAmt.toLocaleString()} Meat to redeem this trade code!`, 'error');
          return;
        }
        if (foundCode.askingType === 'dna' && gameState.dna < askingAmt) {
          showToast(`Need ${askingAmt.toLocaleString()} DNA to redeem this trade code!`, 'error');
          return;
        }
        if (foundCode.askingType === 'shards' && (gameState.shardsOfGods || 0) < askingAmt) {
          showToast(`Need ${askingAmt.toLocaleString()} God Shards to redeem this trade code!`, 'error');
          return;
        }

        // Deduct payment & award unit
        setGameState(prev => ({
          ...prev,
          meat: foundCode.askingType === 'meat' ? prev.meat - askingAmt : prev.meat,
          dna: foundCode.askingType === 'dna' ? prev.dna - askingAmt : prev.dna,
          shardsOfGods: foundCode.askingType === 'shards' ? (prev.shardsOfGods || 0) - askingAmt : prev.shardsOfGods,
          summonedAnimals: prev.summonedAnimals.includes(foundCode.unitId) 
            ? prev.summonedAnimals 
            : [...prev.summonedAnimals, foundCode.unitId]
        }));

        // Mark code as REDEEMED
        foundCode.status = 'REDEEMED';
        foundCode.redeemedBySlot = localStorage.getItem('primal_defense_active_slot') || '1';
        storedCodes[code] = foundCode;
        localStorage.setItem(P2P_CODES_STORAGE_KEY, JSON.stringify(storedCodes));

        // Broadcast claim message so seller gets paid
        try {
          const channel = new BroadcastChannel('primal_defense_trade_network');
          channel.postMessage({
            type: 'P2P_CODE_CLAIMED',
            sellerSlot: foundCode.sellerSlot,
            unitId: foundCode.unitId,
            unitName: targetAnimal.name,
            askingType: foundCode.askingType,
            askingAmount: foundCode.askingAmount
          });
          channel.close();
        } catch (e) {}

        showToast(`🎉 P2P Trade Code Redeemed! Unlocked ${targetAnimal.name}!`, 'success');
        setP2pCodeInput('');
        return;
      }
    } catch (e) {}

    // Fallback parsing encoded JSON
    try {
      const decoded = atob(code);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.unitId) {
        const targetAnimal = ANIMALS.find(a => a.id === parsed.unitId);
        if (!targetAnimal) {
          showToast('Invalid Trade Code unit data!', 'error');
          return;
        }

        setGameState(prev => ({
          ...prev,
          summonedAnimals: prev.summonedAnimals.includes(parsed.unitId) 
            ? prev.summonedAnimals 
            : [...prev.summonedAnimals, parsed.unitId]
        }));

        showToast(`🎉 Custom P2P Trade Code Redeemed! Unlocked ${targetAnimal.name}!`, 'success');
        setP2pCodeInput('');
        return;
      }
    } catch (e) {}

    showToast('Unrecognized Trade Code. Try preset codes like TRD-VIPER-888 or TRD-MEAT-5000!', 'error');
  };

  // Create P2P Export Code
  const handleGenerateExportCode = () => {
    if (!selectedTradeUnitId) {
      showToast('Please select an owned unit to generate a trade code!', 'error');
      return;
    }

    const currentSlot = localStorage.getItem('primal_defense_active_slot') || '1';
    const unit = ANIMALS.find(a => a.id === selectedTradeUnitId);

    const payload = {
      unitId: selectedTradeUnitId,
      askingType: postAskingType,
      askingAmount: postAskingAmount,
      sellerSlot: currentSlot,
      created: Date.now()
    };

    const encoded = btoa(JSON.stringify(payload));
    const code = `TRD-${selectedTradeUnitId.toUpperCase()}-${encoded.slice(0, 8)}`;

    // Store in shared P2P codes dictionary
    try {
      const storedCodes = JSON.parse(localStorage.getItem(P2P_CODES_STORAGE_KEY) || '{}');
      storedCodes[code] = {
        code,
        unitId: selectedTradeUnitId,
        unitName: unit?.name || 'Unit',
        askingType: postAskingType,
        askingAmount: postAskingAmount,
        sellerSlot: currentSlot,
        status: 'ACTIVE',
        createdAt: Date.now()
      };
      localStorage.setItem(P2P_CODES_STORAGE_KEY, JSON.stringify(storedCodes));
    } catch (e) {}

    setCreatedCodeOutput(code);
    playTradeSound('create', isSoundEnabled);
    showToast(`Trade Code generated and synced for all accounts!`, 'success');
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!createdCodeOutput) return;
    navigator.clipboard.writeText(createdCodeOutput);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Post Custom Trade to Board
  const handlePostOfferToBoard = () => {
    if (!selectedTradeUnitId) {
      showToast('Please select an owned unit to offer!', 'error');
      return;
    }

    const unit = ANIMALS.find(a => a.id === selectedTradeUnitId);
    if (!unit) return;

    const currentSlot = localStorage.getItem('primal_defense_active_slot') || '1';

    const now = Date.now();
    const newOffer: TradeOffer = {
      id: `custom-offer-${now}-${Math.random().toString(36).substring(2, 6)}`,
      traderName: `Player (Slot ${currentSlot})`,
      traderAvatar: currentSlot === '2' ? '🦊' : currentSlot === '3' ? '🐉' : '👤',
      traderRep: '100% (Verified Player)',
      offeredUnitId: unit.id,
      offeredUnit: unit,
      askingType: postAskingType,
      askingAmount: postAskingAmount,
      timeRemaining: 'Active',
      isPopular: true,
      isPlayerPost: true,
      sellerSlot: currentSlot,
      createdAt: now
    };

    const updated = sortTradeOffers([newOffer, ...marketOffers], sortBy);
    setMarketOffers(updated);
    saveAndBroadcastOffers(updated);

    setActiveTab('market');
    showToast(`Trade Offer for ${unit.name} posted to World Trade Board! Synced across active accounts!`, 'success');
  };

  // Filtered market offers
  const filteredOffers = useMemo(() => {
    const filtered = marketOffers.filter(offer => {
      if (rarityFilter !== 'All' && offer.offeredUnit.rarity !== rarityFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          offer.offeredUnit.name.toLowerCase().includes(q) ||
          offer.traderName.toLowerCase().includes(q) ||
          offer.offeredUnit.rarity.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return sortTradeOffers(filtered, sortBy);
  }, [marketOffers, rarityFilter, searchQuery, sortBy]);

  // Player owned animals list for posting
  const playerOwnedAnimals = useMemo(() => {
    return ANIMALS.filter(a => gameState.summonedAnimals.includes(a.id));
  }, [gameState.summonedAnimals]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/90 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <ArrowRightLeft size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                  🤝 Survivor Trade & Global Stock
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  <span>Direct Unit & Resource Exchange</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px]">
                    <RefreshCw size={10} className="animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                    Global Stock Drop in {stockCountdown}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px]" title="Trade offers, P2P codes, and sales sync automatically across tabs and alt account slots">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Network Synced
                  </span>
                </p>
              </div>
            </div>

            {/* Top Balances Display & Equipped Title */}
            <div className="flex items-center gap-3">
              {(() => {
                const activeBadge = getActiveBadge(gameState);
                if (!activeBadge) return null;
                return (
                  <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border ${activeBadge.borderClass}`}>
                    <span className="text-sm">{activeBadge.icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${activeBadge.gradientClass}`}>
                      {activeBadge.title}
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 bg-slate-950/70 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                <span className="text-yellow-400 flex items-center gap-1">
                  <Coins size={13} /> {gameState.meat.toLocaleString()} Meat
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Dna size={13} /> {gameState.dna.toLocaleString()} DNA
                </span>
                {(gameState.shardsOfGods || 0) > 0 && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Sparkles size={13} /> {gameState.shardsOfGods} Shards
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Bar & Toast Alert */}
          <div className="px-6 py-2.5 bg-slate-950/50 border-b border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'market'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={14} /> World Trade Board
              </button>

              <button
                onClick={() => setActiveTab('direct')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Send size={14} /> Direct P2P Code
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle size={14} /> Post Trade Offer
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <History size={14} /> Trade History ({tradeHistory.length})
              </button>
            </div>

            {/* Quick Refresh Button for Market */}
            {activeTab === 'market' && (
              <button
                onClick={handleRefreshMarket}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw size={12} className="text-amber-400" /> Refresh Board
              </button>
            )}
          </div>

          {/* Toast Message Notification */}
          <AnimatePresence>
            {tradeToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mx-6 mt-3 p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between shadow-lg ${
                  tradeToast.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/90 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tradeToast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-red-400" />}
                  <span>{tradeToast.message}</span>
                </div>
                <button onClick={() => setTradeToast(null)} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: World Trade Board */}
          {activeTab === 'market' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
              {/* Hourly Global Stock Header Banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
                    <Sparkles size={18} className="animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-2">
                      📦 HOURLY GLOBAL STOCK MARKET
                      <span className="text-[9px] bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-normal">
                        RESTOCKS HOURLY
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      Every hour on the clock, a brand new rotation of global unit stock arrives on the trade board!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-300">
                  <RefreshCw size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Next Global Stock: <strong className="text-white">{stockCountdown}</strong></span>
                </div>
              </div>

              {/* Search, Sort & Rarity Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search unit name or trader..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Sort Selector Dropdown */}
                <div className="flex items-center space-x-1.5 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown size={13} className="text-amber-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-amber-300 focus:outline-none cursor-pointer"
                  >
                    <option value="newest" className="bg-slate-900 text-white">🆕 Newest (Player Posts Top)</option>
                    <option value="price_low" className="bg-slate-900 text-white">💲 Price: Low → High</option>
                    <option value="price_high" className="bg-slate-900 text-white">💰 Price: High → Low</option>
                    <option value="rarity" className="bg-slate-900 text-white">⭐ Highest Rarity</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1">
                    <Filter size={11} /> Rarity:
                  </span>
                  {['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret', 'Celestial', '???', 'Unrivaled'].map((r, idx) => (
                    <button
                      key={`trade-filter-${r}-${idx}`}
                      onClick={() => setRarityFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        rarityFilter === r
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Offers */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 scrollbar-hide">
                {filteredOffers.length === 0 ? (
                  <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Users size={32} className="opacity-30" />
                    <p className="text-xs font-bold uppercase">No market offers matching criteria</p>
                    <button
                      onClick={handleRefreshMarket}
                      className="text-xs text-amber-400 underline font-semibold cursor-pointer"
                    >
                      Refresh Network Market
                    </button>
                  </div>
                ) : (
                  filteredOffers.map((offer) => {
                    const alreadyOwned = gameState.summonedAnimals.includes(offer.offeredUnitId);

                    return (
                      <div
                        key={`trade-offer-${offer.id}`}
                        onClick={() => setInspectedOffer(offer)}
                        className="bg-slate-850/80 border border-white/10 hover:border-amber-400/60 rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-800/90 shadow-md relative group overflow-hidden cursor-pointer"
                      >
                        <div
                          className="absolute top-0 left-0 bottom-0 w-[4px]"
                          style={{ backgroundColor: offer.offeredUnit.color }}
                        />

                        {/* Top Header: Trader info & Badge */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-base">{offer.traderAvatar}</span>
                              <div>
                                <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                                  {offer.traderName}
                                  <ShieldCheck size={12} className="text-emerald-400" />
                                </h4>
                                <p className="text-[9px] text-slate-400 font-mono">{offer.traderRep}</p>
                              </div>
                            </div>
                            {offer.isPlayerPost ? (
                              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase rounded-full flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                PLAYER POST
                              </span>
                            ) : offer.isPopular ? (
                              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] font-black uppercase rounded-full animate-pulse">
                                🔥 HOT OFFER
                              </span>
                            ) : null}
                          </div>

                          {/* Unit Offered Card */}
                          <div className="bg-slate-900/90 p-3 rounded-lg border border-white/5 mb-3 space-y-1 group-hover:border-amber-500/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[9px] font-black uppercase tracking-wider"
                                style={{ color: offer.offeredUnit.color }}
                              >
                                {offer.offeredUnit.rarity}
                              </span>
                              <div className="flex items-center gap-1">
                                {alreadyOwned && (
                                  <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase">
                                    ✓ Owned
                                  </span>
                                )}
                                <span className="text-[8px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                                  <Eye size={10} /> Inspect
                                </span>
                              </div>
                            </div>
                            <h3 className="text-sm font-black text-white">{offer.offeredUnit.name}</h3>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                              <span className="flex items-center gap-1">
                                <Swords size={11} className="text-rose-400" /> Dmg: {offer.offeredUnit.damage}
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins size={11} className="text-yellow-400" /> Cost: {offer.offeredUnit.cost}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Asking Payment & Action Button */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Asking Price:
                            </span>
                            <span className="font-mono font-black text-amber-300 flex items-center gap-1">
                              {offer.askingType === 'meat' && (
                                <>
                                  <Coins size={13} className="text-yellow-400" /> {offer.askingAmount} Meat
                                </>
                              )}
                              {offer.askingType === 'dna' && (
                                <>
                                  <Dna size={13} className="text-emerald-400" /> {offer.askingAmount} DNA
                                </>
                              )}
                              {offer.askingType === 'shards' && (
                                <>
                                  <Sparkles size={13} className="text-amber-400" /> {offer.askingAmount} Shards
                                </>
                              )}
                              {offer.askingType === 'unit' && (
                                <span className="text-purple-300">
                                  1x {offer.askingUnitRarity} Unit
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedOffer(offer);
                              }}
                              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border border-white/5"
                              title="Inspect Unit Stats & Ability"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptTrade(offer);
                              }}
                              className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-950/50 flex items-center justify-center gap-1.5"
                            >
                              <Check size={14} /> Accept Trade
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Direct P2P Code */}
          {activeTab === 'direct' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Redeem Trade Code */}
                <div className="bg-slate-850/80 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                      <Send size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-white tracking-wider">
                        Redeem Direct Trade Code
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paste a trade code from another player or redeem direct preset codes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Enter Trade Code:
                    </label>
                    <input
                      type="text"
                      value={p2pCodeInput}
                      onChange={e => setP2pCodeInput(e.target.value)}
                      placeholder="e.g. TRD-VIPER-888 or TRD-HYDRA-777"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={handleRedeemP2PCode}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} /> Claim & Unpack Trade Code
                  </button>

                  {/* Preset Test Codes Box */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      <Crown size={12} /> Instant Direct Codes (Try These!):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setP2pCodeInput('TRD-VIPER-888')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold rounded-lg transition-all"
                      >
                        TRD-VIPER-888 (Secret)
                      </button>
                      <button
                        onClick={() => setP2pCodeInput('TRD-HYDRA-777')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold rounded-lg transition-all"
                      >
                        TRD-HYDRA-777 (Mythic)
                      </button>
                      <button
                        onClick={() => setP2pCodeInput('TRD-MEAT-5000')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-yellow-500/30 text-yellow-300 text-[10px] font-mono font-bold rounded-lg transition-all"
                      >
                        TRD-MEAT-5000 (+5k Meat)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Card: Export Trade Code */}
                <div className="bg-slate-850/80 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                      <Copy size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-white tracking-wider">
                        Generate Direct Trade Code
                      </h3>
                      <p className="text-xs text-slate-400">
                        Package any owned unit from your inventory into a code to send to friends.
                      </p>
                    </div>
                  </div>

                  {/* Select Unit */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Unit to Offer:
                    </label>
                    <select
                      value={selectedTradeUnitId}
                      onChange={e => setSelectedTradeUnitId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Unit from Inventory --</option>
                      {playerOwnedAnimals.map((a, idx) => (
                        <option key={`${a.id}-${idx}`} value={a.id}>
                          {a.name} ({a.rarity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateExportCode}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                  >
                    <Copy size={15} /> Encode Trade Code
                  </button>

                  {/* Generated Output */}
                  {createdCodeOutput && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                          Generated Trade Code:
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg text-xs font-mono font-bold text-cyan-300 break-all select-all">
                        {createdCodeOutput}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Post Trade Offer */}
          {activeTab === 'create' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide max-w-2xl mx-auto w-full">
              <div className="bg-slate-850/90 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <PlusCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wider">
                      Create Public World Trade Listing
                    </h3>
                    <p className="text-xs text-slate-400">
                      Post an offer on the survivor network. Other player commanders will respond with trades!
                    </p>
                  </div>
                </div>

                {/* Select Unit */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    1. Select Unit to Offer:
                  </label>
                  <select
                    value={selectedTradeUnitId}
                    onChange={e => setSelectedTradeUnitId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Owned Unit --</option>
                    {playerOwnedAnimals.map((a, idx) => (
                      <option key={`${a.id}-${idx}`} value={a.id}>
                        {a.name} ({a.rarity}) • Base Cost: {a.cost} Meat
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Asking Currency */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Choose Required Payment:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPostAskingType('meat')}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        postAskingType === 'meat'
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Coins size={14} /> Meat
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostAskingType('dna')}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        postAskingType === 'dna'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Dna size={14} /> DNA
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostAskingType('shards')}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        postAskingType === 'shards'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles size={14} /> God Shards
                    </button>
                  </div>
                </div>

                {/* Asking Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Asking Amount ({postAskingType.toUpperCase()}):
                  </label>
                  <input
                    type="number"
                    value={postAskingAmount}
                    onChange={e => setPostAskingAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-mono text-amber-300 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handlePostOfferToBoard}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Publish Offer to World Trade Board
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Trade History */}
          {activeTab === 'history' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">
                Completed Trade Log
              </h3>

              {tradeHistory.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <History size={32} className="opacity-30" />
                  <p className="text-xs font-bold uppercase">No completed trade history yet</p>
                  <p className="text-[10px] text-slate-600">Accept market trades or redeem codes to see transaction records here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tradeHistory.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="bg-slate-850/80 border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <CheckCircle2 size={16} />
                        </span>
                        <div>
                          <p className="font-bold text-white leading-tight">
                            Acquired <span className="text-amber-300">{item.unitReceived}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Trader: {item.traderName} • Paid: {item.costPaid}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trader Offer Inspection Modal */}
          <AnimatePresence>
            {inspectedOffer && (
              <div 
                className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setInspectedOffer(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden space-y-5"
                >
                  {/* Background glow accent matching unit color */}
                  <div 
                    className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: inspectedOffer.offeredUnit.color }}
                  />

                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-white/10">{inspectedOffer.traderAvatar}</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">{inspectedOffer.traderName}</h3>
                          <ShieldCheck size={14} className="text-emerald-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Reputation: {inspectedOffer.traderRep}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectedOffer(null)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Offered Unit Showcase Card */}
                  <div 
                    className="p-4 rounded-xl border-l-4 bg-slate-850/90 border border-white/10 relative space-y-3"
                    style={{ borderLeftColor: inspectedOffer.offeredUnit.color }}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 border border-white/10"
                        style={{ color: inspectedOffer.offeredUnit.color }}
                      >
                        {inspectedOffer.offeredUnit.rarity} UNIT
                      </span>
                      {gameState.summonedAnimals.includes(inspectedOffer.offeredUnitId) ? (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Check size={12} /> Owned in Squad
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                          ✨ New Discovery
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-white">{inspectedOffer.offeredUnit.name}</h2>
                      {inspectedOffer.offeredUnit.isExtinct && (
                        <p className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest mt-0.5">
                          ⚠️ Extinct Ancient Specimen
                        </p>
                      )}
                    </div>

                    {/* Unit Stat Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-lg border border-white/5 font-mono text-center">
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Damage</div>
                        <div className="text-xs font-black text-rose-400">{inspectedOffer.offeredUnit.damage}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Range</div>
                        <div className="text-xs font-black text-cyan-400">{inspectedOffer.offeredUnit.range} px</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans uppercase">Fire Rate</div>
                        <div className="text-xs font-black text-amber-400">
                          {inspectedOffer.offeredUnit.fireRate === 999999 ? 'AURA' : `${(1000 / inspectedOffer.offeredUnit.fireRate).toFixed(1)}/s`}
                        </div>
                      </div>
                    </div>

                    {/* Special Skill / Passive Income */}
                    {inspectedOffer.offeredUnit.skillName && (
                      <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg space-y-1">
                        <div className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
                          <Zap size={12} /> Special Ability: {inspectedOffer.offeredUnit.skillName}
                        </div>
                        <p className="text-[11px] text-amber-200/80 leading-snug">
                          {inspectedOffer.offeredUnit.skillDesc}
                        </p>
                      </div>
                    )}

                    {inspectedOffer.offeredUnit.generationMeat && (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-lg text-xs font-mono text-emerald-300 flex items-center justify-between">
                        <span>🥩 Meat Income Generation:</span>
                        <span className="font-bold text-emerald-400">+{inspectedOffer.offeredUnit.generationMeat}/sec</span>
                      </div>
                    )}
                  </div>

                  {/* Asking Price & Requirements */}
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Trader Asking Price:</span>
                      <span className="font-mono font-black text-amber-300 text-sm flex items-center gap-1.5">
                        {inspectedOffer.askingType === 'meat' && (
                          <><Coins size={15} className="text-yellow-400" /> {inspectedOffer.askingAmount} Meat</>
                        )}
                        {inspectedOffer.askingType === 'dna' && (
                          <><Dna size={15} className="text-emerald-400" /> {inspectedOffer.askingAmount} DNA</>
                        )}
                        {inspectedOffer.askingType === 'shards' && (
                          <><Sparkles size={15} className="text-amber-400" /> {inspectedOffer.askingAmount} God Shards</>
                        )}
                        {inspectedOffer.askingType === 'unit' && (
                          <span className="text-purple-300">1x {inspectedOffer.askingUnitRarity} Unit</span>
                        )}
                      </span>
                    </div>

                    {/* Current balance status */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Your Current Balance:</span>
                      {inspectedOffer.askingType === 'meat' && (
                        <span className={`font-bold ${gameState.meat >= (inspectedOffer.askingAmount || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gameState.meat.toLocaleString()} Meat
                        </span>
                      )}
                      {inspectedOffer.askingType === 'dna' && (
                        <span className={`font-bold ${gameState.dna >= (inspectedOffer.askingAmount || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {gameState.dna.toLocaleString()} DNA
                        </span>
                      )}
                      {inspectedOffer.askingType === 'shards' && (
                        <span className={`font-bold ${(gameState.shardsOfGods || 0) >= (inspectedOffer.askingAmount || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(gameState.shardsOfGods || 0).toLocaleString()} Shards
                        </span>
                      )}
                      {inspectedOffer.askingType === 'unit' && (
                        <span className="text-purple-300 font-bold">
                          {ANIMALS.filter(a => a.rarity === inspectedOffer.askingUnitRarity && gameState.summonedAnimals.includes(a.id)).length} Eligible Units
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setInspectedOffer(null)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleAcceptTrade(inspectedOffer);
                        setInspectedOffer(null);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check size={16} /> Accept & Claim Unit
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
