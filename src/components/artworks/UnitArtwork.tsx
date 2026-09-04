import React from 'react';
import {
  MouseArtwork,
  RabbitArtwork,
  PigeonArtwork,
  HedgehogArtwork,
  SparrowArtwork,
} from './CommonArtworks';
import {
  FoxArtwork,
  WolfArtwork,
  EagleArtwork,
  CobraArtwork,
  PantherArtwork,
  BeeArtwork,
} from './RareArtworks';
import {
  LionArtwork,
  BearArtwork,
  CrocArtwork,
  RhinoArtwork,
  OwlArtwork,
} from './EpicArtworks';
import {
  MammothArtwork,
  SmilodonArtwork,
  DodoArtwork,
  MegalodonArtwork,
  TerrorBirdArtwork,
} from './LegendaryArtworks';
import {
  TRexArtwork,
  PhoenixArtwork,
  DragonArtwork,
  BasiliskArtwork,
  ChimeraArtwork,
  GriffinArtwork,
  KrakenArtwork,
  HydraArtwork,
} from './MythicArtworks';
import {
  MechaRexArtwork,
  CthulhuArtwork,
  KaijuArtwork,
  SecretStardustArtwork,
  SecretNebulaKrakenArtwork,
  SecretQuantumGlitchArtwork,
  SecretCyberViperArtwork,
  SecretSolarLionArtwork,
} from './SecretArtworks';
import {
  CelestialPegasusArtwork,
  CelestialKitsuneArtwork,
  CelestialLeviathanArtwork,
  CelestialChronosArtwork,
  CelestialSeraphArtwork,
  CelestialBehemothArtwork,
} from './CelestialArtworks';
import {
  MysteryAnomalyArtwork,
  MysterySingularityArtwork,
  MysteryNullifierArtwork,
  MysteryEclipseArtwork,
  MysteryEntropyArtwork,
  MysterySupervoidArtwork,
  MysteryContinuumArtwork,
  MysteryDarkstarArtwork,
} from './MysteryArtworks';
import {
  OriginalGenesisArtwork,
  OriginalAbyssArtwork,
  BlackholeDwarfArtwork,
  OriginalRagnarokArtwork,
  OriginalOmegaArtwork,
  BufferArtwork,
  AllSeeingOverseerArtwork,
  ElementalGodArtwork,
  TitanDefenderArtwork,
  MultiverseWatcherArtwork,
  UnrivaledSolarPhoenixArtwork,
  UnrivaledVoidBehemothArtwork,
  UnrivaledFrostDragonArtwork,
  UnrivaledStormWyvernArtwork,
  ArcaneWarperArtwork,
  InfectedWarperArtwork,
  CapybaraArtwork,
} from './OriginalAndOverseerArtworks';
import { ScientistAnimalsArtwork } from './ScientistArtwork';

export { ScientistAnimalsArtwork } from './ScientistArtwork';

export const UNIT_ARTWORK_MAP: Record<string, React.FC<{ className?: string }>> = {
  // Common
  mouse: MouseArtwork,
  rabbit: RabbitArtwork,
  pigeon: PigeonArtwork,
  hedgehog: HedgehogArtwork,
  sparrow: SparrowArtwork,

  // Rare
  fox: FoxArtwork,
  wolf: WolfArtwork,
  eagle: EagleArtwork,
  cobra: CobraArtwork,
  panther: PantherArtwork,
  bee: BeeArtwork,

  // Epic
  lion: LionArtwork,
  bear: BearArtwork,
  croc: CrocArtwork,
  rhino: RhinoArtwork,
  owl: OwlArtwork,

  // Legendary
  mammoth: MammothArtwork,
  smilodon: SmilodonArtwork,
  dodo: DodoArtwork,
  megalodon: MegalodonArtwork,
  terror_bird: TerrorBirdArtwork,

  // Mythic
  trex: TRexArtwork,
  phoenix: PhoenixArtwork,
  dragon: DragonArtwork,
  basilisk: BasiliskArtwork,
  chimera: ChimeraArtwork,
  griffin: GriffinArtwork,
  kraken: KrakenArtwork,
  hydra: HydraArtwork,

  // Secret
  mecha_rex: MechaRexArtwork,
  cthulhu: CthulhuArtwork,
  kaiju: KaijuArtwork,
  secret_stardust: SecretStardustArtwork,
  secret_nebula_kraken: SecretNebulaKrakenArtwork,
  secret_quantum_glitch: SecretQuantumGlitchArtwork,
  secret_cyber_viper: SecretCyberViperArtwork,
  secret_solar_lion: SecretSolarLionArtwork,

  // Celestial
  celestial_pegasus: CelestialPegasusArtwork,
  celestial_kitsune: CelestialKitsuneArtwork,
  celestial_leviathan: CelestialLeviathanArtwork,
  celestial_chronos: CelestialChronosArtwork,
  celestial_seraph: CelestialSeraphArtwork,
  celestial_behemoth: CelestialBehemothArtwork,

  // ???
  mystery_anomaly: MysteryAnomalyArtwork,
  mystery_singularity: MysterySingularityArtwork,
  mystery_nullifier: MysteryNullifierArtwork,
  mystery_eclipse: MysteryEclipseArtwork,
  mystery_entropy: MysteryEntropyArtwork,
  mystery_supervoid: MysterySupervoidArtwork,
  mystery_continuum: MysteryContinuumArtwork,
  mystery_darkstar: MysteryDarkstarArtwork,

  // Original
  original_genesis: OriginalGenesisArtwork,
  original_abyss: OriginalAbyssArtwork,
  blackhole_dwarf: BlackholeDwarfArtwork,
  original_ragnarok: OriginalRagnarokArtwork,
  original_omega: OriginalOmegaArtwork,
  buffer: BufferArtwork,

  // Overseer
  all_seeing_overseer: AllSeeingOverseerArtwork,
  elemental_god: ElementalGodArtwork,
  titan_defender: TitanDefenderArtwork,
  multiverse_watcher: MultiverseWatcherArtwork,
  titan_defender_form3: MultiverseWatcherArtwork,

  // Unrivaled
  unrivaled_solar_phoenix: UnrivaledSolarPhoenixArtwork,
  unrivaled_void_behemoth: UnrivaledVoidBehemothArtwork,
  unrivaled_frost_dragon: UnrivaledFrostDragonArtwork,
  unrivaled_storm_wyvern: UnrivaledStormWyvernArtwork,

  // Arcane
  arcane_warper: ArcaneWarperArtwork,
  infected_warper: InfectedWarperArtwork,
  corrupted_warper: InfectedWarperArtwork,

  // The Chillful
  capybara: CapybaraArtwork,

  // Science & Engineering Guild
  scientist_animals: ScientistAnimalsArtwork,
};

export interface UnitArtworkProps {
  animalId: string;
  className?: string;
  fallbackEmoji?: string;
}

export const UnitArtwork: React.FC<UnitArtworkProps> = ({
  animalId,
  className = 'w-full h-full',
  fallbackEmoji,
}) => {
  // Check for deity variants (e.g. fire_deity, water_deity)
  const lookupId = animalId.endsWith('_deity') ? 'elemental_god' : animalId;
  const Component = UNIT_ARTWORK_MAP[lookupId];

  if (Component) {
    return <Component className={className} />;
  }

  return (
    <span className="flex items-center justify-center text-lg select-none">
      {fallbackEmoji || '🐾'}
    </span>
  );
};

export default UnitArtwork;
