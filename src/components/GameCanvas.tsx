import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { TowerInstance, EnemyInstance, Projectile, SkillEffect, Animal } from '../types';
import { ANIMALS, ENEMIES, CANVAS_WIDTH, CANVAS_HEIGHT, ANIMAL_ELEMENTS, ELEMENT_COLORS, ELEMENT_ICONS, formatDamageNumber } from '../constants';
import { ElementalHazardZone, getTowerHazardAffinity } from '../elementalHazards';
import { isPositionValidForTower, isPositionValidForTitan } from '../hooks/useGameLoop';
import { Crosshair, Grid, Zap, Layers, Activity, ChevronDown, ChevronUp, Sparkles, Flame, ShieldAlert, Target, Eye, EyeOff } from 'lucide-react';

const ENEMY_MAP = new Map(ENEMIES.map(e => [e.id, e]));
const ANIMAL_MAP = new Map(ANIMALS.map(a => [a.id, a]));

export interface TacticalHeatmapCell {
  gx: number; // 0..19
  gy: number; // 0..14
  cx: number; // grid center X (20, 60, 100...)
  cy: number; // grid center Y (20, 60, 100...)
  coordName: string; // e.g. "C-06"
  isRoadway: boolean;
  isOccupied: boolean;
  efficiency: number; // 0..100%
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'PATH' | 'OCCUPIED';
  rawScore: number;
  pointsInRange: number;
  segmentsCovered: number;
  dwellEstimate: number; // seconds
  isApex: boolean; // Top prime chokepoints
}

function getDistToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function computeLaneEfficiencyHeatmap(
  path: { x: number; y: number }[],
  towers: TowerInstance[],
  selectedDeployAnimal?: Animal | null
): { cells: TacticalHeatmapCell[]; apexCells: TacticalHeatmapCell[]; maxRawScore: number; sCount: number; aCount: number } {
  if (!path || path.length < 2) {
    return { cells: [], apexCells: [], maxRawScore: 0, sCount: 0, aCount: 0 };
  }

  // 1. High-fidelity path sampling (every 6 pixels)
  const sampledPoints: { x: number; y: number; segIdx: number }[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const stepCount = Math.max(1, Math.floor(segLen / 6));
    for (let s = 0; s <= stepCount; s++) {
      const frac = s / stepCount;
      sampledPoints.push({
        x: p1.x + (p2.x - p1.x) * frac,
        y: p1.y + (p2.y - p1.y) * frac,
        segIdx: i,
      });
    }
  }

  const effectiveRadius = selectedDeployAnimal?.range 
    ? Math.min(240, Math.max(80, selectedDeployAnimal.range))
    : 130;

  const COLS = 20; // 800 / 40
  const ROWS = 15; // 600 / 40
  const cells: TacticalHeatmapCell[] = [];
  let maxRawScore = 0.0001;

  const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      const cx = gx * 40 + 20;
      const cy = gy * 40 + 20;
      const coordName = `${colLetters[gx] || '?'}-${String(gy + 1).padStart(2, '0')}`;

      // Check distance to path
      let minDistToPath = Infinity;
      for (let i = 0; i < path.length - 1; i++) {
        const d = getDistToSegment(cx, cy, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
        if (d < minDistToPath) minDistToPath = d;
      }

      const isRoadway = minDistToPath < 36;
      const isOccupied = towers.some(t => Math.hypot(t.x - cx, t.y - cy) < 24);

      if (isRoadway) {
        cells.push({
          gx,
          gy,
          cx,
          cy,
          coordName,
          isRoadway: true,
          isOccupied,
          efficiency: 0,
          tier: 'PATH',
          rawScore: 0,
          pointsInRange: 0,
          segmentsCovered: 0,
          dwellEstimate: 0,
          isApex: false
        });
        continue;
      }

      // Check points in range
      let pointsInRange = 0;
      const coveredSegs = new Set<number>();
      for (const pt of sampledPoints) {
        const d = Math.hypot(pt.x - cx, pt.y - cy);
        if (d <= effectiveRadius) {
          pointsInRange++;
          coveredSegs.add(pt.segIdx);
        }
      }

      // Multi-segment bend / loop chokepoint multiplier (e.g. 1.5x for 2 segments, 2.0x for 3 segments)
      const segMultiplier = coveredSegs.size > 1 ? 1.0 + (coveredSegs.size - 1) * 0.50 : 1.0;
      
      // Proximity sweet spot (optimal firing arc is 40px - 85px from road center)
      let proximityBonus = 1.0;
      if (minDistToPath >= 40 && minDistToPath <= 85) {
        proximityBonus = 1.25;
      } else if (minDistToPath > 160) {
        proximityBonus = 0.6;
      }

      const rawScore = pointsInRange * segMultiplier * proximityBonus;
      if (rawScore > maxRawScore) {
        maxRawScore = rawScore;
      }

      const dwellEstimate = parseFloat(((pointsInRange * 6) / 85).toFixed(1));

      cells.push({
        gx,
        gy,
        cx,
        cy,
        coordName,
        isRoadway: false,
        isOccupied,
        efficiency: 0,
        tier: 'D',
        rawScore,
        pointsInRange,
        segmentsCovered: coveredSegs.size,
        dwellEstimate,
        isApex: false
      });
    }
  }

  let sCount = 0;
  let aCount = 0;

  // Normalize efficiency 0..100% and assign tiers
  for (const cell of cells) {
    if (!cell.isRoadway) {
      const ratio = cell.rawScore / maxRawScore;
      cell.efficiency = Math.min(100, Math.round(ratio * 100));

      if (cell.efficiency >= 84) {
        cell.tier = 'S';
        sCount++;
      } else if (cell.efficiency >= 64) {
        cell.tier = 'A';
        aCount++;
      } else if (cell.efficiency >= 40) {
        cell.tier = 'B';
      } else if (cell.efficiency >= 18) {
        cell.tier = 'C';
      } else {
        cell.tier = 'D';
      }
    }
  }

  // Identify Top 3 Apex Chokepoints
  const validCells = cells.filter(c => !c.isRoadway && c.efficiency >= 85);
  validCells.sort((a, b) => b.rawScore - a.rawScore);
  const apexCells = validCells.slice(0, 3);
  apexCells.forEach(c => {
    c.isApex = true;
  });

  return { cells, apexCells, maxRawScore, sCount, aCount };
}

const drawCubeEnemy = (
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  enemyId: string,
  emoji?: string,
  isBoss: boolean = false
) => {
  const h = size / 2;

  // 1. Drop Shadow under the cube (sinister crimson/purple shadow)
  ctx.fillStyle = isBoss ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, h, size * 0.75, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // If boss, draw glowing background aura
  if (isBoss) {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Base Square (sinister dark-tinted colors)
  ctx.fillStyle = color;
  ctx.fillRect(-h, -h, size, size);

  // 3. Isometric Top Overlay (Lighter tint)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h - h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.closePath();
  ctx.fill();

  // 4. Isometric Right Face Overlay (Darker shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -h + h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(h, h);
  ctx.lineTo(0, h + h/2);
  ctx.closePath();
  ctx.fill();

  // 5. Isometric Left Face Overlay (Medium shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.lineTo(0, h + h/2);
  ctx.lineTo(-h, h);
  ctx.closePath();
  ctx.fill();

  // 6. Draw glowing corrupted evil eye lines on left/right faces
  ctx.fillStyle = '#ff003c'; // Neon radioactive red
  // Left eye
  ctx.beginPath();
  ctx.arc(-h / 2, h / 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(h / 2, h / 4, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Add neon radioactive brow/frown
  ctx.strokeStyle = '#ff003c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-h / 2 - 2, h / 4 - 2.5);
  ctx.lineTo(-h / 2 + 2, h / 4 - 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(h / 2 + 2, h / 4 - 2.5);
  ctx.lineTo(h / 2 - 2, h / 4 - 1.5);
  ctx.stroke();

  // 7. Draw the animal emoji beautifully centered inside the cube
  if (emoji) {
    ctx.save();
    ctx.font = `bold ${Math.max(10, Math.floor(size * 0.72))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    // Draw emoji slightly shifted up
    ctx.fillText(emoji, 0, -h / 4);
    ctx.restore();
  }

  // Draw cyber horn or toxic tubes for specific bad animals
  if (enemyId.startsWith('hitech_') || isBoss) {
    ctx.strokeStyle = '#a855f7'; // Purple tech conduits
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -h - h/2);
    ctx.lineTo(0, -h - h/2 - 6);
    ctx.stroke();
    ctx.fillStyle = '#ec4899'; // Hot pink tip
    ctx.fillRect(-1.5, -h - h/2 - 9, 3, 3);
  }
};

const drawCubeAnimal = (
  ctx: CanvasRenderingContext2D, 
  size: number, 
  color: string, 
  isMythicOrSecret: boolean, 
  animalId: string,
  level: number = 1,
  isPinnacle: boolean = false,
  titanForm?: string,
  ultraLaserActive?: boolean,
  tower?: any
) => {
  const h = size / 2;
  
  // 1. Drop Shadow under the cube
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, h, size * 0.7, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Base Square
  ctx.fillStyle = color;
  ctx.fillRect(-h, -h, size, size);

  // 3. Isometric Top Overlay (Lighter tint)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h - h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.closePath();
  ctx.fill();

  // 4. Isometric Right Face Overlay (Darker shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, -h + h/2);
  ctx.lineTo(h, -h);
  ctx.lineTo(h, h);
  ctx.lineTo(0, h + h/2);
  ctx.closePath();
  ctx.fill();

  // 5. Isometric Left Face Overlay (Medium shade)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.moveTo(-h, -h);
  ctx.lineTo(0, -h + h/2);
  ctx.lineTo(0, h + h/2);
  ctx.lineTo(-h, h);
  ctx.closePath();
  ctx.fill();

  // 5.5 Draw high-fidelity animal emoji beautifully centered inside the cube
  const animalDef = ANIMAL_MAP.get(animalId);
  const emoji = animalDef?.emoji;
  if (emoji && animalId !== 'buffer') {
    ctx.save();
    // Use high-contrast font size proportional to the isometric cube dimensions
    const fontSize = Math.max(12, Math.floor(size * 0.75));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    // Optically align the emoji within the upper-middle of the 3D isometric cube
    ctx.fillText(emoji, 0, -h / 5);
    ctx.restore();
  }

  // 6. Distinct Voxel Features per Animal ID
  if (animalId === 'mouse') {
    // Pink round ears
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(-7, -h - 2, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -h - 2, 4, 0, Math.PI*2); ctx.fill();
  } else if (animalId === 'rabbit') {
    // Elegant tall ears
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-6, -h - 11, 3, 12);
    ctx.fillRect(3, -h - 11, 3, 12);
    ctx.fillStyle = '#fda4af'; // pink inner
    ctx.fillRect(-5, -h - 9, 1, 9);
    ctx.fillRect(4, -h - 9, 1, 9);
  } else if (animalId === 'pigeon') {
    // Beak
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(h, -3);
    ctx.lineTo(h + 6, 0);
    ctx.lineTo(h, 3);
    ctx.fill();
  } else if (animalId === 'bee') {
    // Striped stripes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -h, 3, size);
    ctx.fillRect(4, -h, 3, size);
    // Translucent wings
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.ellipse(-9, -h - 3, 3, 7, -Math.PI/6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, -h - 3, 3, 7, Math.PI/6, 0, Math.PI*2); ctx.fill();
  } else if (animalId === 'croc') {
    // Ridged spikes
    ctx.fillStyle = '#14532d';
    ctx.fillRect(-h, -h - 3, 3, 3);
    ctx.fillRect(-1, -h - 3, 3, 3);
    ctx.fillRect(h - 3, -h - 3, 3, 3);
  } else if (animalId === 'lion') {
    // Fluffy outline fur mane
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.strokeRect(-h - 2, -h - 2, size + 4, size + 4);
  } else if (animalId === 'bear') {
    // Brown ears
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-h, -h - 4, 4, 4);
    ctx.fillRect(h - 4, -h - 4, 4, 4);
  } else if (animalId === 'mammoth') {
    // Giant white tusks
    ctx.strokeStyle = '#f5f5f4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.quadraticCurveTo(h + 7, 7, h + 9, -1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, -3);
    ctx.quadraticCurveTo(h + 7, -7, h + 9, 1);
    ctx.stroke();
  } else if (animalId === 'smilodon') {
    // Downward fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(h - 2, 1); ctx.lineTo(h + 5, 6); ctx.lineTo(h - 2, 3); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(h - 2, -4); ctx.lineTo(h + 5, -9); ctx.lineTo(h - 2, -6); ctx.fill();
  } else if (animalId === 'dodo') {
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(h, -4, 6, 8);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(h + 3, -2, 4, 4);
  } else if (animalId === 'fox') {
    // Pointy fox ears
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-h, -h); ctx.lineTo(-h - 2, -h - 6); ctx.lineTo(-4, -h); ctx.fill();
    ctx.moveTo(h, -h); ctx.lineTo(h + 2, -h - 6); ctx.lineTo(4, -h); ctx.fill();
  } else if (animalId === 'wolf') {
    // Grey wolf ears
    ctx.fillStyle = '#334155';
    ctx.fillRect(-h, -h - 4, 3, 4);
    ctx.fillRect(h - 3, -h - 4, 3, 4);
  } else if (animalId === 'eagle') {
    // White eagle cap + yellow beak
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-h, -h); ctx.lineTo(h, -h); ctx.lineTo(0, 0); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(h - 1, -2); ctx.lineTo(h + 8, 0); ctx.lineTo(h - 1, 2); ctx.fill();
  } else if (animalId === 'buffer') {
    // Ultra-polished Nebula Overcharge Beacon appearance
    const angle1 = (Date.now() / 600) % (Math.PI * 2);
    const angle2 = -(Date.now() / 400) % (Math.PI * 2);
    const pulse = Math.sin(Date.now() / 150) * 2;

    ctx.save();
    ctx.shadowBlur = 12 + pulse;
    ctx.shadowColor = '#00ffcc';
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5;
    
    // Orbit Ring 1
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + pulse, 6 + pulse/2, angle1, 0, Math.PI * 2);
    ctx.stroke();

    // Orbit Ring 2
    ctx.strokeStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 4, angle2, 0, Math.PI * 2);
    ctx.stroke();

    // Tower Pillars (High tech glowing lines)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -h - 16, 6, 17); // larger tower pillar
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(-1.5, -h - 14, 3, 14); // neon glow core line

    // Top Glowing Hyper-Core Sphere
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 18 + pulse * 2;
    ctx.shadowColor = '#00ffcc';
    ctx.beginPath();
    ctx.arc(0, -h - 17, 6 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Satellite hovering sub-emitters
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath();
    const satDist = 14 + pulse * 0.3;
    ctx.arc(Math.cos(angle1) * satDist, Math.sin(angle1) * 5, 2.5, 0, Math.PI * 2);
    ctx.arc(Math.cos(angle1 + Math.PI) * satDist, Math.sin(angle1 + Math.PI) * 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  
  // --- MYTHIC & SECRET SPECIAL CUBES ---
  else if (animalId === 'trex') {
    // Red T-Rex Ridge spikes and white sharp teeth
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-h, -h - 3, 4, 3);
    ctx.fillRect(2, -h - 3, 4, 3);
    ctx.fillStyle = 'white';
    ctx.fillRect(h - 2, -4, 3, 2);
    ctx.fillRect(h - 2, 2, 3, 2);
  } else if (animalId === 'phoenix') {
    // Flamboyant flame crowns
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-6, -h); ctx.lineTo(0, -h - 11); ctx.lineTo(6, -h); ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-3, -h); ctx.lineTo(0, -h - 7); ctx.lineTo(3, -h); ctx.fill();
  } else if (animalId === 'dragon') {
    // Ancient horns and crown scales
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-h, -h); ctx.lineTo(-h - 4, -h - 8); ctx.lineTo(-4, -h); ctx.fill();
    ctx.moveTo(h, -h); ctx.lineTo(h + 4, -h - 8); ctx.lineTo(4, -h); ctx.fill();
  } else if (animalId === 'mecha_rex') {
    // Laser visor and antennae
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-h, -h - 5, 2, 5);
    ctx.fillRect(h - 2, -h - 5, 2, 5);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(1, -3, h, 6);
  } else if (animalId === 'cthulhu') {
    // Front hanging void tentacles
    ctx.fillStyle = '#10b981';
    ctx.fillRect(2, 2, h + 4, 3);
    ctx.fillRect(2, -5, h + 4, 3);
    ctx.fillRect(h - 2, -1, 4, 2);
  } else if (animalId === 'kaiju') {
    // Purple nuclear spines
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    ctx.moveTo(-h, -h); ctx.lineTo(-h - 5, -h - 5); ctx.lineTo(-1, -h); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(h - 5, -h); ctx.lineTo(h - 8, -h - 5); ctx.lineTo(h - 1, -h); ctx.fill();
  } else if (animalId === 'celestial_pegasus') {
    // Starry wings + unicorn horn
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(0, -h); ctx.lineTo(0, -h - 12); ctx.lineTo(3, -h); ctx.fill();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillRect(-h - 6, -3, 6, 6);
    ctx.fillRect(h, -3, 6, 6);
  } else if (animalId === 'celestial_kitsune') {
    // Elegant kitsune celestial ears and star mask
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-h, -h); ctx.lineTo(-h - 3, -h - 7); ctx.lineTo(-2, -h); ctx.fill();
    ctx.moveTo(h, -h); ctx.lineTo(h + 3, -h - 7); ctx.lineTo(2, -h); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2, 4, 4);
  } else if (animalId === 'celestial_leviathan') {
    // Astra Leviathan - Glowing cosmic crown, swirling tail fins and gravitational event-horizon ring
    ctx.save();
    
    // Pulsing and breathing aura effects
    const pulse = Math.sin(Date.now() / 200) * 2;
    const wave = Math.sin(Date.now() / 150) * 0.15;

    // Outer orbiting micro-singularities (dark purple stars)
    ctx.fillStyle = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#d946ef';
    for (let s = 0; s < 3; s++) {
      const sa = (Date.now() / 400) + (s * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(sa) * 20, Math.sin(sa) * 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing energy spine fins (draw behind)
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(-5, -h);
    ctx.lineTo(0, -h - 12 - pulse);
    ctx.lineTo(5, -h);
    ctx.fill();

    // Whisker/tentacle energy flows curving from the mouth/head
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(h - 3, -2);
    ctx.quadraticCurveTo(h + 8, -6 + wave * 10, h + 12, -2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(h - 3, 2);
    ctx.quadraticCurveTo(h + 8, 6 - wave * 10, h + 12, 2);
    ctx.stroke();

    // Event Horizon halo
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + pulse, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  } else if (animalId === 'blackhole_dwarf') {
    // Gravity field patterns around the cube
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#d946ef';
    
    // Rotating gravity ring on top of the cube
    const gravityAngle = (Date.now() / 300) % (Math.PI * 2);
    ctx.save();
    ctx.rotate(gravityAngle);
    ctx.strokeRect(-h - 3, -h - 3, size + 6, size + 6);
    ctx.restore();

    // Singularity center core
    ctx.fillStyle = '#090514';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Event Horizon/Accretion disk
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Unlock 2 cosmic wings if level is 2 or higher, or isPinnacle (representing Phase 2)
    if (level >= 2 || isPinnacle) {
      ctx.save();
      
      const wingFlap = Math.sin(Date.now() / 240) * 0.15; // breathing/flapping motion
      
      // Let's draw 2 pulsing, celestial cosmic wings on each side of the blackhole dwarf cube!
      // Left Cosmic Wing
      ctx.save();
      ctx.translate(-h, 0);
      ctx.rotate(-wingFlap);
      
      // Main cosmic sail
      const leftGrad = ctx.createLinearGradient(-35, -20, 0, 0);
      leftGrad.addColorStop(0, 'rgba(236, 72, 153, 0.95)'); // Shimmering host hot pink
      leftGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.7)'); // Abyssal violet
      leftGrad.addColorStop(1, 'rgba(6, 182, 212, 0.1)'); // Celestial cyan
      ctx.fillStyle = leftGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ec4899';
      
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(-15, -25, -35, -18, -35, -8);
      ctx.bezierCurveTo(-35, 3, -20, 8, 0, 3);
      ctx.closePath();
      ctx.fill();

      // Wing glow cosmic energy rib-lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(-28, -13);
      ctx.moveTo(0, 0);
      ctx.lineTo(-32, -5);
      ctx.moveTo(0, 3);
      ctx.lineTo(-24, 4);
      ctx.stroke();

      // Glowing floating space-dust/stars on the wing
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(-26, -11, 2, 0, Math.PI * 2);
      ctx.arc(-30, -4, 2, 0, Math.PI * 2);
      ctx.arc(-22, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();

      // Right Cosmic Wing
      ctx.save();
      ctx.translate(h, 0);
      ctx.rotate(wingFlap);
      
      const rightGrad = ctx.createLinearGradient(35, -20, 0, 0);
      rightGrad.addColorStop(0, 'rgba(236, 72, 153, 0.95)');
      rightGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.7)');
      rightGrad.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
      ctx.fillStyle = rightGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ec4899';
      
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(15, -25, 35, -18, 35, -8);
      ctx.bezierCurveTo(35, 3, 20, 8, 0, 3);
      ctx.closePath();
      ctx.fill();

      // Wing glow cosmic energy rib-lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(28, -13);
      ctx.moveTo(0, 0);
      ctx.lineTo(32, -5);
      ctx.moveTo(0, 3);
      ctx.lineTo(24, 4);
      ctx.stroke();

      // Glowing floating space-dust/stars on the wing
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, -11, 2, 0, Math.PI * 2);
      ctx.arc(30, -4, 2, 0, Math.PI * 2);
      ctx.arc(21, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      
      ctx.restore();
    }
  } else if (animalId === 'elemental_god' || animalId.endsWith('_deity')) {
    // Elegant deity elemental crown and halo
    ctx.save();
    ctx.translate(h / 2, 0); // front facing side
    
    // Glowing central elemental core pupillary sphere
    ctx.fillStyle = color; // the dynamic element color!
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // White spark inside the element core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Floating elemental crystals orbiting the god
    ctx.save();
    const rot = (Date.now() / 600) % (Math.PI * 2);
    for (let i = 0; i < 3; i++) {
      const ang = rot + (i * Math.PI * 2) / 3;
      const ox = Math.cos(ang) * (size * 0.85);
      const oy = Math.sin(ang) * (size * 0.85);
      
      // Draw tiny rotating diamond/square crystal
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(rot * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillRect(-3, -3, 6, 6);
      
      // inner crystal white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
    ctx.restore();
  } else if (animalId === 'titan_defender') {
    // Ultra Strong Heavy Armored Titan (Bigger than any animal, titanium alloy plating, laser cannons)
    const isUpgradedTV = tower && tower.titanSkin === 'upgraded_titan_tv_man';
    const isForm2 = titanForm === 'form2_merged';
    ctx.save();
    
    if (titanForm === 'form3_multiverse') {
      // ===== FORM 3: MULTIVERSE WATCHER (BLACKHOLE SINGULARITY & COSMIC EVENT HORIZON - 2ND ARCANE) =====
      const pulse = Math.sin(Date.now() / 250) * 0.15;
      const rot = (Date.now() / 1500) % (Math.PI * 2);

      ctx.save();
      // Outer Cosmic Accretion Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
      glowGrad.addColorStop(0.4, 'rgba(236, 72, 153, 0.6)');
      glowGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();

      // Relativistic Accretion Disk (Swirling Ellipse)
      ctx.save();
      ctx.rotate(rot);
      ctx.scale(1, 0.45);
      const diskGrad = ctx.createRadialGradient(0, 0, 14, 0, 0, 42);
      diskGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      diskGrad.addColorStop(0.2, '#f43f5e');
      diskGrad.addColorStop(0.5, '#a855f7');
      diskGrad.addColorStop(0.8, '#38bdf8');
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = diskGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Reverse Swirling Accretion Disk Ring
      ctx.save();
      ctx.rotate(-rot * 1.5);
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#818cf8';
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Polar Relativistic Jets (Up and Down glowing energy beams)
      const jetHeight = 35 + Math.sin(Date.now() / 100) * 8;
      const jetGrad = ctx.createLinearGradient(0, -jetHeight, 0, jetHeight);
      jetGrad.addColorStop(0, 'rgba(192, 132, 252, 0.8)');
      jetGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      jetGrad.addColorStop(1, 'rgba(192, 132, 252, 0.8)');
      ctx.strokeStyle = jetGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#d946ef';
      ctx.beginPath();
      ctx.moveTo(0, -jetHeight);
      ctx.lineTo(0, jetHeight);
      ctx.stroke();

      // Event Horizon (Absolute Pitch Black Core)
      ctx.fillStyle = '#000000';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 0, 16 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      // Photon Ring (Razor-sharp blazing white-gold outline)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 16 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Multiverse Spacetime Runes (8 dimensional orbiters)
      for (let i = 0; i < 8; i++) {
        const runeAngle = rot * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 4;
        const orbitDist = 32 + (i % 2 === 0 ? 4 : 0);
        const rx = Math.cos(runeAngle) * orbitDist;
        const ry = Math.sin(runeAngle) * orbitDist * 0.7;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#f43f5e';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      ctx.restore();
      return;
    }

    if (isUpgradedTV) {
      // ===== SKIN: UPGRADED TITAN TV MAN (100% ACCURATE TO PHOTO) =====
      
      // A. Menacing Background Spiky Claws / Back Wings
      ctx.save();
      ctx.fillStyle = '#050507'; // Deepest shadow obsidian black
      ctx.strokeStyle = '#7e22ce'; // Purple outline glow
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#a855f7';

      // Draw left giant spike wing curving upwards and outwards
      ctx.beginPath();
      ctx.moveTo(-15, -10);
      ctx.quadraticCurveTo(-h - 25, -h - 5, -h - 30, -h - 25);
      ctx.quadraticCurveTo(-h - 18, -h, -15, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw right giant spike wing curving upwards and outwards
      ctx.beginPath();
      ctx.moveTo(15, -10);
      ctx.quadraticCurveTo(h + 25, -h - 5, h + 30, -h - 25);
      ctx.quadraticCurveTo(h + 18, -h, 15, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Additional upper back claws/spikes (pointing upwards)
      for (let offset of [-20, -10, 10, 20]) {
        ctx.beginPath();
        ctx.moveTo(offset, -h);
        ctx.lineTo(offset * 1.5, -h - 22);
        ctx.lineTo(offset * 0.8, -h - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // 1. Dual Thruster Jetpack Booster Flames at the back
      const flameHeight = 18 + Math.sin(Date.now() / 40) * 10;
      ctx.save();
      ctx.fillStyle = '#d946ef'; // Intense magenta-purple jet flame
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#a855f7';
      // Left Thruster Flame
      ctx.beginPath();
      ctx.moveTo(-h + 4, h);
      ctx.lineTo(-h, h + flameHeight);
      ctx.lineTo(-h - 4, h);
      ctx.closePath();
      ctx.fill();
      // Right Thruster Flame
      ctx.beginPath();
      ctx.moveTo(h - 4, h);
      ctx.lineTo(h, h + flameHeight);
      ctx.lineTo(h + 4, h);
      ctx.closePath();
      ctx.fill();
      // Inner Flame (White-hot core)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-h + 2, h);
      ctx.lineTo(-h, h + flameHeight * 0.5);
      ctx.lineTo(-h - 2, h);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(h - 2, h);
      ctx.lineTo(h, h + flameHeight * 0.5);
      ctx.lineTo(h + 2, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Heavy Obsidian Carbon Armor Pauldrons
      ctx.fillStyle = '#09090b'; // Absolute charcoal pitch black
      ctx.fillRect(-h - 10, -h - 4, 12, size + 8);
      ctx.fillRect(h - 2, -h - 4, 12, size + 8);

      // Deep purple armor neon light slits (conduits)
      ctx.fillStyle = '#d946ef'; 
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#d946ef';
      ctx.fillRect(-h - 4, -h + 6, 2.5, size - 12);
      ctx.fillRect(h + 1.5, -h + 6, 2.5, size - 12);

      // Heavy Forearm spikes pointing up/outwards (menacing look)
      ctx.save();
      ctx.fillStyle = '#050507';
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 1;
      // Left shoulder blade hook
      ctx.beginPath();
      ctx.moveTo(-h - 10, -5);
      ctx.lineTo(-h - 24, -20);
      ctx.lineTo(-h - 10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right shoulder blade hook
      ctx.beginPath();
      ctx.moveTo(h + 10, -5);
      ctx.lineTo(h + 24, -20);
      ctx.lineTo(h + 10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Huge Glowing Purple Chest Core Reactor with Lens Flare
      const reactorPulse = 0.9 + 0.1 * Math.sin(Date.now() / 100);
      ctx.save();
      
      // Outer volumetric ambient core glow
      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 4, 35 * reactorPulse, 0, Math.PI * 2);
      ctx.fill();

      // Mid intense neon purple glow ring
      ctx.fillStyle = '#c084fc';
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#d946ef';
      ctx.beginPath();
      ctx.arc(0, 4, 14 * reactorPulse, 0, Math.PI * 2);
      ctx.fill();

      // Hot white-purple core emitter
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 4, 7 * reactorPulse, 0, Math.PI * 2);
      ctx.fill();

      // Core outline ring
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Horizontal Lens Flare beam across the chest (just like the high energy lens flare in the image!)
      const flareWidth = 100 + Math.sin(Date.now() / 80) * 25;
      const gradient = ctx.createLinearGradient(-flareWidth/2, 4, flareWidth/2, 4);
      gradient.addColorStop(0, 'rgba(217, 70, 239, 0)');
      gradient.addColorStop(0.3, 'rgba(217, 70, 239, 0.85)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.7, 'rgba(217, 70, 239, 0.85)');
      gradient.addColorStop(1, 'rgba(217, 70, 239, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-flareWidth / 2, 2.5, flareWidth, 3);
      ctx.restore();

      // 4. Central Large Spiked CRT TV Screen (The Face Monitor)
      ctx.save();
      ctx.translate(0, -h - 8);

      // Crown spikes on top of the TV cabinet (very spikey like the image!)
      ctx.fillStyle = '#050507';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      
      // Draw 3 sharp crown spikes pointing up
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(-15, -28);
      ctx.lineTo(-6, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-5, -14);
      ctx.lineTo(0, -32);
      ctx.lineTo(5, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(6, -14);
      ctx.lineTo(15, -28);
      ctx.lineTo(12, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // TV Cabinet Chassis
      ctx.fillStyle = '#0a0a0c'; // Pitch black housing
      ctx.fillRect(-19, -14, 38, 23);
      ctx.strokeStyle = '#a855f7'; // Neon violet frame glow
      ctx.lineWidth = 2;
      ctx.strokeRect(-19, -14, 38, 23);

      // Screen glass
      ctx.fillStyle = '#030304';
      ctx.fillRect(-15, -11, 30, 17);

      // Blinding Purple Screen Light (Instead of cutesy faces, draw the serious glowing energetic lattice!)
      ctx.save();
      
      // Flickering multiplier
      const flickerVal = Math.random() < 0.15 ? 0.72 : (0.9 + 0.1 * Math.sin(Date.now() / 15));
      ctx.globalAlpha = flickerVal;

      ctx.shadowBlur = 20 * flickerVal;
      ctx.shadowColor = '#d946ef';

      const scanlineY = ((Date.now() / 4) % 15) - 7;
      
      if (ultraLaserActive) {
        // Ultimate State: Intensely bright, solid white-pink energy screen
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -10, 28, 15);
        ctx.fillStyle = '#ef4444'; // Red outline
        ctx.strokeRect(-14, -10, 28, 15);
      } else {
        // Standard State: High-intensity glowing purple scanning lattice (like the photo!)
        const screenGrad = ctx.createLinearGradient(0, -10, 0, 5);
        screenGrad.addColorStop(0, '#7e22ce');
        screenGrad.addColorStop(0.5, '#d946ef');
        screenGrad.addColorStop(1, '#4c1d95');
        ctx.fillStyle = screenGrad;
        ctx.fillRect(-14, -10, 28, 15);

        // Blinding main horizontal text/glitch beam
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(-11, -4, 22, 5);

        // Glitch bars running vertically/horizontally
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-14, scanlineY, 28, 1.5);
      }

      // Inject high-frequency static noise dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let i = 0; i < 8; i++) {
        const nx = -14 + Math.random() * 28;
        const ny = -10 + Math.random() * 15;
        ctx.fillRect(nx, ny, 1.2, 1.2);
      }

      ctx.restore();
      ctx.restore();
      ctx.restore();

      // 5. Weapon Attachment (Main Laser / Claws)
      if (isForm2) {
        // Form 2 Great Defender Central Heavy plasma emitter
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-14, -h - 22, 28, 18);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-10, -h - 28, 20, 14);

        // Muzzle Glow
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#d946ef';
        ctx.shadowBlur = ultraLaserActive ? 30 : 18;
        ctx.shadowColor = '#d946ef';
        ctx.beginPath();
        ctx.arc(0, -h - 28, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dual side dark-plasma cannons
        // Left
        ctx.save();
        ctx.translate(-h - 12, 0);
        ctx.fillStyle = '#09090b'; ctx.fillRect(-8, -8, 12, 16);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(-14, -4, 8, 8);
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#d946ef';
        ctx.shadowBlur = 12; ctx.shadowColor = '#d946ef';
        ctx.beginPath(); ctx.arc(-14, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Right
        ctx.save();
        ctx.translate(h + 12, 0);
        ctx.fillStyle = '#09090b'; ctx.fillRect(-4, -8, 12, 16);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(6, -4, 8, 8);
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#d946ef';
        ctx.shadowBlur = 12; ctx.shadowColor = '#d946ef';
        ctx.beginPath(); ctx.arc(14, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // 6. Multiple CRT Screen Shoulder Array (4 monitors flanking the shoulders!)
      if (tower && tower.titanTVArrayUpgrade) {
        const shoulderFlicker = Math.random() < 0.12 ? 0.65 : 1.0;
        // LEFT INNER SCREEN
        ctx.save();
        ctx.globalAlpha = shoulderFlicker;
        ctx.translate(-h - 16, -10);
        // Angle spike on shoulders
        ctx.fillStyle = '#050507';
        ctx.beginPath();
        ctx.moveTo(-10, -10); ctx.lineTo(-14, -20); ctx.lineTo(-4, -10);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-10, -10, 20, 16);
        ctx.fillStyle = '#030304'; ctx.fillRect(-8, -8, 16, 12);
        ctx.fillStyle = ultraLaserActive ? '#ef4444' : '#d946ef';
        ctx.shadowBlur = 8; ctx.shadowColor = '#d946ef';
        ctx.fillRect(-8, -8, 16, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -4, 12, 4); // Bright scanning bar
        ctx.restore();

        // LEFT OUTER SCREEN (Angled outwards)
        ctx.save();
        ctx.globalAlpha = shoulderFlicker;
        ctx.translate(-h - 32, 2);
        ctx.rotate(-0.2);
        ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-9, -9, 18, 15);
        ctx.fillStyle = '#030304'; ctx.fillRect(-7, -7, 14, 11);
        ctx.fillStyle = '#d946ef';
        ctx.shadowBlur = 6; ctx.shadowColor = '#d946ef';
        ctx.fillRect(-7, -7, 14, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-5, -4, 10, 3);
        ctx.restore();

        // RIGHT INNER SCREEN
        ctx.save();
        ctx.globalAlpha = shoulderFlicker;
        ctx.translate(h + 16, -10);
        // Angle spike
        ctx.fillStyle = '#050507';
        ctx.beginPath();
        ctx.moveTo(10, -10); ctx.lineTo(14, -20); ctx.lineTo(4, -10);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-10, -10, 20, 16);
        ctx.fillStyle = '#030304'; ctx.fillRect(-8, -8, 16, 12);
        ctx.fillStyle = ultraLaserActive ? '#ef4444' : '#d946ef';
        ctx.shadowBlur = 8; ctx.shadowColor = '#d946ef';
        ctx.fillRect(-8, -8, 16, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -4, 12, 4);
        ctx.restore();

        // RIGHT OUTER SCREEN (Angled outwards)
        ctx.save();
        ctx.globalAlpha = shoulderFlicker;
        ctx.translate(h + 32, 2);
        ctx.rotate(0.2);
        ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-9, -9, 18, 15);
        ctx.fillStyle = '#030304'; ctx.fillRect(-7, -7, 14, 11);
        ctx.fillStyle = '#d946ef';
        ctx.shadowBlur = 6; ctx.shadowColor = '#d946ef';
        ctx.fillRect(-7, -7, 14, 11);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-5, -4, 10, 3);
        ctx.restore();
      }

    } else if (tower && tower.titanSkin === 'upgraded_titan_speakerman') {
      // ===== SKIN: UPGRADED TITAN SPEAKERMAN =====
      // Crimson/gold armor & subwoofer speaker arrays
      ctx.fillStyle = '#09090b'; // Jet black under-armor
      ctx.fillRect(-h - 6, -h - 2, size + 12, size + 4);

      // Crimson shoulders
      ctx.fillStyle = '#b91c1c'; // Deep Red
      ctx.fillRect(-h - 8, -h - 4, 10, size + 8);
      ctx.fillRect(h - 2, -h - 4, 10, size + 8);

      // Gold sound grilles
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-h - 6, -h + 6, 2, size - 12);
      ctx.fillRect(h + 4, -h + 6, 2, size - 12);

      // Speaker cylinders (Horns) flanking head
      ctx.fillStyle = '#1e1b4b'; // Deep dark casing
      ctx.beginPath();
      ctx.arc(-18, -h - 8, 7, 0, Math.PI * 2);
      ctx.arc(18, -h - 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444'; // Red center cone
      ctx.beginPath();
      ctx.arc(-18, -h - 8, 3, 0, Math.PI * 2);
      ctx.arc(18, -h - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Speaker Cones (Subwoofers) on Shoulders
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-h - 18, -12, 12, 16);
      ctx.fillRect(h + 6, -12, 12, 16);
      ctx.fillStyle = '#ef4444'; // Pulsing red center diaphragm
      const beatPulse = 1 + 0.15 * Math.sin(Date.now() / 60);
      ctx.beginPath();
      ctx.arc(-h - 12, -4, 4 * beatPulse, 0, Math.PI * 2);
      ctx.arc(h + 12, -4, 4 * beatPulse, 0, Math.PI * 2);
      ctx.fill();

      // Soundwave visual rings emitting from subwoofers
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-h - 12, -4, 12 * beatPulse, 0, Math.PI * 2);
      ctx.arc(h + 12, -4, 12 * beatPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Chest sound-core reactor (pulsing blazing yellow-red)
      const speakCore = 0.9 + 0.12 * Math.sin(Date.now() / 80);
      ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 4, 12 * speakCore, 0, Math.PI * 2);
      ctx.fill();

      // Speakerman Visor (glowing neon red line)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -h - 4, 20, 8);
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.fillRect(-8, -h - 2, 16, 3);

      // Jetpack flame
      const speakFlame = 15 + Math.sin(Date.now() / 30) * 8;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-6, h); ctx.lineTo(0, h + speakFlame); ctx.lineTo(6, h);
      ctx.closePath(); ctx.fill();

    } else if (tower && tower.titanSkin === 'upgraded_titan_cameraman') {
      // ===== SKIN: UPGRADED TITAN CAMERAMAN =====
      // Blue carbon fiber, giant center lens head, multiple shoulder tracking cameras
      ctx.fillStyle = '#0f172a'; // Carbon frame
      ctx.fillRect(-h - 6, -h - 2, size + 12, size + 4);

      // Steel blue shoulder armor
      ctx.fillStyle = '#2563eb'; 
      ctx.fillRect(-h - 8, -h - 4, 10, size + 8);
      ctx.fillRect(h - 2, -h - 4, 10, size + 8);

      // CCTV Camera Head Unit (Replaces face)
      ctx.save();
      ctx.translate(0, -h - 8);
      // Dark camera casing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, -12, 28, 18);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -12, 28, 18);
      // Giant glowing camera lens
      const lensPulse = 0.85 + 0.15 * Math.sin(Date.now() / 120);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, -3, 6 * lensPulse, 0, Math.PI * 2);
      ctx.fill();
      // White reflection dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, -5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shoulder security cameras (Left/Right)
      // Left shoulder CCTV
      ctx.save();
      ctx.translate(-h - 10, -10);
      ctx.rotate(-0.3 + Math.sin(Date.now() / 500) * 0.15); // Auto-panning CCTV!
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6, -10, 12, 10);
      ctx.fillStyle = '#ef4444'; // Red recording LED blinks
      if (Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillRect(-2, -6, 4, 4);
      }
      ctx.restore();

      // Right shoulder CCTV
      ctx.save();
      ctx.translate(h + 10, -10);
      ctx.rotate(0.3 - Math.sin(Date.now() / 500) * 0.15); // Auto-panning CCTV!
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-6, -10, 12, 10);
      ctx.fillStyle = '#ef4444';
      if (Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillRect(-2, -6, 4, 4);
      }
      ctx.restore();

      // Chest nuclear arc reactor (pulsing bright cyan / blue)
      const camCore = 0.85 + 0.15 * Math.sin(Date.now() / 100);
      ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#00d8ff';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 4, 11 * camCore, 0, Math.PI * 2);
      ctx.fill();
      // Core hazard circle
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 4, 11 * camCore, 0, Math.PI * 2);
      ctx.stroke();

      // Laser cannons or heavy shields
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-h - 14, -4, 8, 12);
      ctx.fillRect(h + 6, -4, 8, 12);

      // Jetpack flame (Cyan fire)
      const camFlame = 15 + Math.sin(Date.now() / 40) * 10;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(-6, h); ctx.lineTo(0, h + camFlame); ctx.lineTo(6, h);
      ctx.closePath(); ctx.fill();

    } else if (tower && tower.titanSkin === 'titan_drillman') {
      // ===== SKIN: TITAN DRILL MAN =====
      // Heavy industrial bronze armor, black hazard stripes, giant rotating copper head drill
      ctx.fillStyle = '#2d1e10'; // Deep dark bronze undercoat
      ctx.fillRect(-h - 6, -h - 2, size + 12, size + 4);

      // Hazard stripe pauldrons (Orange with black stripes)
      ctx.fillStyle = '#f97316'; // Warning orange
      ctx.fillRect(-h - 8, -h - 4, 10, size + 8);
      ctx.fillRect(h - 2, -h - 4, 10, size + 8);
      // Stripes
      ctx.strokeStyle = '#0f172a'; // Charcoal black stripes
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-h - 8, -h); ctx.lineTo(-h - 2, -h + 6);
      ctx.moveTo(-h - 8, -h + 12); ctx.lineTo(-h - 2, -h + 18);
      ctx.moveTo(h - 2, -h); ctx.lineTo(h + 4, -h + 6);
      ctx.moveTo(h - 2, -h + 12); ctx.lineTo(h + 4, -h + 18);
      ctx.stroke();

      // Rotating Drill Head!
      ctx.save();
      ctx.translate(0, -h - 12);
      const drillRotate = (Date.now() / 60) % (Math.PI * 2);
      ctx.rotate(drillRotate);
      // Sharp copper cone body
      ctx.fillStyle = '#ca8a04'; // Metallic brass/copper
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -22); // Drill tip
      ctx.lineTo(-12, 4);
      ctx.lineTo(12, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Drill spiral groove lines
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-2, -8, 0, -22);
      ctx.moveTo(9, 0); ctx.quadraticCurveTo(2, -8, 0, -22);
      ctx.stroke();
      ctx.restore();

      // Chest Blast Furnace Reactor (Burning bright orange lattice)
      const furnacePulse = 0.9 + 0.1 * Math.sin(Date.now() / 90);
      ctx.fillStyle = '#f97316';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 4, 12 * furnacePulse, 0, Math.PI * 2);
      ctx.fill();
      // Furnace protective bars (lattice structure)
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, 4); ctx.lineTo(9, 4);
      ctx.moveTo(-6, -2); ctx.lineTo(6, -2);
      ctx.moveTo(-6, 10); ctx.lineTo(6, 10);
      ctx.moveTo(0, -8); ctx.lineTo(0, 16);
      ctx.stroke();

      // Heavy mining drill arms / pistons
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-h - 16, -2, 10, 16);
      ctx.fillRect(h + 6, -2, 10, 16);

      // Heavy industrial hazard jet engine flames
      const furnaceFlame = 12 + Math.sin(Date.now() / 30) * 8;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-8, h); ctx.lineTo(-4, h + furnaceFlame); ctx.lineTo(0, h);
      ctx.moveTo(0, h); ctx.lineTo(4, h + furnaceFlame); ctx.lineTo(8, h);
      ctx.closePath(); ctx.fill();

    } else if (tower && tower.titanSkin === 'titan_clockman') {
      // ===== SKIN: TITAN CLOCK MAN =====
      // Gold and royal blue luxury casing, giant gear back halo, moving clock hands face
      
      // Giant Rotating Gear Halo on Back
      ctx.save();
      ctx.translate(0, -4);
      const gearRotate = (Date.now() / 240) % (Math.PI * 2);
      ctx.rotate(gearRotate);
      ctx.strokeStyle = '#eab308'; // Bright clockwork gold
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#eab308';
      // Circular rim of the halo gear
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      // Spikes/Teeth of the gear
      for (let tooth = 0; tooth < 12; tooth++) {
        const toothAngle = (tooth * Math.PI) / 6;
        ctx.save();
        ctx.rotate(toothAngle);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-3, -40, 6, 6);
        ctx.restore();
      }
      ctx.restore();

      // Clockman main body
      ctx.fillStyle = '#1e3a8a'; // Royal blue chassis
      ctx.fillRect(-h - 6, -h - 2, size + 12, size + 4);

      // Gold pauldrons
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-h - 8, -h - 4, 10, size + 8);
      ctx.fillRect(h - 2, -h - 4, 10, size + 8);

      // Clock Dial Head (Visor replaces head)
      ctx.save();
      ctx.translate(0, -h - 8);
      // Gold circular clock housing
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -3, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // White clock face dial
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -3, 8, 0, Math.PI * 2);
      ctx.fill();
      // Clock hands moving
      const clockHour = (Date.now() / 1500) % (Math.PI * 2);
      const clockMinute = (Date.now() / 250) % (Math.PI * 2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      // Hour hand
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(Math.cos(clockHour) * 4, -3 + Math.sin(clockHour) * 4);
      ctx.stroke();
      // Minute hand
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(Math.cos(clockMinute) * 6, -3 + Math.sin(clockMinute) * 6);
      ctx.stroke();
      ctx.restore();

      // Chest Clock reactor core (Glowing cyan chronological shield dial)
      const clockCore = 0.9 + 0.1 * Math.sin(Date.now() / 150);
      ctx.fillStyle = '#06b6d4'; // Chrono-blue glowing dial
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 4, 12 * clockCore, 0, Math.PI * 2);
      ctx.fill();
      // Gold clock hand details on chest core
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(0, 4 - 8);
      ctx.moveTo(0, 4);
      ctx.lineTo(4, 4 + 4);
      ctx.stroke();

      // Clockwork temporal wings (Golden wings expanding)
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      for (let wing = 0; wing < 4; wing++) {
        ctx.beginPath();
        ctx.moveTo(-h - 6, -10 + wing * 6);
        ctx.lineTo(-h - 22 - wing * 4, -20 + wing * 2);
        ctx.moveTo(h + 6, -10 + wing * 6);
        ctx.lineTo(h + 22 + wing * 4, -20 + wing * 2);
        ctx.stroke();
      }

      // Chronological energy booster flame
      const clockFlame = 15 + Math.sin(Date.now() / 30) * 10;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(-6, h); ctx.lineTo(0, h + clockFlame); ctx.lineTo(6, h);
      ctx.closePath(); ctx.fill();

    } else if (tower && tower.titanSkin === 'the_true_defender') {
      // ===== VARIANT: THE TRUE DEFENDER =====
      // UPGRADE 1: ARMOUR OF DEATH (4 Cannons + 4 Astro Toilet Claws)
      // UPGRADE 2: 4 OMNI-SHIELDS (Shields in all places)
      
      // 1. Astro Toilet Mechanical Hydraulic Arms & 4 Articulated Claws
      ctx.save();
      ctx.strokeStyle = '#065f46'; // Emerald dark titanium
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const clawTime = Date.now() / 200;
      const clawPinch = Math.sin(clawTime) * 6;

      // Claw 1: Top-Left Astro Claw
      ctx.beginPath();
      ctx.moveTo(-h, -h);
      ctx.lineTo(-h - 18, -h - 14);
      ctx.lineTo(-h - 28, -h - 26);
      ctx.stroke();
      // Pincers
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(-h - 28, -h - 26);
      ctx.lineTo(-h - 38, -h - 32 - clawPinch);
      ctx.lineTo(-h - 24, -h - 30);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-h - 28, -h - 26);
      ctx.lineTo(-h - 34 + clawPinch, -h - 18);
      ctx.lineTo(-h - 24, -h - 22);
      ctx.closePath();
      ctx.fill();

      // Claw 2: Top-Right Astro Claw
      ctx.beginPath();
      ctx.moveTo(h, -h);
      ctx.lineTo(h + 18, -h - 14);
      ctx.lineTo(h + 28, -h - 26);
      ctx.stroke();
      // Pincers
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(h + 28, -h - 26);
      ctx.lineTo(h + 38, -h - 32 - clawPinch);
      ctx.lineTo(h + 24, -h - 30);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(h + 28, -h - 26);
      ctx.lineTo(h + 34 - clawPinch, -h - 18);
      ctx.lineTo(h + 24, -h - 22);
      ctx.closePath();
      ctx.fill();

      // Claw 3: Bottom-Left Astro Claw
      ctx.beginPath();
      ctx.moveTo(-h, h);
      ctx.lineTo(-h - 18, h + 14);
      ctx.lineTo(-h - 28, h + 24);
      ctx.stroke();
      // Pincers
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(-h - 28, h + 24);
      ctx.lineTo(-h - 36, h + 30 + clawPinch);
      ctx.lineTo(-h - 22, h + 28);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-h - 28, h + 24);
      ctx.lineTo(-h - 32 + clawPinch, h + 16);
      ctx.lineTo(-h - 22, h + 20);
      ctx.closePath();
      ctx.fill();

      // Claw 4: Bottom-Right Astro Claw
      ctx.beginPath();
      ctx.moveTo(h, h);
      ctx.lineTo(h + 18, h + 14);
      ctx.lineTo(h + 28, h + 24);
      ctx.stroke();
      // Pincers
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(h + 28, h + 24);
      ctx.lineTo(h + 36, h + 30 + clawPinch);
      ctx.lineTo(h + 22, h + 28);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(h + 28, h + 24);
      ctx.lineTo(h + 32 - clawPinch, h + 16);
      ctx.lineTo(h + 22, h + 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Heavy Armour of Death Tungsten Plating
      ctx.fillStyle = '#064e3b'; // Deep emerald obsidian alloy
      ctx.strokeStyle = '#34d399'; // Vibrant emerald neon trim
      ctx.lineWidth = 2;
      ctx.fillRect(-h - 8, -h - 4, 10, size + 8);
      ctx.strokeRect(-h - 8, -h - 4, 10, size + 8);
      ctx.fillRect(h - 2, -h - 4, 10, size + 8);
      ctx.strokeRect(h - 2, -h - 4, 10, size + 8);

      // 3. 4 Heavy Laser Cannons (Quad Turrets)
      const cannonOffset = Math.sin(Date.now() / 80) * 2;
      // Cannon 1: Top-Left Cannon
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-h - 14, -h - 10, 8, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-h - 12, -h - 16 + cannonOffset, 4, 8);
      // Cannon 2: Top-Right Cannon
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(h + 6, -h - 10, 8, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(h + 8, -h - 16 + cannonOffset, 4, 8);
      // Cannon 3: Shoulder Left Cannon
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-h - 16, 2, 8, 18);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-h - 14, -4 + cannonOffset, 4, 8);
      // Cannon 4: Shoulder Right Cannon
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(h + 8, 2, 8, 18);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(h + 10, -4 + cannonOffset, 4, 8);

      // 4. Central Arc Reactor of Death (Emerald & Quantum Cyan)
      const truePulse = 0.9 + 0.15 * Math.sin(Date.now() / 120);
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 12 * truePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6 * truePulse, 0, Math.PI * 2);
      ctx.fill();

      // 5. True Defender Head Visor & Optics
      ctx.fillStyle = '#022c22';
      ctx.fillRect(-14, -h - 8, 28, 12);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -h - 8, 28, 12);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(-10, -h - 4, 20, 4);

      // 6. Dual Hyper-Drive Jet Flame Boosters
      const tdFlame = 18 + Math.sin(Date.now() / 30) * 10;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(-10, h + 4); ctx.lineTo(-6, h + 4 + tdFlame); ctx.lineTo(-2, h + 4);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, h + 4); ctx.lineTo(6, h + 4 + tdFlame); ctx.lineTo(10, h + 4);
      ctx.closePath(); ctx.fill();

    } else {
      // ===== SKIN: STANDARD TITAN =====
      // 1. Ultra Heavy Armored Pauldrons & Armor Plates
      ctx.fillStyle = '#1e293b'; // Slate graphite steel
      ctx.fillRect(-h - 6, -h - 2, 8, size + 4);
      ctx.fillRect(h - 2, -h - 2, 8, size + 4);

      // 2. Titanium Silver Alloy Armor Overlay
      ctx.fillStyle = '#64748b'; 
      ctx.fillRect(-h - 4, -h + 4, 4, size - 8);
      ctx.fillRect(h, -h + 4, 4, size - 8);

      // 3. Gold Energy Conduits
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-h - 2, -h + 8, 2, size - 16);
      ctx.fillRect(h, -h + 8, 2, size - 16);

      // 4. Chest Reactor Core (pulsing cyan / gold)
      const reactorPulse = 0.85 + 0.15 * Math.sin(Date.now() / 150);
      ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#00f0ff';
      ctx.shadowBlur = ultraLaserActive ? 25 : 15;
      ctx.shadowColor = ultraLaserActive ? '#ffffff' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 10 * reactorPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Heavy Armored Visor & Optics
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -h - 6, 24, 10);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(-8, -h - 4, 16, 4);

      // 6. Laser Cannons:
      if (isForm2) {
        // 2ND FORM: GREAT DEFENDER - Merged Central Laser Cannon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -h - 20, 24, 18);
        
        // Heavy Cannon Barrel
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-8, -h - 26, 16, 14);

        // Gold coils
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-9, -h - 18, 18, 3.5);
        ctx.fillRect(-9, -h - 12, 18, 3.5);

        // Glowing Cyan Muzzle
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#00f0ff';
        ctx.shadowBlur = ultraLaserActive ? 30 : 18;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.arc(0, -h - 26, 7, 0, Math.PI * 2);
        ctx.fill();

        if (ultraLaserActive) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -h - 26, 14 + Math.sin(Date.now() / 80) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // FORM 1: DUAL SIDE LASERS (2 Cannons shooting out from 2 sides)
        // Left Side Cannon
        ctx.save();
        ctx.translate(-h - 12, 0);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -8, 12, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-14, -4, 8, 8);
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath(); ctx.arc(-14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Right Side Cannon
        ctx.save();
        ctx.translate(h + 12, 0);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, -8, 12, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(6, -4, 8, 8);
        ctx.fillStyle = ultraLaserActive ? '#ffffff' : '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath(); ctx.arc(14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // --- TITAN RETRO TV BROADCAST ARRAY (Special Upgrade) ---
      if (tower && tower.titanTVArrayUpgrade) {
        // Draw 2 TV Screens on the side (left/right shoulder) and 1 in the middle
        
        // A. Center TV monitor (above reactor / face area)
        ctx.save();
        ctx.translate(0, -h - 14); // Raised above the reactor/face
        
        // CRT TV Cabinet (Chassis)
        ctx.fillStyle = '#1e293b'; // Slate dark housing
        ctx.fillRect(-15, -14, 30, 20);
        ctx.strokeStyle = '#3b82f6'; // Neon blue frame accent
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-15, -14, 30, 20);
        
        // Two small retro antenna spikes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-12, -22);
        ctx.moveTo(6, -14); ctx.lineTo(12, -22);
        ctx.stroke();
        
        // CRT screen glass area
        ctx.fillStyle = '#020617';
        ctx.fillRect(-11, -11, 22, 14);
        
        // Screen phosphorus simulation
        const screenCycle = Math.floor(Date.now() / 200) % 4;
        ctx.fillStyle = '#22c55e'; // Green phosphorus glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#22c55e';
        
        if (screenCycle === 0) {
          // Green smiley face :)
          ctx.fillRect(-5, -7, 2, 2);
          ctx.fillRect(3, -7, 2, 2);
          ctx.fillRect(-4, -2, 8, 2);
        } else if (screenCycle === 1) {
          // Green matrix style random binary noise
          for (let xOff = -9; xOff < 9; xOff += 3) {
            for (let yOff = -9; yOff < 3; yOff += 3) {
              if (Math.random() > 0.4) ctx.fillRect(xOff, yOff, 1.5, 1.5);
            }
          }
        } else if (screenCycle === 2) {
          // Warning grid or error state
          ctx.fillStyle = '#38bdf8'; // Cyan
          ctx.shadowColor = '#38bdf8';
          ctx.fillRect(-11, -7, 22, 1.5);
          ctx.fillRect(-11, -3, 22, 1.5);
          ctx.fillRect(-11, 1, 22, 1.5);
        } else {
          // Winking facial display
          ctx.fillRect(-5, -7, 2, 2);
          ctx.fillRect(2, -7, 3, 1.5); // Wink line
          ctx.fillRect(-4, -1, 8, 2);
        }
        ctx.restore();

        // B. Left TV Screen (shoulder unit)
        ctx.save();
        ctx.translate(-h - 14, -6);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -10, 20, 16);
        ctx.fillStyle = '#020617';
        ctx.fillRect(-8, -8, 16, 12);
        // Magenta glitch sweep scanline
        ctx.fillStyle = '#ec4899';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ec4899';
        ctx.fillRect(-8, -6 + ((Date.now() / 8) % 12), 16, 1.5);
        ctx.restore();

        // C. Right TV Screen (shoulder unit)
        ctx.save();
        ctx.translate(h + 14, -6);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-10, -10, 20, 16);
        ctx.fillStyle = '#020617';
        ctx.fillRect(-8, -8, 16, 12);
        // Yellow matrix scanline
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fbbf24';
        ctx.fillRect(-8, 6 - ((Date.now() / 8) % 12), 16, 1.5);
        ctx.restore();
      }

      // --- TITAN ARMOUR OF DEATH (4 Astro Claws + 4 Heavy Cannons) ---
      if (tower && (tower as any).titanArmourOfDeathUpgrade) {
        ctx.save();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        const clawTime = Date.now() / 200;
        const clawPinch = Math.sin(clawTime) * 5;

        // 4 Astro Claws
        for (const [cx, cy, angle] of [
          [-h, -h, -0.75 * Math.PI],
          [h, -h, -0.25 * Math.PI],
          [-h, h, 0.75 * Math.PI],
          [h, h, 0.25 * Math.PI],
        ]) {
          const armX = cx + Math.cos(angle) * 24;
          const armY = cy + Math.sin(angle) * 24;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(armX, armY);
          ctx.stroke();

          // Pincer jaws
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(armX, armY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(armX, armY);
          ctx.lineTo(armX + Math.cos(angle - 0.4) * (14 + clawPinch), armY + Math.sin(angle - 0.4) * (14 + clawPinch));
          ctx.lineTo(armX + Math.cos(angle) * 8, armY + Math.sin(angle) * 8);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(armX, armY);
          ctx.lineTo(armX + Math.cos(angle + 0.4) * (14 - clawPinch), armY + Math.sin(angle + 0.4) * (14 - clawPinch));
          ctx.lineTo(armX + Math.cos(angle) * 8, armY + Math.sin(angle) * 8);
          ctx.closePath();
          ctx.fill();
        }

        // 4 Heavy Cannons (Tungsten emerald turrets)
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        for (const [x, y] of [
          [-h - 12, -h + 2],
          [h + 4, -h + 2],
          [-h - 12, h - 16],
          [h + 4, h - 16],
        ]) {
          ctx.fillRect(x, y, 8, 14);
          ctx.strokeRect(x, y, 8, 14);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(x + 2, y - 4, 4, 6);
          ctx.fillStyle = '#065f46';
        }
        ctx.restore();
      }
    }

    ctx.restore();
  } else if (animalId === 'arcane_warper') {
    // ===== ARCANE WARPER (SUPREME ARCANE DEITY) WITH 5 CUSTOM SKINS =====
    const warperSkin = (tower && (tower as any).warperSkin) || 'standard';
    const isForm2 = !!(tower && (tower as any).warperSecondForm);
    const rot = (Date.now() / 500) % (Math.PI * 2);
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 150);

    ctx.save();

    if (warperSkin === 'void_lord') {
      // 🩸 ABYSSAL BLOOD LORD SKIN
      // 1. Dark demonic horns curving upwards
      ctx.fillStyle = '#450a0a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#dc2626';
      
      // Left horn
      ctx.beginPath();
      ctx.moveTo(-h + 2, -h);
      ctx.quadraticCurveTo(-h - 10, -h - 18, -h - 4, -h - 22);
      ctx.quadraticCurveTo(-h + 2, -h - 14, -h + 8, -h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right horn
      ctx.beginPath();
      ctx.moveTo(h - 2, -h);
      ctx.quadraticCurveTo(h + 10, -h - 18, h + 4, -h - 22);
      ctx.quadraticCurveTo(h - 2, -h - 14, h - 8, -h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Barbed Demonic Blood Wings
      const wingAngle = Math.sin(Date.now() / 180) * 0.18;
      // Left Wing
      ctx.save();
      ctx.translate(-h, -4);
      ctx.rotate(-wingAngle);
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, -20);
      ctx.lineTo(-18, -6);
      ctx.lineTo(-32, -4);
      ctx.lineTo(-20, 8);
      ctx.lineTo(-28, 18);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(h, -4);
      ctx.rotate(wingAngle);
      ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -20);
      ctx.lineTo(18, -6);
      ctx.lineTo(32, -4);
      ctx.lineTo(20, 8);
      ctx.lineTo(28, 18);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Orbiting Blood Soul Crystals
      for (let i = 0; i < (isForm2 ? 6 : 4); i++) {
        const ang = rot + (i * Math.PI * 2) / (isForm2 ? 6 : 4);
        const ox = Math.cos(ang) * (size * 1.05);
        const oy = Math.sin(ang) * (size * 1.05);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot * 2 + i);
        ctx.fillStyle = '#dc2626';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -5); ctx.lineTo(4, 0); ctx.lineTo(0, 5); ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }

    } else if (warperSkin === 'cyber_matrix') {
      // ⚡ CYBER CHRONO MATRIX SKIN
      // 1. High-Tech Cyber Matrix HUD Rings
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.95 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating holographic radar crosshairs
      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-h - 6, -h - 6, size + 12, size + 12);
      ctx.restore();

      // 2. Cyber Plasma Thruster Wings
      const wingFlap = Math.sin(Date.now() / 200) * 0.12;
      // Left Thruster Wing
      ctx.save();
      ctx.translate(-h - 2, 0);
      ctx.rotate(-wingFlap);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-22, -18);
      ctx.lineTo(-30, -6);
      ctx.lineTo(-18, 4);
      ctx.lineTo(-26, 14);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Neon exhaust bar
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-28, -8, 6, 14);
      ctx.restore();

      // Right Thruster Wing
      ctx.save();
      ctx.translate(h + 2, 0);
      ctx.rotate(wingFlap);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(22, -18);
      ctx.lineTo(30, -6);
      ctx.lineTo(18, 4);
      ctx.lineTo(26, 14);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Neon exhaust bar
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(22, -8, 6, 14);
      ctx.restore();

      // 3. Orbiting Nano Matrix Cubes
      for (let i = 0; i < (isForm2 ? 6 : 4); i++) {
        const ang = -rot + (i * Math.PI * 2) / (isForm2 ? 6 : 4);
        const ox = Math.cos(ang) * (size * 1.05);
        const oy = Math.sin(ang) * (size * 1.05);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f0ff';
        ctx.fillRect(-3, -3, 6, 6);
        ctx.strokeRect(-3, -3, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }

    } else if (warperSkin === 'celestial_archon') {
      // ☀️ CELESTIAL ARCHON (SACRED 24K GOLD) SKIN
      // 1. Divine Solar Crown Halo
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -h - 6, 12, 0, Math.PI * 2);
      ctx.stroke();
      
      // Solar rays
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8 + rot * 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 13, -h - 6 + Math.sin(a) * 13);
        ctx.lineTo(Math.cos(a) * 18, -h - 6 + Math.sin(a) * 18);
        ctx.stroke();
      }

      // 2. Seraphim Golden Feathered Wings
      const wingFlap = Math.sin(Date.now() / 240) * 0.16;
      // Left Wing
      ctx.save();
      ctx.translate(-h, -2);
      ctx.rotate(-wingFlap);
      const goldGrad = ctx.createLinearGradient(-35, -20, 0, 0);
      goldGrad.addColorStop(0, 'rgba(250, 204, 21, 0.95)');
      goldGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.8)');
      goldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
      ctx.fillStyle = goldGrad;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-15, -28, -40, -18, -38, -6);
      ctx.bezierCurveTo(-38, 8, -20, 16, 0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(h, -2);
      ctx.rotate(wingFlap);
      const goldGradR = ctx.createLinearGradient(35, -20, 0, 0);
      goldGradR.addColorStop(0, 'rgba(250, 204, 21, 0.95)');
      goldGradR.addColorStop(0.5, 'rgba(234, 179, 8, 0.8)');
      goldGradR.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
      ctx.fillStyle = goldGradR;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15, -28, 40, -18, 38, -6);
      ctx.bezierCurveTo(38, 8, 20, 16, 0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Orbiting Sacred Prisms
      for (let i = 0; i < (isForm2 ? 6 : 4); i++) {
        const ang = rot + (i * Math.PI * 2) / (isForm2 ? 6 : 4);
        const ox = Math.cos(ang) * (size * 1.1);
        const oy = Math.sin(ang) * (size * 1.1);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot * 2 + i);
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

    } else if (warperSkin === 'hypernova_eclipse') {
      // 🌋 HYPERNOVA ECLIPSE SKIN
      // 1. Blazing Coronal Fire Prominence Halo
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.92, 0, Math.PI * 2);
      ctx.stroke();

      // Solar flare prominence jets
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6 + rot;
        const flen = 16 + Math.sin(Date.now() / 100 + i) * 6;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (size * 0.9), Math.sin(a) * (size * 0.9));
        ctx.lineTo(Math.cos(a) * (size * 0.9 + flen), Math.sin(a) * (size * 0.9 + flen));
        ctx.stroke();
      }

      // 2. Blazing Magma Solar Flare Wings
      const wingFlap = Math.sin(Date.now() / 180) * 0.18;
      // Left Wing
      ctx.save();
      ctx.translate(-h, -2);
      ctx.rotate(-wingFlap);
      const magmaGrad = ctx.createLinearGradient(-35, -20, 0, 0);
      magmaGrad.addColorStop(0, 'rgba(234, 88, 12, 0.95)');
      magmaGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.85)');
      magmaGrad.addColorStop(1, 'rgba(254, 240, 138, 0.4)');
      ctx.fillStyle = magmaGrad;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, -22);
      ctx.lineTo(-18, -8);
      ctx.lineTo(-35, -6);
      ctx.lineTo(-22, 6);
      ctx.lineTo(-30, 16);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(h, -2);
      ctx.rotate(wingFlap);
      const magmaGradR = ctx.createLinearGradient(35, -20, 0, 0);
      magmaGradR.addColorStop(0, 'rgba(234, 88, 12, 0.95)');
      magmaGradR.addColorStop(0.5, 'rgba(220, 38, 38, 0.85)');
      magmaGradR.addColorStop(1, 'rgba(254, 240, 138, 0.4)');
      ctx.fillStyle = magmaGradR;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -22);
      ctx.lineTo(18, -8);
      ctx.lineTo(35, -6);
      ctx.lineTo(22, 6);
      ctx.lineTo(30, 16);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Orbiting Molten Fireballs
      for (let i = 0; i < (isForm2 ? 6 : 4); i++) {
        const ang = rot + (i * Math.PI * 2) / (isForm2 ? 6 : 4);
        const ox = Math.cos(ang) * (size * 1.05);
        const oy = Math.sin(ang) * (size * 1.05);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

    } else {
      // 🌌 COSMIC VOID (STANDARD) SKIN
      // 1. Dimensional Singularity Warp Halo
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#d946ef';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.9 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating sacred hypercube frame
      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-h - 4, -h - 4, size + 8, size + 8);
      ctx.restore();

      // 2. Cosmic Ethereal Rift Wings
      const wingFlap = Math.sin(Date.now() / 200) * 0.15;
      // Left Cosmic Wing
      ctx.save();
      ctx.translate(-h, -2);
      ctx.rotate(-wingFlap);
      const cosmicGrad = ctx.createLinearGradient(-35, -20, 0, 0);
      cosmicGrad.addColorStop(0, 'rgba(168, 85, 247, 0.95)');
      cosmicGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.8)');
      cosmicGrad.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
      ctx.fillStyle = cosmicGrad;
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-15, -25, -38, -18, -36, -6);
      ctx.bezierCurveTo(-36, 6, -20, 14, 0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Cosmic Wing
      ctx.save();
      ctx.translate(h, -2);
      ctx.rotate(wingFlap);
      const cosmicGradR = ctx.createLinearGradient(35, -20, 0, 0);
      cosmicGradR.addColorStop(0, 'rgba(168, 85, 247, 0.95)');
      cosmicGradR.addColorStop(0.5, 'rgba(217, 70, 239, 0.8)');
      cosmicGradR.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
      ctx.fillStyle = cosmicGradR;
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15, -25, 38, -18, 36, -6);
      ctx.bezierCurveTo(36, 6, 20, 14, 0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Orbiting Arcane Rift Crystals
      for (let i = 0; i < (isForm2 ? 6 : 4); i++) {
        const ang = rot + (i * Math.PI * 2) / (isForm2 ? 6 : 4);
        const ox = Math.cos(ang) * (size * 1.05);
        const oy = Math.sin(ang) * (size * 1.05);
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(rot * 2 + i);
        ctx.fillStyle = '#c084fc';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#e879f9';
        ctx.beginPath();
        ctx.moveTo(0, -5); ctx.lineTo(4, 0); ctx.lineTo(0, 5); ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // 7. Dynamic cyber/normal/celestial eyes & Warper Upgrades
  if (animalId === 'arcane_warper') {
    const warperSkin = (tower && (tower as any).warperSkin) || 'standard';
    const hasBladeUpgrade = !!(tower && (tower as any).warperBladeUpgrade);
    const hasArmouredTitan = !!(tower && (tower as any).warperArmouredTitanUpgrade);

    let eyeCoreColor = '#e879f9';
    let eyeGlowColor = '#a855f7';
    let eyeCenterColor = '#ffffff';

    if (warperSkin === 'void_lord') {
      eyeCoreColor = '#ef4444';
      eyeGlowColor = '#dc2626';
      eyeCenterColor = '#fca5a5';
    } else if (warperSkin === 'cyber_matrix') {
      eyeCoreColor = '#00f0ff';
      eyeGlowColor = '#06b6d4';
      eyeCenterColor = '#ffffff';
    } else if (warperSkin === 'celestial_archon') {
      eyeCoreColor = '#fde047';
      eyeGlowColor = '#eab308';
      eyeCenterColor = '#ffffff';
    } else if (warperSkin === 'hypernova_eclipse') {
      eyeCoreColor = '#f97316';
      eyeGlowColor = '#ea580c';
      eyeCenterColor = '#fef08a';
    }

    // --- UPGRADE 1: ASTRAL BLADES (DUAL ENERGY SCYTHES / BLADES) ---
    if (hasBladeUpgrade) {
      const bladeOsc = Math.sin(Date.now() / 150) * 0.1;
      
      // Left Astral Blade
      ctx.save();
      ctx.translate(-h - 2, 2);
      ctx.rotate(-0.4 + bladeOsc);
      const bladeGradL = ctx.createLinearGradient(0, 0, -26, 20);
      bladeGradL.addColorStop(0, '#ffffff');
      bladeGradL.addColorStop(0.3, eyeCoreColor);
      bladeGradL.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bladeGradL;
      ctx.strokeStyle = eyeGlowColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = eyeCoreColor;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(-24, 18);
      ctx.quadraticCurveTo(-14, 10, 0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right Astral Blade
      ctx.save();
      ctx.translate(h + 2, 2);
      ctx.rotate(0.4 - bladeOsc);
      const bladeGradR = ctx.createLinearGradient(0, 0, 26, 20);
      bladeGradR.addColorStop(0, '#ffffff');
      bladeGradR.addColorStop(0.3, eyeCoreColor);
      bladeGradR.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bladeGradR;
      ctx.strokeStyle = eyeGlowColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = eyeCoreColor;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(24, 18);
      ctx.quadraticCurveTo(14, 10, 0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // --- UPGRADE 2: ARMOURED TITAN MECHA ARMOUR & 2 MORE LASER CANNONS ---
    if (hasArmouredTitan) {
      // 1. Heavy Mecha Shoulder Pauldrons
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#0284c7';
      
      // Left Pauldron
      ctx.beginPath();
      ctx.rect(-h - 9, -h + 2, 9, 14);
      ctx.fill();
      ctx.stroke();
      
      // Right Pauldron
      ctx.beginPath();
      ctx.rect(h, -h + 2, 9, 14);
      ctx.fill();
      ctx.stroke();

      // Pauldron Energy Vent Lines
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-h - 7, -h + 5, 5, 2);
      ctx.fillRect(-h - 7, -h + 9, 5, 2);
      ctx.fillRect(h + 2, -h + 5, 5, 2);
      ctx.fillRect(h + 2, -h + 9, 5, 2);

      // 2. Dual Armoured Laser Cannon Pods (Mounted on Top Shoulders)
      // Left Cannon
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.fillRect(-h - 8, -h - 8, 7, 9);
      ctx.strokeRect(-h - 8, -h - 8, 7, 9);
      // Left Muzzle
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(-h - 7, -h - 11, 5, 3);

      // Right Cannon
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.fillRect(h + 1, -h - 8, 7, 9);
      ctx.strokeRect(h + 1, -h - 8, 7, 9);
      // Right Muzzle
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(h + 2, -h - 11, 5, 3);

      // 3. Reinforced Mecha Chest Plate
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-h + 3, -h + 4, size - 6, size - 8);
    }

    ctx.save();
    ctx.translate(h / 2, 0); // Front facing face

    // Outer Singularity Eye Core
    ctx.fillStyle = eyeCoreColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = eyeGlowColor;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inner White-hot photon center
    ctx.fillStyle = eyeCenterColor;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (animalId === 'capybara') {
    // ===== 🍊 CAPYBARA (THE CHILLFUL) =====
    const rot = (Date.now() / 800) % (Math.PI * 2);
    const breathe = Math.sin(Date.now() / 400) * 1.5;
    
    ctx.save();
    
    // 1. Tranquil Zen Lime/Emerald Aura ring
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#a3e635';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.85 + breathe, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Soft spinning bamboo leaf particles
    for (let i = 0; i < 4; i++) {
      const ang = rot + (i * Math.PI / 2);
      const px = Math.cos(ang) * (size * 1.05);
      const py = Math.sin(ang) * (size * 1.05);
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.ellipse(px, py, 3.5, 1.8, ang, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Capybara stout head overlay with warm authentic brown fur
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-h + 2, -h + 2, size - 4, size - 4);

    // 4. Cute blunt snout
    ctx.fillStyle = '#5c2b09';
    ctx.fillRect(-h + 4, h - 8, size - 8, 7);
    // Nostrils
    ctx.fillStyle = '#1c0d02';
    ctx.fillRect(-4, h - 5, 2.5, 2.5);
    ctx.fillRect(1.5, h - 5, 2.5, 2.5);

    // 5. Peaceful sleepy zen eyes (- -)
    ctx.strokeStyle = '#1c0d02';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-h + 5, -2);
    ctx.lineTo(-h + 11, -2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(h - 11, -2);
    ctx.lineTo(h - 5, -2);
    ctx.stroke();

    // 6. Capybara Rounded Ears
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-h + 2, -h + 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(h - 2, -h + 1, 4, 0, Math.PI * 2);
    ctx.fill();

    // 7. Signature Yuzu / Orange on Head (🍊)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, -h - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    // Tiny green leaf on the yuzu
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(3, -h - 10, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (animalId === 'all_seeing_overseer') {
    const pulseRadius = 5 + Math.sin(Date.now() / 200) * 1.0;
    ctx.save();
    ctx.translate(h / 2, 0); // Move center to front facing side
    
    // Outer halo
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = pulseRadius * 2;
    ctx.shadowColor = '#00ffcc';
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Scanner crosshairs
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.55)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(-pulseRadius - 4, 0); ctx.lineTo(pulseRadius + 4, 0);
    ctx.moveTo(0, -pulseRadius - 4); ctx.lineTo(0, pulseRadius + 4);
    ctx.stroke();

    // Glowing energy core pupillary sphere
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (isMythicOrSecret || animalId === 'celestial_pegasus' || animalId === 'celestial_kitsune') {
    ctx.fillStyle = (animalId === 'mecha_rex' || animalId === 'cthulhu' || animalId === 'celestial_pegasus') ? '#22d3ee' : (animalId === 'celestial_kitsune' ? '#fda4af' : '#facc15');
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(2, -6, 4, 4);
    ctx.fillRect(2, 2, 4, 4);
  } else {
    ctx.fillStyle = 'white';
    ctx.fillRect(1, -6, 3, 3);
    ctx.fillRect(1, 3, 3, 3);
    ctx.fillStyle = 'black';
    ctx.fillRect(2, -5, 2, 1);
    ctx.fillRect(2, 4, 2, 1);
  }

  // 8. Pinnacle Transcendence grand cosmetic upgrades: Changing the unit appearance completely!
  if (isPinnacle) {
    ctx.save();
    
    // Spinning glowing solar halo above the cube unit
    const rotationAng = (Date.now() / 450) % (Math.PI * 2);
    ctx.strokeStyle = '#facc15'; // blazing gold-yellow
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fbbf24';
    
    ctx.beginPath();
    ctx.ellipse(0, -h - 8, size * 0.45, size * 0.15, rotationAng, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred geometric base runic ring beneath the shadow
    const basePulse = 1 + Math.sin(Date.now() / 200) * 0.1;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, h + 3, size * 0.65 * basePulse, 0, Math.PI * 2);
    ctx.stroke();
    
    // Rotating stardust orbits around the runic ring
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 4; i++) {
      const orbAngle = rotationAng + (i * Math.PI / 2);
      const kx = Math.cos(orbAngle) * size * 0.65 * basePulse;
      const ky = h + 3 + Math.sin(orbAngle) * size * 0.3 * basePulse;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Majestic shimmering solar wings
    const isAlreadyBlackholeDwarf = animalId === 'blackhole_dwarf';
    if (!isAlreadyBlackholeDwarf) {
      const wingFlap = Math.sin(Date.now() / 180) * 0.2;
      
      // LEFT TRANSFINITE wing
      ctx.save();
      ctx.translate(-h, -2);
      ctx.rotate(-wingFlap - 0.2);
      const leftGrad = ctx.createLinearGradient(-25, -15, 0, 0);
      leftGrad.addColorStop(0, 'rgba(245, 158, 11, 0.95)'); 
      leftGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.7)'); 
      leftGrad.addColorStop(1, 'rgba(251, 243, 219, 0.15)'); 
      ctx.fillStyle = leftGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-12, -18, -28, -12, -28, -5);
      ctx.bezierCurveTo(-28, 2, -16, 6, 0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // RIGHT TRANSFINITE wing
      ctx.save();
      ctx.translate(h, -2);
      ctx.rotate(wingFlap + 0.2);
      const rightGrad = ctx.createLinearGradient(25, -15, 0, 0);
      rightGrad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
      rightGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.7)');
      rightGrad.addColorStop(1, 'rgba(251, 243, 219, 0.15)');
      ctx.fillStyle = rightGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(12, -18, 28, -12, 28, -5);
      ctx.bezierCurveTo(28, 2, 16, 6, 0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Absolute crowning star above the head
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -h - size * 0.45, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

interface GameCanvasProps {
  towers: TowerInstance[];
  enemies: EnemyInstance[];
  projectiles: Projectile[];
  skillEffects: SkillEffect[];
  path: { x: number; y: number }[];
  onCanvasClick: (x: number, y: number) => void;
  onTowerClick?: (towerId: string) => void;
  selectedTowerId: string | null;
  selectedDeployAnimal?: Animal | null;
  currentStage?: 'default' | 'jungle' | 'savanna' | 'prehistoric' | 'dimension_cosmic' | 'dimension_abyss';
  isWaveActive?: boolean;
  disableVFX?: boolean;
  isUltraBoss?: boolean;
  elementalHazards?: ElementalHazardZone[];
  equippedRelicIds?: string[];
  tacticalMode?: boolean;
  onToggleTacticalMode?: (enabled: boolean) => void;
  showGrid?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  towers, 
  enemies, 
  projectiles, 
  skillEffects,
  path,
  onCanvasClick,
  onTowerClick,
  selectedTowerId,
  selectedDeployAnimal = null,
  currentStage = 'default',
  isWaveActive = false,
  disableVFX = false,
  isUltraBoss = false,
  elementalHazards = [],
  equippedRelicIds = [],
  tacticalMode,
  onToggleTacticalMode,
  showGrid = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spawnTimesRef = useRef<Map<string, number>>(new Map());
  const exitingTowersRef = useRef<{ tower: TowerInstance; removedAt: number }[]>([]);
  const prevTowersRef = useRef<TowerInstance[]>([]);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Tactical Mode state with local persistence fallback
  const [internalTacticalMode, setInternalTacticalMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('primal_tactical_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  const isTacticalActive = tacticalMode !== undefined ? tacticalMode : internalTacticalMode;

  const toggleTacticalMode = useCallback(() => {
    const nextVal = !isTacticalActive;
    setInternalTacticalMode(nextVal);
    try {
      localStorage.setItem('primal_tactical_mode', String(nextVal));
    } catch {}
    if (onToggleTacticalMode) {
      onToggleTacticalMode(nextVal);
    }
  }, [isTacticalActive, onToggleTacticalMode]);

  // Global hotkey 'T' / 't' for instant Tactical Mode toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 't' || e.key === 'T') {
        toggleTacticalMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTacticalMode]);

  // Precompute / memoize Lane Efficiency Heatmap
  const heatmapData = useMemo(() => {
    if (!isTacticalActive) return null;
    return computeLaneEfficiencyHeatmap(path, towers, selectedDeployAnimal);
  }, [isTacticalActive, path, towers, selectedDeployAnimal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let originalCtx = canvas.getContext('2d');
    if (!originalCtx) return;

    const now = Date.now();
    const rTime = now;

    // 1. Detect newly placed towers (to set spawn times)
    towers.forEach(t => {
      if (!spawnTimesRef.current.has(t.id)) {
        spawnTimesRef.current.set(t.id, now);
      }
    });

    // 2. Detect removed towers (to add to exiting towers list)
    const currentTowerIds = new Set(towers.map(t => t.id));
    prevTowersRef.current.forEach(prevT => {
      if (!currentTowerIds.has(prevT.id)) {
        const alreadyExiting = exitingTowersRef.current.some(item => item.tower.id === prevT.id);
        if (!alreadyExiting) {
          exitingTowersRef.current.push({
            tower: prevT,
            removedAt: now
          });
        }
      }
    });

    // Clean up expired spawn times for towers that no longer exist and aren't exiting
    const exitingIds = new Set(exitingTowersRef.current.map(item => item.tower.id));
    for (const id of spawnTimesRef.current.keys()) {
      if (!currentTowerIds.has(id) && !exitingIds.has(id)) {
        spawnTimesRef.current.delete(id);
      }
    }

    // Clean up exiting towers that have finished their animation
    const EXIT_DURATION = 350; // 350ms exit animation
    exitingTowersRef.current = exitingTowersRef.current.filter(item => {
      return now - item.removedAt < EXIT_DURATION;
    });

    // Update previous towers list
    prevTowersRef.current = towers;

    // Direct hardware-accelerated context (bypasses Proxy overhead for 100% native JIT speed on V8 and WebKit)
    const ctx = originalCtx;
    const isMobile = typeof navigator !== 'undefined' && (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768));

    // Reset standard baseline context parameters
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
    ctx.imageSmoothingEnabled = true;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Multiverse Watcher / Grid Shake Intensity Engine
    const hasGridShake = skillEffects.some(eff => (eff as any).shakeGrid || eff.type === 'titan_multiverse_blast');
    let shakeX = 0;
    let shakeY = 0;
    if (hasGridShake) {
      const shakeMag = 6;
      shakeX = (Math.random() - 0.5) * shakeMag * 2;
      shakeY = (Math.random() - 0.5) * shakeMag * 2;
    }

    ctx.save();
    if (hasGridShake) {
      ctx.translate(shakeX, shakeY);
    }

    // Stage backgrounds & paths styles
    let bgFill = '#020617'; 
    let pathColor = '#1e293b';
    let pathGlowColor = 'rgba(34,197,94,0.1)';
    
    if (currentStage === 'jungle') {
      bgFill = '#031b0c'; // Emerald forest dark canvas
      pathColor = '#14532d'; // Forest-900 green
      pathGlowColor = 'rgba(74, 222, 128, 0.15)';
    } else if (currentStage === 'savanna') {
      bgFill = '#1c1003'; // Warm dirt clay canvas
      pathColor = '#78350f'; // Amber-900
      pathGlowColor = 'rgba(251, 191, 36, 0.15)';
    } else if (currentStage === 'prehistoric') {
      bgFill = '#120502'; // Intense obsidian dark canvas
      pathColor = '#450a0a'; // Red-950
      pathGlowColor = 'rgba(239, 68, 68, 0.2)';
    } else if (currentStage === 'dimension_cosmic') {
      bgFill = '#07031e'; // Astral celestial deep space
      pathColor = '#3b0764'; // Purple-950
      pathGlowColor = 'rgba(168, 85, 247, 0.3)';
    } else if (currentStage === 'dimension_abyss') {
      bgFill = '#090008'; // Abyssal Void dark matter canvas
      pathColor = '#4c0519'; // Rose-950 / Dark Violet
      pathGlowColor = 'rgba(244, 63, 94, 0.3)';
    }

    // Draw Background
    ctx.fillStyle = bgFill; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ==========================================
    // TACTICAL MODE OVERLAY & EFFICIENCY HEATMAP
    // ==========================================
    if (isTacticalActive && heatmapData) {
      // 1. High-Tech Coordinate Grid Lines
      // Sub-grid 20px
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Major grid 40px with neon cyan tint
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Crosshair Reticles at intersections
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1;
      for (let x = 40; x < CANVAS_WIDTH; x += 40) {
        for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
          ctx.beginPath();
          ctx.moveTo(x - 3, y);
          ctx.lineTo(x + 3, y);
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x, y + 3);
          ctx.stroke();
        }
      }

      // 2. Alphanumeric Border Coordinate Labels (A..T along X, 01..15 along Y)
      const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      ctx.font = 'bold 8.5px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top & Bottom Column Headers
      for (let gx = 0; gx < 20; gx++) {
        const cx = gx * 40 + 20;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.fillText(colLetters[gx], cx, 8);
        ctx.fillText(colLetters[gx], cx, CANVAS_HEIGHT - 8);
      }

      // Left & Right Row Headers
      for (let gy = 0; gy < 15; gy++) {
        const cy = gy * 40 + 20;
        const rowStr = String(gy + 1).padStart(2, '0');
        ctx.fillStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.fillText(rowStr, 9, cy);
        ctx.fillText(rowStr, CANVAS_WIDTH - 9, cy);
      }

      // 3. Lane Efficiency Heatmap Cells
      const pulseVal = Math.sin(now / 220); // -1..1
      const apexGlow = 0.5 + pulseVal * 0.35; // 0.15..0.85

      for (const cell of heatmapData.cells) {
        const x = cell.gx * 40;
        const y = cell.gy * 40;

        if (cell.isRoadway) {
          // Roadway lane highlight
          ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
          ctx.fillRect(x + 1, y + 1, 38, 38);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.22)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, 36, 36);

          ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.font = 'bold 6.5px ui-monospace, monospace';
          ctx.fillText('LANE', cell.cx, cell.cy);
          continue;
        }

        if (cell.isOccupied) {
          // Unit occupied indicator
          ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
          ctx.fillRect(x + 1, y + 1, 38, 38);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, 34, 34);

          ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';
          ctx.font = 'bold 7px ui-monospace, monospace';
          ctx.fillText('UNIT', cell.cx, cell.cy);
          continue;
        }

        // Valid ground heatmap coloring
        if (cell.efficiency >= 18) {
          let fillCol = 'rgba(99, 102, 241, 0.06)';
          let strokeCol = 'rgba(129, 140, 248, 0.18)';
          let textCol = 'rgba(199, 210, 254, 0.7)';
          let badgeText = `${cell.efficiency}%`;

          if (cell.tier === 'S') {
            fillCol = `rgba(245, 158, 11, ${0.22 + apexGlow * 0.12})`;
            strokeCol = `rgba(251, 191, 36, ${0.65 + apexGlow * 0.25})`;
            textCol = '#fef08a';
            badgeText = `S • ${cell.efficiency}%`;
          } else if (cell.tier === 'A') {
            fillCol = 'rgba(16, 185, 129, 0.20)';
            strokeCol = 'rgba(52, 211, 153, 0.60)';
            textCol = '#a7f3d0';
            badgeText = `A • ${cell.efficiency}%`;
          } else if (cell.tier === 'B') {
            fillCol = 'rgba(6, 182, 212, 0.12)';
            strokeCol = 'rgba(34, 211, 238, 0.35)';
            textCol = '#bae6fd';
            badgeText = `${cell.efficiency}%`;
          }

          // Draw cell background
          ctx.fillStyle = fillCol;
          ctx.fillRect(x + 2, y + 2, 36, 36);

          // Draw border frame
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = cell.tier === 'S' ? 1.5 : 1;
          ctx.strokeRect(x + 3, y + 3, 34, 34);

          // Corner tech brackets for S & A tiers
          if (cell.tier === 'S' || cell.tier === 'A') {
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = 1.8;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(x + 2, y + 6);
            ctx.lineTo(x + 2, y + 2);
            ctx.lineTo(x + 6, y + 2);
            ctx.stroke();
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(x + 38, y + 34);
            ctx.lineTo(x + 38, y + 38);
            ctx.lineTo(x + 34, y + 38);
            ctx.stroke();
          }

          // Apex Chokepoint Diamond Badge
          if (cell.isApex) {
            ctx.save();
            ctx.strokeStyle = `rgba(253, 224, 71, ${0.7 + apexGlow * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cell.cx, cell.cy - 14);
            ctx.lineTo(cell.cx + 14, cell.cy);
            ctx.lineTo(cell.cx, cell.cy + 14);
            ctx.lineTo(cell.cx - 14, cell.cy);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 7px ui-monospace, monospace';
            ctx.fillText('★APEX', cell.cx, cell.cy - 4);
            ctx.restore();

            // Percentage under apex
            ctx.fillStyle = textCol;
            ctx.font = 'bold 7.5px ui-monospace, monospace';
            ctx.fillText(`${cell.efficiency}%`, cell.cx, cell.cy + 7);
          } else {
            // Standard badge text
            ctx.fillStyle = textCol;
            ctx.font = cell.tier === 'S' ? 'bold 8px ui-monospace, monospace' : '7.5px ui-monospace, monospace';
            ctx.fillText(badgeText, cell.cx, cell.cy);
          }
        }
      }

      // 4. Sweeping Cyber Radar Line
      const scanX = ((now / 18) % (CANVAS_WIDTH + 260)) - 130;
      const radarGrad = ctx.createLinearGradient(scanX - 60, 0, scanX + 2, 0);
      radarGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      radarGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.08)');
      radarGrad.addColorStop(1, 'rgba(34, 211, 238, 0.35)');

      ctx.fillStyle = radarGrad;
      ctx.fillRect(scanX - 60, 0, 62, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(103, 232, 249, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scanX + 2, 0);
      ctx.lineTo(scanX + 2, CANVAS_HEIGHT);
      ctx.stroke();

      // Radar status banner at bottom right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(CANVAS_WIDTH - 195, CANVAS_HEIGHT - 22, 185, 18);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(CANVAS_WIDTH - 195, CANVAS_HEIGHT - 22, 185, 18);

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 7.5px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`🛰️ TACTICAL RADAR • APEX: ${heatmapData.apexCells.length} • S-TIER: ${heatmapData.sCount}`, CANVAS_WIDTH - 190, CANVAS_HEIGHT - 10);
      ctx.textAlign = 'center';
    } else if (showGrid) {
      // Standard subtle grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }

    // Draw Stage Environment Elements BEFORE the paths/units
    if (currentStage === 'jungle') {
      // Draw static poison swamps
      const poisonSwamps = [
        { x: 300, y: 300, r: 80 },
        { x: 500, y: 450, r: 80 }
      ];
      poisonSwamps.forEach(swamp => {
        const grad = ctx.createRadialGradient(swamp.x, swamp.y, 10, swamp.x, swamp.y, swamp.r);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.35)'); // toxic purple core
        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.18)'); // radioactive emerald ring
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(swamp.x, swamp.y, swamp.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubbling poison bubbles
        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
        const timeOffset = Date.now() / 1000;
        for (let b = 0; b < 4; b++) {
          const bx = swamp.x + Math.cos(timeOffset * 1.2 + b * 2) * (swamp.r * 0.45);
          const by = swamp.y + Math.sin(timeOffset * 0.9 + b * 2.5) * (swamp.r * 0.45);
          ctx.beginPath();
          ctx.arc(bx, by, 2.5 + (Date.now() % (400 + b * 100)) / 130, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (currentStage === 'savanna') {
      // Wind swirls
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.04)';
      ctx.lineWidth = 2;
      const windSwirl = (Date.now() / 6) % CANVAS_WIDTH;
      for (let w = 0; w < 3; w++) {
        const wx = (w * 300 + windSwirl) % CANVAS_WIDTH;
        const wy = 120 + w * 160;
        ctx.beginPath();
        ctx.arc(wx, wy, 50, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }
    } else if (currentStage === 'prehistoric') {
      // Volcanic vents mountains
      const volcanoes = [{ x: 250, y: 500 }, { x: 550, y: 100 }];
      volcanoes.forEach(vol => {
        // draw mountain peak shape
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.moveTo(vol.x - 35, vol.y + 25);
        ctx.lineTo(vol.x, vol.y - 25);
        ctx.lineTo(vol.x + 35, vol.y + 25);
        ctx.closePath();
        ctx.fill();
        // orange lava crest/rim
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(vol.x - 10, vol.y - 12);
        ctx.lineTo(vol.x, vol.y - 28);
        ctx.lineTo(vol.x + 10, vol.y - 12);
        ctx.lineTo(vol.x, vol.y - 8);
        ctx.closePath();
        ctx.fill();
        
        // Volcano heat aura pulsing
        ctx.fillStyle = 'rgba(249, 115, 22, 0.04)';
        ctx.beginPath();
        ctx.arc(vol.x, vol.y, 60 + Math.sin(Date.now() / 250) * 12, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (currentStage === 'dimension_cosmic') {
      // Cosmic Celestial Dimension - Floating nebulas & glowing stars
      const time = Date.now() / 1000;
      
      // Central Astral Galaxy Nexus
      const galaxyGrad = ctx.createRadialGradient(450, 300, 10, 450, 300, 160);
      galaxyGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      galaxyGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
      galaxyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = galaxyGrad;
      ctx.beginPath();
      ctx.arc(450, 300, 160, 0, Math.PI * 2);
      ctx.fill();

      // Astral orbit rings
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(450, 300, 140, 50, time * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.beginPath();
      ctx.ellipse(450, 300, 90, 35, -time * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Twinkling Celestial Stars
      const starSeeds = [
        { x: 120, y: 80, r: 2.2, phase: 0 },
        { x: 280, y: 120, r: 1.8, phase: 1.5 },
        { x: 680, y: 90, r: 2.5, phase: 3.0 },
        { x: 740, y: 220, r: 1.5, phase: 4.2 },
        { x: 180, y: 360, r: 2.0, phase: 2.1 },
        { x: 360, y: 480, r: 2.2, phase: 0.8 },
        { x: 620, y: 480, r: 1.9, phase: 5.1 },
        { x: 50, y: 520, r: 2.4, phase: 1.9 },
      ];
      starSeeds.forEach(star => {
        const twinkle = (Math.sin(time * 3 + star.phase) + 1) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Star cross glow
        if (twinkle > 0.6) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${twinkle * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(star.x - 6, star.y);
          ctx.lineTo(star.x + 6, star.y);
          ctx.moveTo(star.x, star.y - 6);
          ctx.lineTo(star.x, star.y + 6);
          ctx.stroke();
        }
      });
    } else if (currentStage === 'dimension_abyss') {
      // Abyssal Nether Dimension - Dark matter vortex & crimson singularities
      const time = Date.now() / 1000;

      // Dark Matter Singularity Center
      const abyssGrad = ctx.createRadialGradient(400, 300, 5, 400, 300, 180);
      abyssGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      abyssGrad.addColorStop(0.3, 'rgba(225, 29, 72, 0.25)'); // Crimson event horizon
      abyssGrad.addColorStop(0.7, 'rgba(126, 34, 206, 0.15)'); // Void purple
      abyssGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = abyssGrad;
      ctx.beginPath();
      ctx.arc(400, 300, 180, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk distortion waves
      for (let ring = 1; ring <= 3; ring++) {
        const ringRad = 40 + ring * 35;
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.12 / ring})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(400, 300, ringRad, ringRad * 0.45, time * 0.5 * (ring % 2 === 0 ? -1 : 1), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Floating Void Crystals / Soul Shards
      const crystals = [
        { x: 220, y: 180, rot: 0.4 },
        { x: 580, y: 220, rot: -0.6 },
        { x: 300, y: 460, rot: 0.8 },
        { x: 520, y: 480, rot: -0.3 }
      ];
      crystals.forEach((c, idx) => {
        const cy = c.y + Math.sin(time * 1.5 + idx) * 8;
        ctx.save();
        ctx.translate(c.x, cy);
        ctx.rotate(c.rot + Math.sin(time + idx) * 0.1);
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 16);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(253, 164, 175, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw Path if coordinates available or Raid Grid if Ultra Boss Mode
    if (isUltraBoss) {
      const time = Date.now() / 1000;
      // Floor grid mesh
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x <= CANVAS_WIDTH; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Central Ultra Raid Boss Platform Target Zone at (400, 300)
      ctx.save();
      ctx.translate(400, 300);

      // Outer Runic Target Ring
      ctx.rotate(time * 0.3);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.stroke();

      // Counter-rotating Inner Ring
      ctx.rotate(-time * 0.6);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 10, 5, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing Center Platform Floor
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (path && path.length > 0) {
      ctx.strokeStyle = pathColor; 
      ctx.lineWidth = 44;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Path Glow
      ctx.strokeStyle = pathGlowColor; 
      ctx.lineWidth = 48;
      ctx.stroke();

      // --- DRAW ELEMENTAL HAZARD OVERLAYS ON PATH ---
      if (elementalHazards && elementalHazards.length > 0 && !isUltraBoss) {
        const time = now / 1000;
        elementalHazards.forEach((zone, zIdx) => {
          const dx = zone.endX - zone.startX;
          const dy = zone.endY - zone.startY;
          const segLen = Math.hypot(dx, dy);
          if (segLen <= 0) return;

          const midX = (zone.startX + zone.endX) / 2;
          const midY = (zone.startY + zone.endY) / 2;

          ctx.save();

          // 1. Ambient Hazard Lane Aura Glow
          ctx.strokeStyle = zone.glowColor || 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 58;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(zone.startX, zone.startY);
          ctx.lineTo(zone.endX, zone.endY);
          ctx.stroke();

          // 2. High-Tech Animated Energy Flow Stream
          const flowOffset = (now * 0.04) % 24;
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = 18;
          ctx.lineCap = 'round';
          ctx.setLineDash([14, 10]);
          ctx.lineDashOffset = -flowOffset;
          ctx.beginPath();
          ctx.moveTo(zone.startX, zone.startY);
          ctx.lineTo(zone.endX, zone.endY);
          ctx.stroke();
          ctx.setLineDash([]);

          // 3. Hazard Influence Boundary Field (Faint pulsating zone border)
          const pulse = Math.sin(time * 3 + zIdx) * 0.08 + 0.12;
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = pulse;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = (now * 0.02) % 14;

          const normX = -dy / segLen;
          const normY = dx / segLen;
          const r = zone.hazardRadius || 85;

          ctx.beginPath();
          ctx.moveTo(zone.startX + normX * r, zone.startY + normY * r);
          ctx.lineTo(zone.endX + normX * r, zone.endY + normY * r);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(zone.startX - normX * r, zone.startY - normY * r);
          ctx.lineTo(zone.endX - normX * r, zone.endY - normY * r);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1.0;

          // 4. Start & End Runic Boundary Nodes
          [{ x: zone.startX, y: zone.startY }, { x: zone.endX, y: zone.endY }].forEach(pt => {
            ctx.fillStyle = zone.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 10 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
            ctx.stroke();
          });

          // 5. Floating Element Glyphs along the segment
          const glyphCount = Math.max(1, Math.floor(segLen / 120));
          for (let g = 1; g <= glyphCount; g++) {
            const t = g / (glyphCount + 1);
            const gx = zone.startX + dx * t;
            const gy = zone.startY + dy * t + Math.sin(time * 3 + g) * 4;

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(zone.icon, gx, gy);
          }

          // 6. Floating Midpoint Tactical Badge
          const badgeY = midY - 26 + Math.sin(time * 2.5 + zIdx) * 3;
          ctx.font = 'bold 9px monospace';
          const badgeText = `${zone.icon} ${zone.name.toUpperCase()}`;
          const textWidth = ctx.measureText(badgeText).width;
          const padX = 8;
          const badgeW = textWidth + padX * 2;
          const badgeH = 18;

          // Badge pill background
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(midX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 9);
          ctx.fill();
          ctx.stroke();

          // Badge text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, midX, badgeY);

          ctx.restore();
        });
      }
    }

    // --- SHINING TACTICAL PLACEMENT GRID (WHEN UNIT SELECTED) ---
    if (selectedDeployAnimal) {
      const isTitan = selectedDeployAnimal.id === 'titan_defender';
      const cellSize = 40;
      const time = now / 1000;
      const gridPulse = Math.sin(time * 3.5) * 0.08 + 0.92;

      ctx.save();
      
      // Ambient cyber deployment grid wash
      ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Check each grid cell
      for (let gx = 0; gx < CANVAS_WIDTH; gx += cellSize) {
        for (let gy = 0; gy < CANVAS_HEIGHT; gy += cellSize) {
          const cellCenterX = gx + cellSize / 2;
          const cellCenterY = gy + cellSize / 2;

          const isCellValid = isPositionValidForTower(cellCenterX, cellCenterY, path, towers, isUltraBoss);

          if (isCellValid) {
            // Shining Emerald Green for Placeable ground
            ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
            ctx.fillRect(gx + 1, gy + 1, cellSize - 2, cellSize - 2);

            ctx.strokeStyle = `rgba(34, 197, 94, ${0.32 * gridPulse})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(gx + 1.5, gy + 1.5, cellSize - 3, cellSize - 3);

            // Subtle green central diamond/crosshair
            ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
            ctx.beginPath();
            ctx.arc(cellCenterX, cellCenterY, 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Shining Red for Enemy Path / Occupied blocks
            ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
            ctx.fillRect(gx + 1, gy + 1, cellSize - 2, cellSize - 2);

            ctx.strokeStyle = `rgba(239, 68, 68, ${0.42 * gridPulse})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(gx + 1.5, gy + 1.5, cellSize - 3, cellSize - 3);

            // Subtle red hazard tick
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(gx + 6, gy + 6);
            ctx.lineTo(gx + cellSize - 6, gy + cellSize - 6);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // Draw Towers (Animals, including spawning and exiting ones)
    const towersToDraw = [
      ...towers.map(t => ({ tower: t, isExiting: false, removedAt: 0 })),
      ...exitingTowersRef.current.map(item => ({ tower: item.tower, isExiting: true, removedAt: item.removedAt }))
    ];

    towersToDraw.forEach(({ tower, isExiting, removedAt }) => {
      const animal = ANIMAL_MAP.get(tower.animalId)!;
      let range = animal.range * (1 + (tower.level - 1) * 0.1);
      if (equippedRelicIds?.includes('quantum_magnet')) {
        range *= 1.40;
      }
      
      let scale = 1;
      let opacity = 1;
      let rotationOffset = 0;

      if (isExiting) {
        const elapsed = now - removedAt;
        const EXIT_DURATION = 350;
        const progress = Math.min(1, elapsed / EXIT_DURATION);
        
        scale = 1 - progress; // Shrink to 0
        opacity = 1 - progress; // Fade to 0
        rotationOffset = progress * Math.PI * 2.5; // Spin out
      } else {
        const spawnTime = spawnTimesRef.current.get(tower.id) || now;
        const elapsed = now - spawnTime;
        const SPAWN_DURATION = 400;
        
        const progress = Math.min(1, elapsed / SPAWN_DURATION);
        scale = progress === 1 
          ? 1 
          : 1 - Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * (2 * Math.PI) / 3);
        
        rotationOffset = (1 - progress) * Math.PI; // Spin in
      }

      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.globalAlpha = opacity;
      ctx.scale(scale, scale);

      // Apply Dynamic Aircraft Hover Flight mechanics
      const floatOffset = tower.isFlying ? (32 + Math.sin(rTime / 240) * 6) : 0;
      if (tower.isFlying) {
        // Render atmospheric ground landing shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 15, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Translate context up to high-altitude flight plane
        ctx.translate(0, -floatOffset);
      }

      // Render custom aircraft physical mecha wings and booster jets
      if (tower.aircraftId && tower.aircraftId !== 'none') {
        ctx.save();
        const sway = Math.sin(rTime / 180) * 0.05;
        ctx.rotate(sway);

        if (tower.aircraftId === 'propeller_plane') {
          // Retro Biplane wings
          ctx.fillStyle = '#475569';
          ctx.fillRect(-28, -2, 56, 4); // main wing
          ctx.fillRect(-20, -10, 40, 2); // top wing
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-15, -10, 3, 8); // strut left
          ctx.fillRect(12, -10, 3, 8); // strut right
          // Spinning Propeller
          const propAngle = rTime / 30;
          ctx.save();
          ctx.translate(0, -14);
          ctx.rotate(propAngle);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-14, 0);
          ctx.lineTo(14, 0);
          ctx.stroke();
          ctx.restore();
        } else if (tower.aircraftId === 'jetpack') {
          // Quantum jetpack booster units
          ctx.fillStyle = '#334155';
          ctx.fillRect(-16, -2, 5, 12); // left tube
          ctx.fillRect(11, -2, 5, 12); // right tube
          // Fiery particle thruster flames
          const firePulse = 8 + Math.random() * 6;
          const leftFlame = ctx.createLinearGradient(-13, 10, -13, 10 + firePulse);
          leftFlame.addColorStop(0, '#f59e0b');
          leftFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = leftFlame;
          ctx.fillRect(-16, 10, 5, firePulse);

          const rightFlame = ctx.createLinearGradient(13, 10, 13, 10 + firePulse);
          rightFlame.addColorStop(0, '#f59e0b');
          rightFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = rightFlame;
          ctx.fillRect(11, 10, 5, firePulse);
        } else if (tower.aircraftId === 'stealth_jet') {
          // Supersonic void delta wings
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.moveTo(-4, -6);
          ctx.lineTo(-34, 12);
          ctx.lineTo(-4, 4);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(4, -6);
          ctx.lineTo(34, 12);
          ctx.lineTo(4, 4);
          ctx.fill();
          // Purple neon stripes
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(-26, 9);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(26, 9);
          ctx.stroke();
          // Twin high-temp engines
          const pulse = 12 + Math.random() * 8;
          ctx.fillStyle = 'rgba(192, 132, 252, 0.85)';
          ctx.beginPath();
          ctx.moveTo(-12, 4); ctx.lineTo(-10, 4 + pulse); ctx.lineTo(-8, 4); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(8, 4); ctx.lineTo(10, 4 + pulse); ctx.lineTo(12, 4); ctx.fill();
        } else if (tower.aircraftId === 'cosmic_carrier') {
          // Circular plasma rings
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 14, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Glowing orbs
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.arc(Math.cos(rTime / 150) * 32, Math.sin(rTime / 150) * 14, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(Math.cos(rTime / 150 + Math.PI) * 32, Math.sin(rTime / 150 + Math.PI) * 14, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (tower.aircraftId === 'titan_giga_thruster') {
          // Titan wing structure
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(-12, -15); ctx.lineTo(-52, -10); ctx.lineTo(-12, 12); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(12, -15); ctx.lineTo(52, -10); ctx.lineTo(12, 12); ctx.fill();
          // Neon cyan booster flame
          const p = 16 + Math.random() * 10;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.beginPath(); ctx.moveTo(-38, -6); ctx.lineTo(-34, -6 + p); ctx.lineTo(-30, -6); ctx.fill();
          ctx.beginPath(); ctx.moveTo(30, -6); ctx.lineTo(34, -6 + p); ctx.lineTo(38, -6); ctx.fill();
        } else if (tower.aircraftId === 'elemental_solar_wings') {
          // Pure solar plasma fire wings
          const fireSize = Math.sin(rTime / 60) * 4;
          ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
          ctx.beginPath();
          ctx.moveTo(-10, -10);
          ctx.bezierCurveTo(-24, -24 - fireSize, -32, -32, -40, -8);
          ctx.lineTo(-10, 8);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(10, -10);
          ctx.bezierCurveTo(24, -24 + fireSize, 32, -32, 40, -8);
          ctx.lineTo(10, 8);
          ctx.fill();
        } else if (tower.aircraftId === 'overseer_anti_gravity_drive') {
          // Intersecting gravity bands
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 24, 11, rTime / 220, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 28, 13, -rTime / 350, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (tower.animalId === 'arcane_warper') {
        // Natural warp floating ring for Warper since "only warper can fly without a jetpack"
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 16, 22, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Expanding feedback ring on placement
      if (!isExiting && (now - (spawnTimesRef.current.get(tower.id) || now)) < 400 && !disableVFX) {
        const elapsed = now - (spawnTimesRef.current.get(tower.id) || now);
        const progress = Math.min(1, elapsed / 400);
        ctx.save();
        ctx.strokeStyle = animal.color;
        ctx.lineWidth = 3 * (1 - progress);
        ctx.globalAlpha = 1 - progress;
        ctx.beginPath();
        ctx.arc(0, 0, 8 + progress * 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Exit particles flying outwards
      if (isExiting && !disableVFX) {
        const elapsed = now - removedAt;
        const EXIT_DURATION = 350;
        const progress = Math.min(1, elapsed / EXIT_DURATION);
        ctx.save();
        const dist = progress * 40;
        const pSize = 6 * (1 - progress);
        for (let i = 0; i < 4; i++) {
          const angle = i * Math.PI / 2 + progress * 3;
          const px = Math.cos(angle) * dist;
          const py = Math.sin(angle) * dist;
          ctx.fillStyle = animal.color;
          ctx.beginPath();
          ctx.arc(px, py, pSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Range highlight (if selected)
      if (selectedTowerId === tower.id) {
        const rangeMultiplier = (tower as any).isPinnacle ? 1.5 : 1.0;

        // If Arcane Warper with Blade Upgrade: Render Dual Ranges (Range 1: Laser Lock-on, Range 2: Astral Blade Cleave)
        if (tower.animalId === 'arcane_warper' && (tower as any).warperBladeUpgrade) {
          // 1. Range 1: Outer Laser Lock-on Range
          ctx.beginPath();
          ctx.arc(0, 0, range * rangeMultiplier, 0, Math.PI * 2);
          ctx.strokeStyle = '#c084fc77';
          ctx.fillStyle = '#a855f711';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.stroke();
          ctx.fill();
          ctx.setLineDash([]);

          // 2. Range 2: Inner Astral Blade Cleave Range (260px)
          const bladeRange = 260;
          const bladeRot = (now / 400) % (Math.PI * 2);

          // Glowing inner blade zone fill
          ctx.beginPath();
          ctx.arc(0, 0, bladeRange, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(217, 70, 239, 0.12)';
          ctx.fill();

          // Outer blade razor perimeter
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#d946ef';
          ctx.setLineDash([10, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // Rotating blade rune teeth around the inner perimeter
          ctx.save();
          ctx.rotate(bladeRot);
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10;
            const bx = Math.cos(a) * bladeRange;
            const by = Math.sin(a) * bladeRange;
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(4, 4);
            ctx.lineTo(-4, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();

          // Dual Range Badges / Labels
          ctx.save();
          ctx.font = '900 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#f5d0fe';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#d946ef';
          ctx.fillText('🗡️ RANGE 2: ASTRAL BLADE CLEAVE (260px)', 0, -bladeRange - 8);
          ctx.fillStyle = '#c084fc';
          ctx.shadowColor = '#a855f7';
          ctx.fillText('⚡ RANGE 1: LASER LOCK-ON', 0, -Math.min(range * rangeMultiplier, 480) - 8);
          ctx.restore();
        } else if (tower.animalId === 'titan_defender') {
          const isUpgraded = Boolean((tower as any).titanMechaHandsUpgrade);
          const mechaHandsRange = isUpgraded ? 750 : 600;
          const mechaRot = (now / 600) % (Math.PI * 2);

          // 1. Range 1: Outer Artillery Laser Range
          ctx.beginPath();
          ctx.arc(0, 0, range * rangeMultiplier, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf888';
          ctx.fillStyle = '#0284c711';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.stroke();
          ctx.fill();
          ctx.setLineDash([]);

          // 2. Range 2: Secondary Close-Mid Hydraulic Mecha Hands Range
          ctx.beginPath();
          ctx.arc(0, 0, mechaHandsRange, 0, Math.PI * 2);
          ctx.fillStyle = isUpgraded ? 'rgba(6, 182, 212, 0.10)' : 'rgba(56, 189, 248, 0.06)';
          ctx.fill();

          ctx.strokeStyle = isUpgraded ? '#00f0ff' : '#38bdf8';
          ctx.lineWidth = isUpgraded ? 2.5 : 1.8;
          ctx.shadowBlur = isUpgraded ? 16 : 8;
          ctx.shadowColor = isUpgraded ? '#00f0ff' : '#38bdf8';
          ctx.setLineDash([12, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // Rotating Mecha Hydraulic Piston teeth markers
          ctx.save();
          ctx.rotate(mechaRot);
          const markerCount = 12;
          for (let i = 0; i < markerCount; i++) {
            const a = (i * Math.PI * 2) / markerCount;
            const mx = Math.cos(a) * mechaHandsRange;
            const my = Math.sin(a) * mechaHandsRange;
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = isUpgraded ? '#67e8f9' : '#94a3b8';
            ctx.fillRect(-3, -4, 6, 8);
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(-1.5, -2, 3, 4);
            ctx.restore();
          }
          ctx.restore();

          // Dual Range Badges
          ctx.save();
          ctx.font = '900 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#67e8f9';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00f0ff';
          ctx.fillText(
            `🦾 RANGE 2: DUAL MECHA HANDS (${mechaHandsRange}px)${isUpgraded ? ' [HYDRAULIC CRUSHER]' : ''}`,
            0,
            -mechaHandsRange - 8
          );
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.fillText('⚡ RANGE 1: ARTILLERY LASER', 0, -Math.min(range * rangeMultiplier, 500) - 8);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, range * rangeMultiplier, 0, Math.PI * 2);
          ctx.strokeStyle = animal.color + '66';
          ctx.fillStyle = animal.color + '11';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fill();
          
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Elemental Hazard Affinity Ring & Overcharge Indicator
      if (elementalHazards && elementalHazards.length > 0 && !isExiting) {
        const affinity = getTowerHazardAffinity(tower, elementalHazards);
        if (affinity && affinity.status !== 'neutral') {
          ctx.save();
          const hzTime = now / 1000;
          if (affinity.status === 'overcharged') {
            // Radiant spinning elemental overcharge ring
            ctx.rotate(hzTime * 2);
            ctx.strokeStyle = affinity.zone.color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.stroke();

            // Inner harmonic ring
            ctx.rotate(-hzTime * 4);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
          } else if (affinity.status === 'resonating') {
            ctx.rotate(hzTime * 1.5);
            ctx.strokeStyle = affinity.zone.color;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
          } else if (affinity.status === 'dampened') {
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // If it is in its Pinnacle state:
      if ((tower as any).isPinnacle) {
        // Draw spinning gold starlight halo ring
        ctx.save();
        const spinAngle = (Date.now() / 400) % (Math.PI * 2);
        ctx.rotate(spinAngle);
        
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // Sparkly outer stars rotating oppositely
        ctx.rotate(-spinAngle * 2);
        ctx.fillStyle = '#f59e0b';
        for (let s = 0; s < 4; s++) {
          const sa = (s * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(Math.cos(sa) * 18, Math.sin(sa) * 18, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Dynamic Visual Auras and Particles based on Rarity
      const rarity = animal.rarity;

      if (rarity === 'Original') {
        const pulse = Math.sin(rTime / 200) * 3;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 18 + pulse;
          ctx.shadowColor = '#d946ef';
        }
        ctx.fillStyle = '#090514';
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!disableVFX) {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          for (let i = 0; i < 3; i++) {
            const angle = (rTime / 300) + (i * Math.PI * 2 / 3);
            const radius = 22 + pulse * 0.5;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      } else if (rarity === 'Celestial') {
        const pulse = Math.sin(rTime / 250) * 2;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 14 + pulse;
          ctx.shadowColor = '#a855f7';
        }
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 + pulse, 10 + pulse * 0.5, rTime / 600, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 22 + pulse, -rTime / 400, 0, Math.PI * 2);
        ctx.stroke();

        if (!disableVFX) {
          const colors = ['#38bdf8', '#f43f5e', '#c084fc', '#e9d5ff'];
          for (let arm = 0; arm < 3; arm++) {
            for (let p = 0; p < 4; p++) {
              const progress = ((rTime / 8 + p * 30) % 120) / 120;
              const dist = 6 + progress * 24;
              const angle = (rTime / 400) + (arm * Math.PI * 2 / 3) + progress * Math.PI * 1.5;
              const px = Math.cos(angle) * dist;
              const py = Math.sin(angle) * dist;
              const alpha = (1 - progress) * 0.8;
              ctx.fillStyle = colors[(arm + p) % colors.length];
              ctx.globalAlpha = alpha;
              ctx.shadowBlur = 5;
              ctx.shadowColor = ctx.fillStyle;
              ctx.beginPath();
              ctx.arc(px, py, 2 - progress * 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.restore();
      } else if (rarity === '???') {
        ctx.save();
        const jitterX = (Math.sin(rTime / 15) * 1.5) * (Math.random() > 0.85 ? 2.5 : 1.0);
        const jitterY = (Math.cos(rTime / 12) * 1.5) * (Math.random() > 0.85 ? 2.5 : 1.0);
        ctx.translate(jitterX, jitterY);

        if (!disableVFX) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#3dd5f3';
        }
        ctx.strokeStyle = 'rgba(61, 213, 243, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-16, -16, 32, 32);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeRect(-13, -13, 26, 26);

        if (!disableVFX) {
          ctx.fillStyle = '#3dd5f3';
          ctx.shadowBlur = 8;
          const cornerVal = 14 + Math.sin(rTime / 80) * 2;
          ctx.fillRect(-cornerVal - 2, -cornerVal - 2, 4, 4);
          ctx.fillRect(cornerVal - 2, -cornerVal - 2, 4, 4);
          ctx.fillRect(-cornerVal - 2, cornerVal - 2, 4, 4);
          ctx.fillRect(cornerVal - 2, cornerVal - 2, 4, 4);
        }
        ctx.restore();
      } else if (rarity === 'Overseer') {
        const pulse = Math.sin(rTime / 150) * 2;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00ffcc';
        }
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        const sweepAngle = (rTime / 450) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sweepAngle) * (22 + pulse), Math.sin(sweepAngle) * (22 + pulse));
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 255, 204, 0.8)';
        ctx.lineWidth = 1;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
          const x1 = Math.cos(angle) * (20 + pulse);
          const y1 = Math.sin(angle) * (20 + pulse);
          const x2 = Math.cos(angle) * (24 + pulse);
          const y2 = Math.sin(angle) * (24 + pulse);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (rarity === 'Secret') {
        const pulse = Math.sin(rTime / 300) * 2;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 10 + pulse;
          ctx.shadowColor = animal.color;
        }
        ctx.strokeStyle = animal.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + (rTime / 800);
          const r = 18 + pulse;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        if (!disableVFX) {
          ctx.fillStyle = animal.color;
          ctx.shadowBlur = 6;
          for (let b = 0; b < 3; b++) {
            const offsetProgress = ((rTime / 12 + b * 40) % 100) / 100;
            const yPos = 12 - (offsetProgress * 28);
            const xPos = Math.sin(rTime / 100 + b * 10) * 12;
            const size = 3 * (1 - offsetProgress);
            ctx.globalAlpha = 1 - offsetProgress;
            ctx.fillRect(xPos - size/2, yPos - size/2, size, size);
          }
        }
        ctx.restore();
      } else if (rarity === 'Unrivaled') {
        const pulse = Math.sin(rTime / 120) * 2.5;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 18 + pulse * 2;
          ctx.shadowColor = '#fbbf24';
        }
        const radGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 18 + pulse);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        radGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.7)');
        radGrad.addColorStop(0.8, 'rgba(249, 115, 22, 0.35)');
        radGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
        ctx.lineWidth = 1.5;
        const numRays = 8;
        for (let r = 0; r < numRays; r++) {
          const angle = (r * Math.PI * 2 / numRays) + (rTime / 500);
          const innerDist = 12 + Math.sin(rTime / 80 + r) * 2;
          const outerDist = 24 + pulse + Math.cos(rTime / 60 + r) * 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * innerDist, Math.sin(angle) * innerDist);
          ctx.lineTo(Math.cos(angle) * outerDist, Math.sin(angle) * outerDist);
          ctx.stroke();
        }
        ctx.restore();
      } else if (rarity === 'Mythic') {
        const pulse = Math.sin(rTime / 180) * 2;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 16 + pulse;
          ctx.shadowColor = '#ef4444';
        }
        const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, 16 + pulse);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
        ctx.fill();

        if (!disableVFX) {
          ctx.fillStyle = '#facc15';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#facc15';
          for (let i = 0; i < 4; i++) {
            const progress = ((rTime / 10 + i * 35) % 100) / 100;
            const yPos = 12 - (progress * 26);
            const xPos = Math.sin(rTime / 150 + i * 2) * 12;
            const radius = 2.5 * (1 - progress);
            ctx.globalAlpha = 1 - progress;
            ctx.beginPath();
            ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      } else if (rarity === 'Legendary') {
        const pulse = Math.sin(rTime / 220) * 1.5;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 12 + pulse;
          ctx.shadowColor = '#eab308';
        }
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 15 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        if (!disableVFX) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          for (let i = 0; i < 4; i++) {
            const angle = (rTime / 600) + (i * Math.PI / 2);
            const dist = 15 + pulse + Math.sin(rTime / 100 + i) * 1.5;
            const sx = Math.cos(angle) * dist;
            const sy = Math.sin(angle) * dist;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(1, -1);
            ctx.lineTo(4, 0);
            ctx.lineTo(1, 1);
            ctx.lineTo(0, 4);
            ctx.lineTo(-1, 1);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-1, -1);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      } else if (rarity === 'The Chillful') {
        const pulse = Math.sin(rTime / 400) * 2;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#84cc16';
        }
        ctx.strokeStyle = 'rgba(132, 204, 22, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(163, 230, 53, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16 + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (rarity === 'Epic') {
        const pulse = Math.sin(rTime / 350) * 1.5;
        ctx.save();
        if (!disableVFX) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#a855f7';
        }
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (rarity === 'Rare') {
        const pulse = Math.sin(rTime / 450) * 1.0;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, 13 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.rotate(tower.rotation + rotationOffset);
      
      const isMythicOrSecretOrCelestial = ['Mythic', 'Secret', 'Celestial', '???', 'Original', 'Overseer', 'Unrivaled', 'The Chillful'].includes(animal.rarity);
      let dynamicColor = animal.color;
      if (tower.animalId === 'elemental_god' || tower.animalId.endsWith('_deity')) {
        const defaultEl = ANIMAL_ELEMENTS[tower.animalId] || 'fire';
        const element = (tower as any).element || defaultEl;
        dynamicColor = element === 'fire' ? '#ef4444' :
                       element === 'poison' ? '#10b981' :
                       element === 'water' ? '#3b82f6' :
                       element === 'sand' ? '#ebd2b0' :
                       element === 'dirt' ? '#7c2d12' :
                       element === 'ice' ? '#06b6d4' :
                       element === 'wind' ? '#a8a29e' :
                       element === 'lightning' ? '#eab308' :
                       element === 'light' ? '#f59e0b' :
                       element === 'shadow' ? '#8b5cf6' :
                       element === 'magma' ? '#f97316' : '#ec4899';
      }
      const cubeSize = tower.animalId === 'titan_defender' ? 58 : ((tower.animalId === 'all_seeing_overseer' || tower.animalId === 'elemental_god' || tower.animalId === 'arcane_warper' || tower.animalId === 'capybara') ? 40 : 24);
      drawCubeAnimal(ctx, cubeSize, dynamicColor, isMythicOrSecretOrCelestial, animal.id, tower.level, (tower as any).isPinnacle, (tower as any).titanForm, (tower as any).ultraLaserActive, tower);
      
      // Draw Titan Upgraded Shields (Front, Side, and 4 Omni-Shields)
      if (tower.animalId === 'titan_defender') {
        const isUpgradedTV = (tower as any).titanSkin === 'upgraded_titan_tv_man';
        const isTrueDefender = (tower as any).titanSkin === 'the_true_defender';
        const shieldStrokeColor = isTrueDefender ? 'rgba(52, 211, 153, 0.9)' : isUpgradedTV ? 'rgba(168, 85, 247, 0.85)' : 'rgba(56, 189, 248, 0.85)';
        const shieldShadowColor = isTrueDefender ? '#34d399' : isUpgradedTV ? '#ec4899' : '#38bdf8';

        // 4 Omni-Shields (Upgrade 2: Shields in all places)
        if ((tower as any).titanFourShieldsUpgrade || isTrueDefender) {
          const shieldPulse = Math.sin(Date.now() / 150) * 3;
          const shieldDist = 52 + shieldPulse;

          // 4 Shields at 0° (East), 90° (South), 180° (West), and 270° (North)
          for (let angle = 0; angle < 4; angle++) {
            const centerAngle = (angle * Math.PI) / 2;
            const span = Math.PI / 4.5;
            
            // Heavy outer forcefield arc
            ctx.beginPath();
            ctx.arc(0, 0, shieldDist, centerAngle - span, centerAngle + span);
            ctx.strokeStyle = shieldStrokeColor;
            ctx.lineWidth = 4.5;
            ctx.shadowBlur = 16;
            ctx.shadowColor = shieldShadowColor;
            ctx.stroke();

            // Inner energy harmonic ripple
            ctx.beginPath();
            ctx.arc(0, 0, shieldDist - 6, centerAngle - span * 0.8, centerAngle + span * 0.8);
            ctx.strokeStyle = isTrueDefender ? 'rgba(167, 243, 208, 0.65)' : 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Shield emitter node at center of arc
            const nodeX = Math.cos(centerAngle) * (shieldDist + 2);
            const nodeY = Math.sin(centerAngle) * (shieldDist + 2);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          if ((tower as any).titanFrontShieldUpgrade) {
            ctx.beginPath();
            ctx.arc(0, 0, 48, -Math.PI / 4, Math.PI / 4);
            ctx.strokeStyle = shieldStrokeColor;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 12;
            ctx.shadowColor = shieldShadowColor;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 52, -Math.PI / 5, Math.PI / 5);
            ctx.strokeStyle = isUpgradedTV ? 'rgba(236, 72, 153, 0.55)' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          if ((tower as any).titanSideShieldUpgrade) {
            // Left side arc
            ctx.beginPath();
            ctx.arc(0, 0, 44, Math.PI / 2 - Math.PI / 5, Math.PI / 2 + Math.PI / 5);
            ctx.strokeStyle = isUpgradedTV ? 'rgba(168, 85, 247, 0.75)' : 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = shieldShadowColor;
            ctx.stroke();

            // Right side arc
            ctx.beginPath();
            ctx.arc(0, 0, 44, -Math.PI / 2 - Math.PI / 5, -Math.PI / 2 + Math.PI / 5);
            ctx.strokeStyle = isUpgradedTV ? 'rgba(168, 85, 247, 0.75)' : 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = shieldShadowColor;
            ctx.stroke();
          }
        }
      }

      // Draw Alien Tech Holographic Shield & Scanner Optics on Unit Model
      if (tower.isAlienTech) {
        ctx.save();
        const tier = tower.alienTechTier || 1;
        const now = Date.now();
        const shieldPulse = Math.sin(now / 180) * 2.5;
        const shieldR = 32 + (tier - 1) * 3 + shieldPulse;
        const shieldHp = tower.alienTechShieldHp || 0;
        const maxShield = tier * 1200;
        const shieldPct = Math.max(0.1, Math.min(1, shieldHp / maxShield));

        // 1. Hexagonal Holographic Kinetic Shield Perimeter
        ctx.save();
        ctx.rotate(now / 1800); // Ambient counter-rotation
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hx = Math.cos(angle) * shieldR;
          const hy = Math.sin(angle) * shieldR;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = tier === 3 ? `rgba(168, 85, 247, ${0.45 + 0.45 * shieldPct})` : `rgba(132, 204, 22, ${0.45 + 0.45 * shieldPct})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = tier === 3 ? '#a855f7' : '#84cc16';
        ctx.stroke();

        // Hexagonal energy fill
        ctx.fillStyle = tier === 3 ? `rgba(168, 85, 247, ${0.09 * shieldPct})` : `rgba(132, 204, 22, ${0.09 * shieldPct})`;
        ctx.fill();

        // 6 Emitter nodes on vertices
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hx = Math.cos(angle) * shieldR;
          const hy = Math.sin(angle) * shieldR;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(hx, hy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 2. Inner concentric holographic ring
        ctx.save();
        ctx.rotate(-now / 1200);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, shieldR - 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 3. Laser-Tracking Optics Module Mounted on the Model
        ctx.save();
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = tier === 3 ? '#a855f7' : '#84cc16';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(14, -14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Laser Diode
        const diodePulse = 0.6 + 0.4 * Math.sin(now / 100);
        ctx.fillStyle = tier === 3 ? `rgba(236, 72, 153, ${diodePulse})` : `rgba(239, 68, 68, ${diodePulse})`;
        ctx.beginPath();
        ctx.arc(14, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      ctx.restore();

      // Draw Laser-Tracking Beam & Target Reticle
      if (tower.isAlienTech) {
        const tier = tower.alienTechTier || 1;
        const targetEnemy = enemies.find(e => e.id === tower.laserTargetEnemyId);
        if (targetEnemy) {
          const now = Date.now();
          ctx.save();
          // Laser beam from unit to target enemy
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y);
          ctx.lineTo(targetEnemy.x, targetEnemy.y);
          ctx.strokeStyle = tier === 3 ? '#ec4899' : '#84cc16';
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = tier === 3 ? '#f43f5e' : '#a3e635';
          ctx.stroke();

          // Core bright laser line
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y);
          ctx.lineTo(targetEnemy.x, targetEnemy.y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Laser tracking pulse dots moving along the beam
          const tdx = targetEnemy.x - tower.x;
          const tdy = targetEnemy.y - tower.y;
          const beamDist = Math.sqrt(tdx * tdx + tdy * tdy);
          if (beamDist > 10) {
            const pulseT = ((now / 8) % beamDist) / beamDist;
            const dotX = tower.x + tdx * pulseT;
            const dotY = tower.y + tdy * pulseT;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Target Holographic Lock-on Reticle on the targeted enemy
          ctx.save();
          ctx.translate(targetEnemy.x, targetEnemy.y);
          const reticleRot = now / 400;
          ctx.rotate(reticleRot);
          const rSize = 14;
          ctx.strokeStyle = tier === 3 ? '#a855f7' : '#84cc16';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = tier === 3 ? '#a855f7' : '#84cc16';

          // 4 Corner Brackets
          for (let k = 0; k < 4; k++) {
            ctx.save();
            ctx.rotate((k * Math.PI) / 2);
            ctx.beginPath();
            ctx.moveTo(rSize - 4, rSize);
            ctx.lineTo(rSize, rSize);
            ctx.lineTo(rSize, rSize - 4);
            ctx.stroke();
            ctx.restore();
          }

          // Central crosshair
          ctx.beginPath();
          ctx.moveTo(-3, 0); ctx.lineTo(3, 0);
          ctx.moveTo(0, -3); ctx.lineTo(0, 3);
          ctx.stroke();

          ctx.restore();

          // Target Locked HUD label
          ctx.save();
          ctx.translate(targetEnemy.x, targetEnemy.y - 18);
          ctx.fillStyle = tier === 3 ? '#d8b4fe' : '#bef264';
          ctx.font = 'bold 7.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`🎯 LOCK [T${tier}]`, 0, 0);
          ctx.restore();

          ctx.restore();
        }
      }

      if ((tower as any).isDisabled) {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        ctx.globalAlpha = opacity;
        ctx.scale(scale, scale);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Draw crackling sparks
        for (let i = 0; i < 5; i++) {
          const a = Math.random() * Math.PI * 2;
          const rInner = 10 + Math.random() * 4;
          const rOuter = 16 + Math.random() * 10;
          ctx.moveTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
          ctx.lineTo(Math.cos(a + 0.15) * (rInner + rOuter) / 2, Math.sin(a + 0.15) * (rInner + rOuter) / 2);
          ctx.lineTo(Math.cos(a - 0.05) * rOuter, Math.sin(a - 0.05) * rOuter);
        }
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ SHOCKED', 0, -20);
        ctx.restore();
      }

      // Draw small persistent high-tech health/integrity status bar
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.globalAlpha = opacity;
      ctx.scale(scale, scale);

      const barW = 24;
      const barH = 3.5;
      const barX = -barW / 2;
      const barY = -14; // Positioned right above the unit's head

      // Semi-transparent status bar background container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(barX, barY, barW, barH);

      // Current integrity fill
      const integrity = tower.integrity !== undefined ? tower.integrity : 1.0;
      const isDisabled = !!tower.isDisabled;

      if (integrity > 0) {
        if (isDisabled) {
          // Glow and pulse effect to show active EMP rebooting sequence
          const pulse = 0.75 + 0.25 * Math.sin(Date.now() / 150);
          ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`; // Pulsing neon/cyan
        } else {
          ctx.fillStyle = '#10b981'; // Steady healthy neon emerald green
        }
        ctx.fillRect(barX, barY, barW * integrity, barH);
      }

      // 1px subtle dark boundary border for high contrast
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 0.75;
      ctx.strokeRect(barX, barY, barW, barH);

      // Draw Alien Tech Shield Bar right above integrity bar
      if (tower.isAlienTech) {
        const aTier = tower.alienTechTier || 1;
        const maxShield = aTier * 1200;
        const shieldRatio = Math.max(0, Math.min(1, (tower.alienTechShieldHp || 0) / maxShield));
        const sBarY = barY - 4;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX, sBarY, barW, 2.5);

        ctx.fillStyle = aTier === 3 ? '#c084fc' : '#a3e635';
        ctx.fillRect(barX, sBarY, barW * shieldRatio, 2.5);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(barX, sBarY, barW, 2.5);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.globalAlpha = opacity;
      ctx.scale(scale, scale);
      ctx.fillStyle = (tower as any).isPinnacle ? '#fbbf24' : tower.isAlienTech ? '#bef264' : 'white';
      ctx.font = 'bold 9px Inter';
      ctx.textAlign = 'center';
      if ((tower as any).isPinnacle) {
        ctx.fillText('PINNACLE', 0, 25);
      } else if (tower.isAlienTech) {
        ctx.fillText(`👽 T${tower.alienTechTier || 1} • LV${tower.level}`, 0, 25);
      } else {
        ctx.fillText(`LV${tower.level}`, 0, 25);
      }
      ctx.restore();
    });

    // --- RENDER ACTIVE TITAN HYDRAULIC MECHA HAND PUNCHES ---
    towers.forEach(tower => {
      if (tower.animalId !== 'titan_defender') return;
      const punches = [
        { punch: (tower as any).titanLeftHandPunch, hand: 'left' },
        { punch: (tower as any).titanRightHandPunch, hand: 'right' }
      ];

      punches.forEach(({ punch, hand }) => {
        if (!punch || !punch.active) return;
        const elapsed = now - punch.startTime;
        if (elapsed > punch.duration) return;

        const progress = Math.min(1, Math.max(0, elapsed / punch.duration));
        // Punch trajectory: fast extend outwards (0 to 0.45) then retract back (0.45 to 1.0)
        const punchCurve = progress < 0.45 ? Math.sin((progress / 0.45) * (Math.PI / 2)) : Math.cos(((progress - 0.45) / 0.55) * (Math.PI / 2));

        const curX = punch.startX + (punch.targetX - punch.startX) * punchCurve;
        const curY = punch.startY + (punch.targetY - punch.startY) * punchCurve;

        const angle = Math.atan2(punch.targetY - punch.startY, punch.targetX - punch.startX);
        const isUpgraded = Boolean((tower as any).titanMechaHandsUpgrade);
        const fistColor = (tower as any).titanSkin === 'the_true_defender' ? '#34d399' :
                          (tower as any).titanSkin === 'upgraded_titan_tv_man' ? '#a855f7' :
                          (tower as any).titanSkin === 'upgraded_titan_speakerman' ? '#ef4444' :
                          (tower as any).titanSkin === 'titan_clockman' ? '#eab308' :
                          (tower as any).titanSkin === 'titan_drillman' ? '#f97316' : '#00f0ff';

        ctx.save();

        // 1. Hydraulic Telescopic Piston Shaft (arm extending from shoulder/side)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = isUpgraded ? 8 : 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(punch.startX, punch.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Piston Chrome Inset
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = isUpgraded ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.moveTo(punch.startX, punch.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Glowing hydraulic fluid power conduit line
        ctx.strokeStyle = fistColor;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = fistColor;
        ctx.beginPath();
        ctx.moveTo(punch.startX, punch.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 2. Articulated Hydraulic Wrist & Heavy Fist at current position
        ctx.translate(curX, curY);
        ctx.rotate(angle);

        // Heavy wrist cuff
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = fistColor;
        ctx.lineWidth = 1.5;
        ctx.fillRect(-10, -8, 8, 16);
        ctx.strokeRect(-10, -8, 8, 16);

        // Reinforced Bionic Fist Chassis
        const fistW = isUpgraded ? 22 : 16;
        const fistH = isUpgraded ? 20 : 14;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-2, -fistH / 2, fistW, fistH);
        ctx.strokeRect(-2, -fistH / 2, fistW, fistH);

        // Glowing Heavy Impact Knuckles & Neon Power Cells
        ctx.fillStyle = fistColor;
        ctx.shadowBlur = 12;
        ctx.shadowColor = fistColor;
        for (let k = 0; k < 3; k++) {
          const ky = -fistH / 2 + 2 + k * (fistH / 3);
          ctx.fillRect(fistW - 4, ky, 5, fistH / 4);
        }

        // Motion / Speed lines behind punch when extending fast
        if (progress < 0.45) {
          ctx.strokeStyle = fistColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-16, -6); ctx.lineTo(-28, -6);
          ctx.moveTo(-14, 0); ctx.lineTo(-32, 0);
          ctx.moveTo(-16, 6); ctx.lineTo(-28, 6);
          ctx.stroke();
        }

        ctx.restore();
      });
    });

    // Draw Enemies (Hunters)
    enemies.forEach(enemy => {
      const type = ENEMY_MAP.get(enemy.typeId) || {
        id: enemy.typeId,
        name: enemy.typeId.includes('origin') ? '🌌 THE MULTIVERSE PRIME ORIGIN (400TH WAVE FINALE)' : 'Syndicate Operative',
        color: enemy.typeId.includes('origin') ? '#ec4899' : '#f43f5e',
        size: enemy.typeId.includes('origin') ? 95 : 30,
        isBoss: enemy.typeId.includes('origin') || enemy.typeId.includes('boss'),
        emoji: enemy.typeId.includes('origin') ? '🌌' : '👾',
        category: enemy.typeId.includes('origin') ? 'boss' : 'standard',
        speed: 0.2,
        bounty: 100,
        description: 'A hostile syndicate entity.'
      };
      ctx.save();
      
      const enemyIsFlying = enemy.isFlying || ['sky_vanguard', 'plasma_interceptor', 'doom_vulture', 'cyber_cruiser_boss'].includes(enemy.typeId);
      const altitude = enemyIsFlying ? (60 + Math.sin(rTime / 180 + enemy.x / 100) * 8) : 0;
      
      if (enemyIsFlying) {
        // Draw real-time high-altitude tracking shadow on the ground path
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + (type?.size || 30) * 0.4, (type?.size || 30) * 0.6, (type?.size || 30) * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Translate visual components high into the sky!
        ctx.translate(enemy.x, enemy.y - altitude);
      } else {
        ctx.translate(enemy.x, enemy.y);
      }
      
      ctx.rotate(enemy.rotation);
      
      const isBoss = !!type.isBoss;
      const emoji = type.emoji;

      // Draw custom visual designs for High-Tech specialist hunters, but styled with 3D Voxel:
      if (type.id === 'hitech_spectre') {
        const isCamo = !enemy.slowMultiplier || enemy.slowMultiplier >= 1.0;
        if (isCamo) {
          ctx.globalAlpha = 0.25; // Shimmer stealth alpha
          drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);
        } else {
          ctx.globalAlpha = 0.95; // Opaque revealed body!
          drawCubeEnemy(ctx, type.size, '#ef4444', type.id, emoji, isBoss);
          // Glitched revealed spark ring red error borders
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-type.size/2 - 2, -type.size/2 - 2, type.size + 4, type.size + 4);
        }
      } else if (type.id === 'hitech_nullifier') {
        // Draw the 3D cube body for the armadillo
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);

        // Frontal deflection shield ring (always faces forward in forward-rotation direction)
        ctx.restore();
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const startRad = enemy.rotation - Math.PI / 3;
        const endRad = enemy.rotation + Math.PI / 3;
        ctx.arc(0, 0, type.size * 1.15, startRad, endRad);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, 0, type.size * 1.15, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type.id === 'hitech_trapper') {
        // Trapper spider: draw the 3D cube spider body
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);
        // Overlay some mechanical spider legs around the cube
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        for (let leg = 0; leg < 8; leg++) {
          const angle = (leg * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * (type.size / 2), Math.sin(angle) * (type.size / 2));
          ctx.lineTo(Math.cos(angle) * (type.size * 0.9), Math.sin(angle) * (type.size * 0.9));
          ctx.stroke();
        }
      } else if (type.id === 'hitech_decoy') {
        // Decoy: draw rotating hot pink matrix around a 3D kitsune body
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);

        ctx.rotate(Date.now() / 400);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-type.size/2 - 3, -type.size/2 - 3, type.size + 6, type.size + 6);
      } else if (type.id === 'hitech_decoy_phantom') {
        // Hologram decoy: draw low alpha flickering cube
        ctx.globalAlpha = 0.45;
        const jitterX = Math.sin(Date.now() / 35) * 2;
        ctx.translate(jitterX, 0);
        drawCubeEnemy(ctx, type.size, '#f43f5e', type.id, emoji, isBoss);
      } else if (type.id === 'hitech_hover_dreadnought') {
        // Large levitating fortress whale
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);
        
        // Glow engines on the side
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-type.size/2 - 5, -3, 4, 6);
        ctx.fillRect(type.size/2 + 1, -3, 4, 6);
      } else if (type.id === 'alien_bio_titan') {
        // 👑 XENON TITAN COLOSSUS: Colossal Bio-Mech Overlord
        const time = Date.now() / 1000;
        const titanSize = type.size || 110;

        // 1. Radioactive Bio-Hazard Energy Aura
        ctx.fillStyle = 'rgba(132, 204, 22, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, titanSize * 1.25 + Math.sin(time * 4) * 8, 0, Math.PI * 2);
        ctx.fill();

        // 2. Heavy Spiked Shoulder Armor Cannons
        ctx.fillStyle = '#14532d'; // Dark bio-forest green
        ctx.fillRect(-titanSize * 0.65, -titanSize * 0.4, titanSize * 0.3, titanSize * 0.8);
        ctx.fillRect(titanSize * 0.35, -titanSize * 0.4, titanSize * 0.3, titanSize * 0.8);

        // Cannon Barrels
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(-titanSize * 0.6, -titanSize * 0.55, titanSize * 0.2, titanSize * 0.25);
        ctx.fillRect(titanSize * 0.4, -titanSize * 0.55, titanSize * 0.2, titanSize * 0.25);

        // 3. Main 3D Voxel Titan Chassis
        drawCubeEnemy(ctx, titanSize, '#15803d', type.id, emoji, true);

        // 4. Pulsing Bio-Reactor Chest Core
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(time * 6) * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // 5. Bio-Electric Lightning Ring
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, titanSize * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type.id === 'alien_mothership') {
        // 🛸 XENON MOTHERSHIP FLAGSHIP: Planetary Command Carrier
        const time = Date.now() / 1000;
        const shipSize = type.size || 120;

        // 1. High Altitude Anti-Grav Ground Shadow
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, shipSize * 1.35 + Math.sin(time * 2) * 6, 0, Math.PI * 2);
        ctx.fill();

        // 2. Counter-Rotating Outer Kinetic Shield Rings
        ctx.save();
        ctx.rotate(time * 0.7);
        ctx.strokeStyle = '#06b6d4'; // Neon cyan
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 8, 4, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, shipSize * 1.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.rotate(-time * 0.9);
        ctx.strokeStyle = '#10b981'; // Neon emerald
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, shipSize * 0.92, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. Main Saucer Disk Chassis
        drawCubeEnemy(ctx, shipSize, '#042f2e', type.id, emoji, true);

        // 4. Orbital Plasma Battery Turrets (4 Pods)
        for (let p = 0; p < 4; p++) {
          const turretAngle = (p * Math.PI) / 2 + (time * 0.4);
          const tx = Math.cos(turretAngle) * (shipSize * 0.7);
          const ty = Math.sin(turretAngle) * (shipSize * 0.7);

          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(tx, ty, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 5. Central Abduction Tractor Beam Core
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(0, 0, 20 + Math.sin(time * 5) * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ecfeff';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (type.id === 'alien_mind_flayer') {
        // 🧠 Psionic Overmind Leech
        const time = Date.now() / 1000;
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, type.size * 0.9 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
        ctx.stroke();
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);
      } else if (type.id === 'ultra_world_boss') {
        // Colossal Ultra World Boss 3D Sovereign Titan
        const time = Date.now() / 1000;
        const bossSize = type.size || 150;
        
        // 1. Giant cosmic shadow & void aura
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, bossSize * 1.3 + Math.sin(time * 3) * 10, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rotating Outer Runic Energy Ring 1
        ctx.save();
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 10, 5, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, bossSize * 1.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. Rotating Outer Runic Energy Ring 2 (Counter-Rotating)
        ctx.save();
        ctx.rotate(-time * 0.8);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.arc(0, 0, bossSize * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 4. Floating Orbital Shields (4 orbiting glowing spheres)
        for (let s = 0; s < 4; s++) {
          const orbitAngle = time * 1.5 + (s * Math.PI) / 2;
          const sx = Math.cos(orbitAngle) * (bossSize * 1.25);
          const sy = Math.sin(orbitAngle) * (bossSize * 1.25);
          
          ctx.fillStyle = s % 2 === 0 ? '#f43f5e' : '#fbbf24';
          ctx.beginPath();
          ctx.arc(sx, sy, 12, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 5. Main 3D Voxel Dark Sovereign Core
        drawCubeEnemy(ctx, bossSize, '#581c87', type.id, emoji, true);

        // 6. Glowing Dark Matter Core Eye
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 24 + Math.sin(time * 6) * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // 7. Energy Cross Beams
        ctx.strokeStyle = '#e0e7ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-bossSize/2, 0);
        ctx.lineTo(bossSize/2, 0);
        ctx.moveTo(0, -bossSize/2);
        ctx.lineTo(0, bossSize/2);
        ctx.stroke();
      } else {
        // All other bad animals: standard 3D voxel cube drawing
        drawCubeEnemy(ctx, type.size, type.color, type.id, emoji, isBoss);
      }

      if (type.id === 'hitech') {
        // Warlord gorilla glow ring
        ctx.strokeStyle = '#22d3ee'; 
        ctx.lineWidth = 2;
        ctx.strokeRect(-type.size/2 - 4, -type.size/2 - 4, type.size + 8, type.size + 8);
      }

      if (enemy.isHypnotized) {
        // Hypnotized friendly aura ring and tranquil spiral indicator
        ctx.save();
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 2.5;
        if (!disableVFX) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#a3e635';
        }
        ctx.beginPath();
        ctx.arc(0, 0, (type.size || 20) * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#a3e635';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🌀 ALLY', 0, -(type.size / 2) - 14);
        ctx.restore();
      }

      ctx.restore();

      // Health bar
      if (type.id === 'ultra_world_boss') {
        const barWidth = 240;
        const barHeight = 16;
        const hpPercent = Math.max(0, enemy.health / enemy.maxHealth);

        ctx.save();
        ctx.translate(enemy.x, enemy.y - type.size/2 - 30);

        // Frame
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.fillRect(-barWidth/2 - 2, -barHeight/2 - 2, barWidth + 4, barHeight + 4);
        ctx.strokeRect(-barWidth/2 - 2, -barHeight/2 - 2, barWidth + 4, barHeight + 4);

        // Gradient Fill
        const grad = ctx.createLinearGradient(-barWidth/2, 0, barWidth/2, 0);
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#3b82f6');

        ctx.fillStyle = grad;
        ctx.fillRect(-barWidth/2, -barHeight/2, barWidth * hpPercent, barHeight);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👑 ULTRA BOSS: ${(hpPercent * 100).toFixed(2)}%`, 0, 1);

        ctx.restore();
      } else {
        const barWidth = 24;
        const barHeight = 3;
        const yOffset = enemyIsFlying ? (20 + altitude) : 20;
        if (enemy.isHypnotized) {
          ctx.fillStyle = 'rgba(132, 204, 22, 0.25)';
          ctx.fillRect(enemy.x - barWidth/2, enemy.y - yOffset, barWidth, barHeight);
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(enemy.x - barWidth/2, enemy.y - yOffset, barWidth * (enemy.health / enemy.maxHealth), barHeight);
        } else {
          ctx.fillStyle = '#ef444433';
          ctx.fillRect(enemy.x - barWidth/2, enemy.y - yOffset, barWidth, barHeight);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(enemy.x - barWidth/2, enemy.y - yOffset, barWidth * (enemy.health / enemy.maxHealth), barHeight);
        }
      }
    });

    // Draw Projectiles with High Performance & High Visual Polish (0 Lag vector tracers)
    const maxProjectilesToDraw = isMobile ? 80 : 160;
    const activeProjectiles = projectiles.length > maxProjectilesToDraw ? projectiles.slice(-maxProjectilesToDraw) : projectiles;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // Hardware accelerated glow blend for projectile trails
    activeProjectiles.forEach(p => {
      const color = p.color || '#22d3ee';
      const target = enemies.find(e => e.id === p.targetId);
      
      let dx = 0;
      let dy = 0;
      if (target) {
        const dist = Math.sqrt((target.x - p.x) ** 2 + (target.y - p.y) ** 2);
        if (dist > 0) {
          dx = (target.x - p.x) / dist;
          dy = (target.y - p.y) / dist;
        }
      }

      // Outer plasma glow trail
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - dx * 12, p.y - dy * 12);
      ctx.stroke();

      // Sharp bright center trail
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - dx * 7, p.y - dy * 7);
      ctx.stroke();

      // Outer plasma flare
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Super white bright core
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Draw Special Skill Visual Effects
    const maxCritTexts = isMobile ? 18 : 32;
    let critTextCount = 0;

    skillEffects.forEach(effect => {
      ctx.save();
      const opacity = 1 - (effect.radius / effect.maxRadius);
      ctx.globalAlpha = Math.max(0, opacity);
      
      if (disableVFX) {
        if (effect.type === 'crit_text') {
          if (++critTextCount > maxCritTexts) {
            ctx.restore();
            return;
          }
          // Performance-safe Floating Combat Text
          const elapsed = Date.now() - effect.startTime;
          const progress = Math.min(1, Math.max(0, elapsed / (effect.duration || 750)));
          const floatY = effect.y - (24 * progress);
          const alpha = progress > 0.65 ? Math.max(0, (1 - progress) / 0.35) : 1.0;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = '900 11px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          const text = effect.text || `CRIT!`;
          ctx.strokeText(text, effect.x, floatY);
          ctx.fillStyle = effect.color || '#f59e0b';
          ctx.fillText(text, effect.x, floatY);
          ctx.restore();
          ctx.restore();
          return;
        }

        // High Performance Mode: draw thin wireframe radius lines instead of heavy gradients and loops
        ctx.strokeStyle = effect.color || '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius || 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      
      if (effect.type === 'shockwave') {
        // T-Rex Tremor Stomp: Expanding earth shockwave
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 5;
        ctx.globalAlpha = Math.max(0, opacity * 0.7);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(0, effect.radius - 10), 0, Math.PI * 2);
        ctx.stroke();
      }
      else if (effect.type === 'firering') {
        // Phoenix Firewave: Radiant expanding fire wave
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 6;
        ctx.globalAlpha = Math.max(0, opacity * 0.8);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(0, effect.radius - 4), 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'meteor') {
        // Dragon Meteor strike
        const curRadius = effect.radius;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = effect.color;
        ctx.globalAlpha = Math.max(0, opacity * 0.7);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, curRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, curRadius * 1.05, 0, Math.PI * 2);
        ctx.stroke();
      }
      else if (effect.type === 'laser_cross') {
        // Mecha Cyber Rex laser cross
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 5;
        ctx.globalAlpha = Math.max(0, opacity * 0.7);
        
        ctx.beginPath();
        ctx.moveTo(effect.x - effect.maxRadius, effect.y);
        ctx.lineTo(effect.x + effect.maxRadius, effect.y);
        ctx.moveTo(effect.x, effect.y - effect.maxRadius);
        ctx.lineTo(effect.x, effect.y + effect.maxRadius);
        ctx.stroke();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.beginPath();
        ctx.moveTo(effect.x - effect.maxRadius, effect.y);
        ctx.lineTo(effect.x + effect.maxRadius, effect.y);
        ctx.moveTo(effect.x, effect.y - effect.maxRadius);
        ctx.lineTo(effect.x, effect.y + effect.maxRadius);
        ctx.stroke();
      }
      else if (effect.type === 'vortex') {
        // Cthulhu / Celestial Leviathan vortex (rotates)
        const spiralAngle = (Date.now() / 150) % (Math.PI * 2);
        ctx.translate(effect.x, effect.y);
        ctx.rotate(spiralAngle);
        
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = effect.color;
        
        // Cap visual drawing radius to prevent massive screen-wide laggy canvas fills
        const drawRadius = Math.min(effect.radius, 250);
        
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const r = drawRadius * (a / (Math.PI * 2));
          const cx = Math.cos(a) * r;
          const cy = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        ctx.fillStyle = effect.color === '#10b981' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, drawRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'nuclear') {
        // Atomic Kaiju pulse
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 12;
        ctx.shadowBlur = 30;
        ctx.shadowColor = effect.color;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'supernova') {
        // Celestial Pegasus Supernova: concentric expanding nebula rings
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 14;
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'element_fire_blast') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        
        // Expanding fiery ring
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 6 * (1 - ageFactor);
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Radiating hot magma gradient
        const fireGrad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius || 1);
        fireGrad.addColorStop(0, `rgba(239, 68, 68, ${0.35 * (1 - ageFactor)})`);
        fireGrad.addColorStop(0.5, `rgba(249, 115, 22, ${0.18 * (1 - ageFactor)})`);
        fireGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Consistent pseudo-random outward shooting spark particles
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const sparkCount = effect.maxRadius > 400 ? 30 : 18;
        for (let i = 0; i < sparkCount; i++) {
          const angle = pseudoRandom() * Math.PI * 2;
          const speed = 0.35 + pseudoRandom() * 1.15;
          const distance = effect.radius * speed;
          const px = effect.x + Math.cos(angle) * distance;
          const py = effect.y + Math.sin(angle) * distance;
          const size = (3 + pseudoRandom() * 5.5) * (1 - ageFactor);

          ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      else if (effect.type === 'element_poison_burst') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        // Radiant toxic gas ring
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#22c55e';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(16, 185, 129, ${0.12 * (1 - ageFactor)})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Poison bubbling droplets floating outward
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const bubbleCount = effect.maxRadius > 400 ? 24 : 12;
        for (let i = 0; i < bubbleCount; i++) {
          const angle = (i * Math.PI * 2) / bubbleCount + pseudoRandom() * 0.45;
          const dist = effect.radius * (0.25 + pseudoRandom() * 0.65);
          const bx = effect.x + Math.cos(angle) * dist;
          const by = effect.y + Math.sin(angle) * dist;
          const bubbleRadius = (5 + pseudoRandom() * 8.5) * (1 - ageFactor * 0.55);

          ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Bubble glare highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(bx - bubbleRadius * 0.35, by - bubbleRadius * 0.35, bubbleRadius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      else if (effect.type === 'element_water_wave') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        // High frequency hydraulic waves
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#3b82f6';
        
        const wavesCount = effect.maxRadius > 400 ? 4 : 3;
        for (let rOffset = 0; rOffset < wavesCount; rOffset++) {
          const currentR = Math.max(0, effect.radius - rOffset * 30);
          const alpha = Math.max(0, (1 - ageFactor) * (1 - rOffset * 0.25));
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 5 - rOffset;
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, currentR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Concentric filled pool
        ctx.fillStyle = `rgba(59, 130, 246, ${0.08 * (1 - ageFactor)})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Water droplet splash spray
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const sprayCount = effect.maxRadius > 400 ? 32 : 16;
        for (let i = 0; i < sprayCount; i++) {
          const angle = pseudoRandom() * Math.PI * 2;
          const splashDist = effect.radius * (0.45 + pseudoRandom() * 0.55);
          const px = effect.x + Math.cos(angle) * splashDist;
          const py = effect.y + Math.sin(angle) * splashDist;
          const size = (3.5 + pseudoRandom() * 4.5) * (1 - ageFactor);

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#60a5fa';
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 1.6, size * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      else if (effect.type === 'element_sand_whirl') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        const rotation = (Date.now() / 130) % (Math.PI * 2);
        ctx.rotate(rotation);
        
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3 * (1 - ageFactor);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ebd2b0';

        // Draw multiple spiral wind arms to simulate a mini-tornado
        const arms = effect.maxRadius > 400 ? 5 : 3;
        for (let spiralIdx = 0; spiralIdx < arms; spiralIdx++) {
          ctx.beginPath();
          const startAngle = (spiralIdx * Math.PI * 2) / arms;
          for (let a = 0; a < Math.PI * 1.8; a += 0.12) {
            const r = effect.radius * (a / (Math.PI * 1.8)) * 0.85;
            const sx = Math.cos(startAngle + a) * r;
            const sy = Math.sin(startAngle + a) * r;
            if (a === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
        ctx.restore();

        // Orbiting heavy dust/sand grains
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const grainsCount = effect.maxRadius > 400 ? 36 : 20;
        for (let i = 0; i < grainsCount; i++) {
          const baseAngle = pseudoRandom() * Math.PI * 2;
          const angle = baseAngle + ageFactor * 4.5; // spirals outwards orbits
          const dist = effect.radius * (0.2 + pseudoRandom() * 0.8);
          const px = effect.x + Math.cos(angle) * dist;
          const py = effect.y + Math.sin(angle) * dist;
          const size = (1.5 + pseudoRandom() * 3.5) * (1 - ageFactor);

          ctx.fillStyle = pseudoRandom() > 0.5 ? '#f59e0b' : '#fbbf24';
          ctx.fillRect(px - size/2, py - size/2, size, size);
        }
      }
      else if (effect.type === 'element_dirt_rupture') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        // Violent continental floor fractures
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 5 * (1 - ageFactor);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#7c2d12';

        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const fissures = effect.maxRadius > 400 ? 8 : 5;
        for (let f = 0; f < fissures; f++) {
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          const baseAngle = (f * Math.PI * 2) / fissures;
          let cx = effect.x;
          let cy = effect.y;
          const segments = 4;
          for (let s = 1; s <= segments; s++) {
            const segDist = (effect.radius / segments) * s;
            const angle = baseAngle + (pseudoRandom() - 0.5) * 0.45;
            cx = effect.x + Math.cos(angle) * segDist;
            cy = effect.y + Math.sin(angle) * segDist;
            ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        }

        // Mud blocks and shattered rock polygons flying
        const rockCount = effect.maxRadius > 400 ? 24 : 12;
        for (let i = 0; i < rockCount; i++) {
          const angle = pseudoRandom() * Math.PI * 2;
          const debrisDist = effect.radius * (0.35 + pseudoRandom() * 0.65);
          const px = effect.x + Math.cos(angle) * debrisDist;
          const py = effect.y + Math.sin(angle) * debrisDist;
          const size = (4.5 + pseudoRandom() * 7.5) * (1 - ageFactor);
          const rotation = pseudoRandom() * Math.PI * 2 + ageFactor * 4;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(rotation);
          ctx.fillStyle = pseudoRandom() > 0.4 ? '#7c2d12' : '#a16207';
          ctx.beginPath();
          ctx.moveTo(-size/2, -size/3);
          ctx.lineTo(size/2, -size/2);
          ctx.lineTo(size/3, size/2);
          ctx.lineTo(-size/2, size/3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      else if (effect.type === 'element_ice_freeze') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        // Subzero frost crystalline snowflake structures
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 3.5 * (1 - ageFactor);
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#06b6d4';

        const spikes = effect.maxRadius > 400 ? 12 : 6;
        for (let crystalIdx = 0; crystalIdx < spikes; crystalIdx++) {
          const angle = (crystalIdx * Math.PI * 2) / spikes;
          const endX = effect.x + Math.cos(angle) * effect.radius;
          const endY = effect.y + Math.sin(angle) * effect.radius;

          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Branches for spiky geometric snowflake shape
          const branchLength = effect.radius * 0.22;
          const midX = effect.x + Math.cos(angle) * effect.radius * 0.55;
          const midY = effect.y + Math.sin(angle) * effect.radius * 0.55;

          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(angle - Math.PI / 4) * branchLength, midY + Math.sin(angle - Math.PI / 4) * branchLength);
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(angle + Math.PI / 4) * branchLength, midY + Math.sin(angle + Math.PI / 4) * branchLength);
          ctx.stroke();
        }

        // Subzero freeze haze background
        ctx.fillStyle = `rgba(6, 182, 212, ${0.08 * (1 - ageFactor)})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering diamond crystals
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const shimmerCount = effect.maxRadius > 400 ? 24 : 14;
        for (let i = 0; i < shimmerCount; i++) {
          const angle = pseudoRandom() * Math.PI * 2;
          const dist = effect.radius * (0.25 + pseudoRandom() * 0.75);
          const px = effect.x + Math.cos(angle) * dist;
          const py = effect.y + Math.sin(angle) * dist;
          const size = (3.5 + pseudoRandom() * 5.5) * (1 - ageFactor);

          ctx.save();
          ctx.translate(px, py);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.65, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.65, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      else if (effect.type === 'element_wind_cyclone') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;

        ctx.save();
        ctx.translate(effect.x, effect.y);
        const rotation = -(Date.now() / 110) % (Math.PI * 2);
        ctx.rotate(rotation);
        
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#94a3b8';

        // Swirling vortex hurricane arms
        const arms = effect.maxRadius > 400 ? 4 : 3;
        for (let arm = 0; arm < arms; arm++) {
          const startAngle = (arm * Math.PI * 2) / arms;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.15) {
            const r = effect.radius * (a / (Math.PI * 2)) * 0.95;
            const wx = Math.cos(startAngle + a) * r;
            const wy = Math.sin(startAngle + a) * r;
            if (a === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
        ctx.restore();

        // High-velocity wind shear vectors orbiting
        let seed = 0;
        for (let charIndex = 0; charIndex < effect.id.length; charIndex++) {
          seed += effect.id.charCodeAt(charIndex);
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        const shearsCount = effect.maxRadius > 400 ? 28 : 15;
        for (let i = 0; i < shearsCount; i++) {
          const baseAngle = pseudoRandom() * Math.PI * 2;
          const angle = baseAngle - ageFactor * 3.5; // spirals inwards
          const dist = effect.radius * (0.35 + pseudoRandom() * 0.65);
          const px = effect.x + Math.cos(angle) * dist;
          const py = effect.y + Math.sin(angle) * dist;
          const length = (10 + pseudoRandom() * 16) * (1 - ageFactor);

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle + Math.PI / 2); // tangent line orientation
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(0, -length / 2);
          ctx.lineTo(0, length / 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      else if (effect.type === 'element_lightning_surge') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 5 * (1 - ageFactor);
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#eab308';

        // Jagged electric arcs branching outwards
        const arcs = 8;
        for (let a = 0; a < arcs; a++) {
          const baseAngle = (a / arcs) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          let currR = 0;
          let currA = baseAngle;
          while (currR < effect.radius) {
            currR += 20 + Math.random() * 25;
            currA += (Math.random() - 0.5) * 0.5;
            ctx.lineTo(Math.cos(currA) * currR, Math.sin(currA) * currR);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      else if (effect.type === 'element_light_beam') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f59e0b';

        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cross of Holy Light
        const beamW = 12 * (1 - ageFactor);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-effect.radius, -beamW / 2, effect.radius * 2, beamW);
        ctx.fillRect(-beamW / 2, -effect.radius, beamW, effect.radius * 2);
        ctx.restore();
      }
      else if (effect.type === 'element_shadow_void') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 6 * (1 - ageFactor);
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#8b5cf6';

        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner Void singularity
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.4 * (1 - ageFactor), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else if (effect.type === 'element_magma_eruption') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, effect.radius));
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(0.6, '#ef4444');
        grad.addColorStop(1, 'rgba(120, 28, 9, 0)');

        ctx.fillStyle = grad;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else if (effect.type === 'element_cosmos_burst') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ec4899';

        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Cosmic star burst rays
        const rays = 12;
        for (let r = 0; r < rays; r++) {
          const angle = (r / rays) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * effect.radius * 1.2, Math.sin(angle) * effect.radius * 1.2);
          ctx.stroke();
        }
        ctx.restore();
      }
      else if (effect.type === 'foxfire') {
        // Void Kitsune Foxfire cluster: 9 homing glowing fireballs orbiting the center
        const timeFactor = (Date.now() / 200) % (Math.PI * 2);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f43f5e';
        
        for (let i = 0; i < 9; i++) {
          const angle = timeFactor + (i * Math.PI * 2) / 9;
          const dist = effect.radius * 0.85;
          const fx = effect.x + Math.cos(angle) * dist;
          const fy = effect.y + Math.sin(angle) * dist;
          
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(fx, fy, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      else if (effect.type === 'blackhole') {
        const spiralAngle = (Date.now() / 100) % (Math.PI * 2);
        ctx.translate(effect.x, effect.y);
        ctx.rotate(spiralAngle);
        
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#d946ef';
        
        // Swirling stellar ring background
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.3, '#3b0764');
        grad.addColorStop(0.7, '#d946ef');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.fill();

        // Dark central singularity sphere
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 45;
        ctx.shadowColor = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();

        // Draw starlight filament links
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const ang = (j * Math.PI) / 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 45, Math.sin(ang) * 45);
        }
        ctx.stroke();
      }
      else if (effect.type === 'beams_beams') {
        // High-speed 0.1s celestial starburst flash
        ctx.save();
        ctx.translate(effect.x, effect.y);
        
        const elapsed = Date.now() - effect.startTime;
        const ageFactor = Math.min(1, Math.max(0, elapsed / 100));
        const alpha = 1 - ageFactor;
        
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 40 * alpha;
        ctx.shadowColor = '#f472b6';
        
        // Central solar high-intensity burst
        const radialGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 64 * alpha + 1);
        radialGrad.addColorStop(0, '#ffffff');
        radialGrad.addColorStop(0.3, '#f472b6');
        radialGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 64 * alpha + 1, 0, Math.PI * 2);
        ctx.fill();

        // Sharp celestial star-flare crossbeams
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4 * alpha;
        ctx.beginPath();
        
        // Horizontal beam line
        ctx.moveTo(-120 * alpha, 0);
        ctx.lineTo(120 * alpha, 0);
        
        // Vertical beam line
        ctx.moveTo(0, -120 * alpha);
        ctx.lineTo(0, 120 * alpha);
        ctx.stroke();
        
        ctx.restore();
      }
      else if (effect.type === 'cosmic_genesis') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const currentR = effect.radius;
        
        ctx.shadowBlur = 45;
        ctx.shadowColor = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8 * (1 - ageFactor);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * (1 - ageFactor)})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6 * (1 - ageFactor);
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 20;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(effect.x + Math.cos(angle) * currentR, effect.y + Math.sin(angle) * currentR);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 25 * (1 - ageFactor), 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'abyssal_obliteration') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const currentR = effect.radius;
        const rot = (Date.now() / 80) % (Math.PI * 2);
        
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(rot);
        
        ctx.shadowBlur = 45;
        ctx.shadowColor = '#ec4899';
        
        ctx.lineWidth = 5;
        for (let offset = 0; offset < 3; offset++) {
          ctx.strokeStyle = offset === 0 ? '#ec4899' : (offset === 1 ? '#a855f7' : '#db2777');
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 4; a += 0.1) {
            const r = (currentR * (1 - ageFactor)) * (a / (Math.PI * 4)) + (offset * 15);
            if (r < currentR) {
              const cx = Math.cos(a) * r;
              const cy = Math.sin(a) * r;
              if (a === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
            }
          }
          ctx.stroke();
        }

        ctx.fillStyle = '#09090b';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, currentR * 0.45 * (1 - ageFactor), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else if (effect.type === 'ragnarok_supernova') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const currentR = effect.radius * 1.5;
        
        ctx.shadowBlur = 55;
        ctx.shadowColor = '#ef4444';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 14 * (1 - ageFactor);
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fcf300';
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(239, 68, 68, ${0.12 * (1 - ageFactor)})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        for (let i = 0; i < 15; i++) {
          const ang = (i * Math.PI * 2) / 15 + (ageFactor * Math.PI);
          const dist = currentR * 0.5 + Math.sin(ageFactor * 10 + i) * (currentR * 0.4);
          const px = effect.x + Math.cos(ang) * dist;
          const py = effect.y + Math.sin(ang) * dist;
          ctx.fillRect(px - 6, py - 6, 12, 12);
        }
      }
      else if (effect.type === 'omega_extermination') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const currentR = effect.radius;
        const swirl = (Date.now() / 120) % (Math.PI * 2);

        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(swirl);
        
        const starGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, currentR || 1);
        starGrad.addColorStop(0, '#ffffff');
        starGrad.addColorStop(0.2, '#c084fc');
        starGrad.addColorStop(0.6, '#6366f1');
        starGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = starGrad;
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, currentR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e0a7ff';
        ctx.lineWidth = 5 * (1 - ageFactor);
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const ang = (i * Math.PI) / 6;
          const flX = Math.cos(ang) * currentR;
          const flY = Math.sin(ang) * currentR;
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(Math.cos(ang + 0.3) * currentR * 0.5, Math.sin(ang + 0.3) * currentR * 0.5, flX, flY);
        }
        ctx.stroke();
        ctx.restore();
      }
      else if (effect.type === 'cosmic_rupture') {
        // The Archon Overseer space-time distortion field (Realm Expansion) - Ultra Polished & Lag-Free!
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const currentR = effect.radius; // expands up to 1500
        
        ctx.shadowBlur = 0; // Disable slow shadowBlur to guarantee smooth 60fps rendering
        ctx.globalCompositeOperation = 'screen'; // Screen blend mode for brilliant high-energy blending!
        
        // 1. Radiant holographic space-time expanding bubble wave
        const rGrad = ctx.createRadialGradient(effect.x, effect.y, currentR * 0.8, effect.x, effect.y, currentR + 4);
        rGrad.addColorStop(0, 'rgba(0, 255, 204, 0)');
        rGrad.addColorStop(0.7, 'rgba(0, 255, 204, 0.25)'); // glowing cyan inner transition
        rGrad.addColorStop(0.92, 'rgba(168, 85, 247, 0.45)'); // stunning cosmic ultraviolet horizon ring
        rGrad.addColorStop(0.97, 'rgba(255, 255, 255, 0.8)'); // bright electric white spark edge
        rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, currentR + 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. Space Slices / Space-time cracks: Razor thin, lightning-fast neon laser fractures
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 1.2 * (1 - ageFactor);
        
        const segmentCount = 12;
        const offsetRotation = (Date.now() / 800) % (Math.PI * 2);
        
        ctx.beginPath();
        for (let i = 0; i < segmentCount; i++) {
          const angle = offsetRotation + (i * Math.PI * 2) / segmentCount;
          // Inner starting offset to prevent clashing with the central eye
          const startX = effect.x + Math.cos(angle) * 70;
          const startY = effect.y + Math.sin(angle) * 70;
          const endX = effect.x + Math.cos(angle) * currentR;
          const endY = effect.y + Math.sin(angle) * currentR;
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
        }
        ctx.stroke();

        // 3. Chrono Coordinate Concentric Rings (Space-time coordinate lattices)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)'; // deep cosmic amethyst lines
        ctx.lineWidth = 1.0;
        
        for (let ring = 1; ring <= 4; ring++) {
          const ringR = currentR * (ring / 4);
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw geometric orbit nodes for a cybernetic "Lock-on" look
          ctx.fillStyle = '#00ffcc';
          const nodeRotate = offsetRotation * (ring % 2 === 0 ? 1 : -1.2);
          for (let node = 0; node < 4; node++) {
            const nodeAngle = nodeRotate + (node * Math.PI) / 2;
            const nx = effect.x + Math.cos(nodeAngle) * ringR;
            const ny = effect.y + Math.sin(nodeAngle) * ringR;
            ctx.beginPath();
            ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // 4. All-Seeing Central Core Aura
        const eyeGrad = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, 85 * (1 - ageFactor) + 1);
        eyeGrad.addColorStop(0, '#ffffff'); // bright singular core
        eyeGrad.addColorStop(0.25, '#00ffcc'); // neon teal core bounds
        eyeGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.35)'); // ultraviolet glow
        eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 85 * (1 - ageFactor) + 1, 0, Math.PI * 2);
        ctx.fill();
        
        // 5. High-Tech Rotating Digital Grid Target (Square Glyph surrounding the core)
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(-offsetRotation * 1.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5 * (1 - ageFactor);
        const sqSize = 48 * (1 - ageFactor);
        ctx.strokeRect(-sqSize / 2, -sqSize / 2, sqSize, sqSize);
        // Crosshair ticks
        ctx.beginPath();
        ctx.moveTo(-sqSize * 0.7, 0); ctx.lineTo(-sqSize * 0.4, 0);
        ctx.moveTo(sqSize * 0.7, 0);  ctx.lineTo(sqSize * 0.4, 0);
        ctx.moveTo(0, -sqSize * 0.7); ctx.lineTo(0, -sqSize * 0.4);
        ctx.moveTo(0, sqSize * 0.7);  ctx.lineTo(0, sqSize * 0.4);
        ctx.stroke();
        ctx.restore();
        
        ctx.globalCompositeOperation = 'source-over'; // Reset blend mode to default
      }
      else if (effect.type === 'chill_hypnotize_aura') {
        const ageFactor = effect.maxRadius > 0 ? (effect.radius / effect.maxRadius) : 0;
        const alpha = Math.max(0, 1 - ageFactor);
        ctx.save();
        ctx.translate(effect.x, effect.y);
        
        // Zen expanding lime-green and tranquil bamboo rings
        ctx.strokeStyle = `rgba(132, 204, 22, ${alpha * 0.85})`;
        ctx.lineWidth = 4 * (1 - ageFactor);
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(163, 230, 53, ${alpha * 0.6})`;
        ctx.lineWidth = 2 * (1 - ageFactor);
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, effect.radius));
        grad.addColorStop(0, `rgba(132, 204, 22, ${alpha * 0.22})`);
        grad.addColorStop(0.7, `rgba(163, 230, 53, ${alpha * 0.08})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
        ctx.fill();

        // 4 floating tranquil leaf/zen ripples
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI / 2) + (Date.now() / 400);
          const dist = effect.radius * 0.6;
          ctx.fillStyle = `rgba(163, 230, 53, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 4 * (1 - ageFactor), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      else if (effect.type === 'custom_laser' as any) {
        const targetX = (effect as any).targetX;
        const targetY = (effect as any).targetY;
        if (targetX !== undefined && targetY !== undefined) {
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Add central white core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }
      }
      else if (effect.type === 'glitch') {
        // Matrix glitched square matrices popping in combat
        ctx.fillStyle = '#22c55e';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#22c55e';
        for (let i = 0; i < 5; i++) {
          const sx = effect.x + (Math.random() - 0.5) * 200;
          const sy = effect.y + (Math.random() - 0.5) * 200;
          ctx.fillRect(sx, sy, 25, 25);
        }
      }
      else if (effect.type === 'enemy_missile') {
        // Red-glowing active stun projectile shot by elite/boss enemies
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f43f5e';
        
        // Draw trailing plasma flame
        const grad = ctx.createRadialGradient(effect.x, effect.y, 1, effect.x, effect.y, 8);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#f43f5e');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Solid core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else if (effect.type === 'titan_seismic_stomp') {
        // High energy physical expansion wave
        const skin = (effect as any).titanSkin || 'standard';
        let strokeOuter = '#f97316';
        let strokeInner = '#00f0ff';
        let fillCol = 'rgba(249, 115, 22, 0.1)';
        let shadowCol = '#f97316';

        if (skin === 'upgraded_titan_tv_man') {
          strokeOuter = '#7e22ce';
          strokeInner = '#ec4899';
          fillCol = 'rgba(168, 85, 247, 0.1)';
          shadowCol = '#d946ef';
        } else if (skin === 'upgraded_titan_speakerman') {
          strokeOuter = '#b91c1c';
          strokeInner = '#f43f5e';
          fillCol = 'rgba(239, 68, 68, 0.1)';
          shadowCol = '#ef4444';
        } else if (skin === 'upgraded_titan_cameraman') {
          strokeOuter = '#2563eb';
          strokeInner = '#00f0ff';
          fillCol = 'rgba(59, 130, 246, 0.1)';
          shadowCol = '#3b82f6';
        } else if (skin === 'titan_drillman') {
          strokeOuter = '#f97316';
          strokeInner = '#eab308';
          fillCol = 'rgba(249, 115, 22, 0.1)';
          shadowCol = '#ca8a04';
        } else if (skin === 'titan_clockman') {
          strokeOuter = '#06b6d4';
          strokeInner = '#facc15';
          fillCol = 'rgba(6, 182, 212, 0.1)';
          shadowCol = '#eab308';
        }

        ctx.strokeStyle = strokeOuter;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = shadowCol;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = strokeInner;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(0, effect.radius - 20), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = fillCol;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'titan_plasma_burn') {
        // Glowing atomic plasma fire rings
        const skin = (effect as any).titanSkin || 'standard';
        let strokeColor = '#8b5cf6';
        let shadowColor = '#00f0ff';
        let fillColor = 'rgba(6, 182, 212, 0.12)';

        if (skin === 'upgraded_titan_tv_man') {
          strokeColor = '#ec4899';
          shadowColor = '#a855f7';
          fillColor = 'rgba(168, 85, 247, 0.15)';
        } else if (skin === 'upgraded_titan_speakerman') {
          strokeColor = '#ef4444';
          shadowColor = '#b91c1c';
          fillColor = 'rgba(239, 68, 68, 0.15)';
        } else if (skin === 'upgraded_titan_cameraman') {
          strokeColor = '#3b82f6';
          shadowColor = '#00f0ff';
          fillColor = 'rgba(59, 130, 246, 0.15)';
        } else if (skin === 'titan_drillman') {
          strokeColor = '#f97316';
          shadowColor = '#ea580c';
          fillColor = 'rgba(249, 115, 22, 0.15)';
        } else if (skin === 'titan_clockman') {
          strokeColor = '#eab308';
          shadowColor = '#06b6d4';
          fillColor = 'rgba(234, 179, 8, 0.15)';
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 25;
        ctx.shadowColor = shadowColor;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      else if (effect.type === 'titan_mecha_slam') {
        // 🦾 DUAL HYDRAULIC MECHA HANDS KINETIC CRUSH SLAM
        const isUpgraded = Boolean((effect as any).isUpgraded);
        const col = effect.color || '#00f0ff';
        const curRadius = effect.radius || 12;
        const maxR = effect.maxRadius || 120;
        const slamProgress = curRadius / maxR;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // 1. Kinetic shockwave outer ring with high glow
        ctx.strokeStyle = col;
        ctx.lineWidth = isUpgraded ? 4.5 : 3.0;
        ctx.shadowBlur = isUpgraded ? 22 : 14;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, curRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 2. High-frequency secondary compression ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(0, curRadius * 0.75), 0, Math.PI * 2);
        ctx.stroke();

        // 3. Ground impact crater / glowing energy core
        ctx.fillStyle = isUpgraded ? 'rgba(6, 182, 212, 0.22)' : 'rgba(56, 189, 248, 0.14)';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, curRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Kinetic debris and mechanical spark shards radiating outwards
        const shardCount = isUpgraded ? 12 : 8;
        for (let i = 0; i < shardCount; i++) {
          const a = (i * Math.PI * 2) / shardCount + slamProgress * 1.5;
          const sDist = curRadius * 0.95;
          const sx = effect.x + Math.cos(a) * sDist;
          const sy = effect.y + Math.sin(a) * sDist;
          const shardLength = (1 - slamProgress) * 12;
          
          ctx.strokeStyle = i % 2 === 0 ? col : '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(a) * shardLength, sy + Math.sin(a) * shardLength);
          ctx.stroke();
        }

        // 5. Heavy Hydraulic Impact Fist imprint in the center during initial impact
        if (slamProgress < 0.45) {
          const fistAlpha = 1 - (slamProgress / 0.45);
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, opacity * fistAlpha));
          ctx.fillStyle = col;
          ctx.font = `bold ${isUpgraded ? 18 : 14}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💥', effect.x, effect.y);
          ctx.restore();
        }

        ctx.restore();
      }
      else if (effect.type === 'titan_glitch_broadcast') {
        // Epic TV scanning matrix line pattern covering the screen
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)'; // CRT phosphor green
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Expanding circular grid lines
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'; // Cyber cyan
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, Math.max(0, effect.radius - 30), 0, Math.PI * 2);
        ctx.stroke();

        // Draw horizontal raster scanlines inside the shockwave
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
        ctx.lineWidth = 1.5;
        const startY = Math.max(0, effect.y - effect.radius);
        const endY = Math.min(600, effect.y + effect.radius); // canvas height limit
        for (let sY = startY; sY < endY; sY += 8) {
          ctx.beginPath();
          ctx.moveTo(effect.x - effect.radius, sY);
          ctx.lineTo(effect.x + effect.radius, sY);
          ctx.stroke();
        }
      }
      else if (effect.type === 'titan_side_lasers') {
        // FORM 1: Dual side lasers firing from left and right flanks (Upgraded: 4 Lasers!)
        const targetX = (effect as any).targetX ?? (effect.x + 800 * Math.cos(effect.angle || 0));
        const targetY = (effect as any).targetY ?? (effect.y + 800 * Math.sin(effect.angle || 0));
        const perpX = -Math.sin(effect.angle || 0) * 35;
        const perpY = Math.cos(effect.angle || 0) * 35;

        const hasCannons = (effect as any).titanLaserCannonsUpgrade;
        const beamMultipliers = hasCannons ? [1, -1, 0.5, -0.5] : [1, -1];
        const beamColor = effect.color || '#38bdf8';
        const shadowColor = effect.color === '#a855f7' ? '#c084fc' : '#00f0ff';

        beamMultipliers.forEach(mult => {
          const px = perpX * mult;
          const py = perpY * mult;

          ctx.strokeStyle = beamColor;
          ctx.lineWidth = hasCannons ? 7 : 10;
          ctx.shadowBlur = 18;
          ctx.shadowColor = shadowColor;
          ctx.beginPath();
          ctx.moveTo(effect.x + px, effect.y + py);
          ctx.lineTo(targetX + px, targetY + py);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = hasCannons ? 2.5 : 3.5;
          ctx.beginPath();
          ctx.moveTo(effect.x + px, effect.y + py);
          ctx.lineTo(targetX + px, targetY + py);
          ctx.stroke();
        });
      }
      else if (effect.type === 'titan_merged_laser') {
        // 2ND FORM: GREAT DEFENDER - Giant Merged Laser Beam
        const targetX = (effect as any).targetX ?? (effect.x + 1000 * Math.cos(effect.angle || 0));
        const targetY = (effect as any).targetY ?? (effect.y + 1000 * Math.sin(effect.angle || 0));

        const hasCannons = (effect as any).titanLaserCannonsUpgrade;
        const outerWidth = hasCannons ? 38 : 26;
        const innerWidth = hasCannons ? 20 : 14;
        const coreWidth = hasCannons ? 10 : 6;
        const beamColor = effect.color || '#38bdf8';
        const shadowColor = effect.color === '#a855f7' ? '#c084fc' : '#00f0ff';

        // Outer Plasma Aura
        ctx.strokeStyle = beamColor === '#38bdf8' ? '#0284c7' : '#7e22ce';
        ctx.lineWidth = outerWidth;
        ctx.shadowBlur = 35;
        ctx.shadowColor = shadowColor;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Inner Core
        ctx.strokeStyle = beamColor;
        ctx.lineWidth = innerWidth;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // White Hot Center Thread
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = coreWidth;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Orbiting Gold Energy Spirals along the beam
        const len = Math.sqrt((targetX - effect.x)**2 + (targetY - effect.y)**2);
        const rot = Date.now() / 80;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let d = 0; d < len; d += 15) {
          const ratio = d / len;
          const px = effect.x + (targetX - effect.x) * ratio;
          const py = effect.y + (targetY - effect.y) * ratio;
          const offset = Math.sin(rot + ratio * 10) * 16;
          const pX = -Math.sin(effect.angle || 0) * offset;
          const pY = Math.cos(effect.angle || 0) * offset;
          if (d === 0) ctx.moveTo(px + pX, py + pY); else ctx.lineTo(px + pX, py + pY);
        }
        ctx.stroke();
      }
      else if (effect.type === 'titan_multiverse_blast' as any) {
        // 3RD FORM: MULTIVERSE WATCHER - COSMIC SINGULARITY GRID-SHAKING BLAST (2ND ARCANE)
        const targetX = (effect as any).targetX ?? (effect.x + 1200 * Math.cos(effect.angle || 0));
        const targetY = (effect as any).targetY ?? (effect.y + 1200 * Math.sin(effect.angle || 0));

        ctx.save();
        // 1. Massive Colossal Gravitational Beam Aura
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 60;
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 2. Violet Accretion Plasma
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 32;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 3. Electric Cyan Spatial Tear
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 4. Void Singularity Inner Ray
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 5. White Core Laser Thread
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 6. Impact Black Hole Singularity Explosion at Target
        const pulse = Math.sin(Date.now() / 60) * 8;
        const blastGrad = ctx.createRadialGradient(targetX, targetY, 5, targetX, targetY, 80 + pulse);
        blastGrad.addColorStop(0, '#ffffff');
        blastGrad.addColorStop(0.2, '#f43f5e');
        blastGrad.addColorStop(0.5, '#a855f7');
        blastGrad.addColorStop(0.8, '#38bdf8');
        blastGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = blastGrad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 80 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Black Hole Core at impact
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#c084fc';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 22 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Singularity Shockwave Ring
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 65 + pulse * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
      else if (effect.type === 'warper_merged_laser' as any) {
        // WARPER FORM 2: COLOSSAL TITAN MEGALASER WITH CUSTOM SKIN PALETTE
        const targetX = (effect as any).targetX ?? (effect.x + 1600 * Math.cos(effect.angle || 0));
        const targetY = (effect as any).targetY ?? (effect.y + 1600 * Math.sin(effect.angle || 0));
        const warperSkin = (effect as any).warperSkin || 'standard';

        let bloomColor = 'rgba(168, 85, 247, 0.05)';
        let outerColor = '#6b21a8';
        let outerShadow = '#d946ef';
        let midColor = '#a855f7';
        let midShadow = '#c084fc';
        let innerColor = '#e879f9';
        let spiralColor1 = '#f472b6';
        let spiralColor2 = '#c084fc';

        if (warperSkin === 'void_lord') {
          bloomColor = 'rgba(220, 38, 38, 0.08)';
          outerColor = '#7f1d1d';
          outerShadow = '#ef4444';
          midColor = '#dc2626';
          midShadow = '#f87171';
          innerColor = '#fca5a5';
          spiralColor1 = '#ef4444';
          spiralColor2 = '#f87171';
        } else if (warperSkin === 'cyber_matrix') {
          bloomColor = 'rgba(6, 182, 212, 0.08)';
          outerColor = '#0e7490';
          outerShadow = '#00f0ff';
          midColor = '#06b6d4';
          midShadow = '#38bdf8';
          innerColor = '#a5f3fc';
          spiralColor1 = '#00f0ff';
          spiralColor2 = '#38bdf8';
        } else if (warperSkin === 'celestial_archon') {
          bloomColor = 'rgba(234, 179, 8, 0.08)';
          outerColor = '#854d0e';
          outerShadow = '#facc15';
          midColor = '#eab308';
          midShadow = '#fde047';
          innerColor = '#fef9c3';
          spiralColor1 = '#facc15';
          spiralColor2 = '#ffffff';
        } else if (warperSkin === 'hypernova_eclipse') {
          bloomColor = 'rgba(234, 88, 12, 0.08)';
          outerColor = '#9a3412';
          outerShadow = '#ea580c';
          midColor = '#ea580c';
          midShadow = '#f97316';
          innerColor = '#fed7aa';
          spiralColor1 = '#f97316';
          spiralColor2 = '#fef08a';
        }

        // 1. Screen subtle aura bloom
        ctx.fillStyle = bloomColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 2. Colossal Outer Plasma Aura (56px)
        ctx.strokeStyle = outerColor;
        ctx.lineWidth = 56;
        ctx.shadowBlur = 50;
        ctx.shadowColor = outerShadow;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 3. Radiant Intermediate Aura (34px)
        ctx.strokeStyle = midColor;
        ctx.lineWidth = 34;
        ctx.shadowBlur = 30;
        ctx.shadowColor = midShadow;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 4. Bright Core (18px)
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 5. White Hot Center Thread (8px)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // 6. Orbiting Lightning Spirals along the giant beam
        const len = Math.sqrt((targetX - effect.x)**2 + (targetY - effect.y)**2);
        const rot = Date.now() / 60;
        ctx.strokeStyle = spiralColor1;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = spiralColor1;
        ctx.beginPath();
        for (let d = 0; d < len; d += 12) {
          const ratio = d / len;
          const px = effect.x + (targetX - effect.x) * ratio;
          const py = effect.y + (targetY - effect.y) * ratio;
          const offset = Math.sin(rot + ratio * 14) * 26;
          const pX = -Math.sin(effect.angle || 0) * offset;
          const pY = Math.cos(effect.angle || 0) * offset;
          if (d === 0) ctx.moveTo(px + pX, py + pY); else ctx.lineTo(px + pX, py + pY);
        }
        ctx.stroke();

        // Secondary counter-spiral
        ctx.strokeStyle = spiralColor2;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let d = 0; d < len; d += 12) {
          const ratio = d / len;
          const px = effect.x + (targetX - effect.x) * ratio;
          const py = effect.y + (targetY - effect.y) * ratio;
          const offset = Math.cos(rot + ratio * 14) * 20;
          const pX = -Math.sin(effect.angle || 0) * offset;
          const pY = Math.cos(effect.angle || 0) * offset;
          if (d === 0) ctx.moveTo(px + pX, py + pY); else ctx.lineTo(px + pX, py + pY);
        }
        ctx.stroke();
      }
      else if (effect.type === 'warper_blade_slash' as any) {
        // ASTRAL VOID BLADE RAPID SLICING CLEAVE
        const warperSkin = (effect as any).warperSkin || 'standard';
        const radius = effect.maxRadius || 260;
        const progress = Math.min(1, Math.max(0, (now - effect.startTime) / effect.duration));
        const rotAngle = (effect.angle || 0) + progress * Math.PI * 2.5;

        let bladeColor = '#d946ef';
        let bladeGlow = '#a855f7';
        let bladeCore = '#f5d0fe';
        if (warperSkin === 'void_lord') {
          bladeColor = '#ef4444'; bladeGlow = '#dc2626'; bladeCore = '#fca5a5';
        } else if (warperSkin === 'cyber_matrix') {
          bladeColor = '#00f0ff'; bladeGlow = '#0284c7'; bladeCore = '#ffffff';
        } else if (warperSkin === 'celestial_archon') {
          bladeColor = '#facc15'; bladeGlow = '#eab308'; bladeCore = '#fef9c3';
        } else if (warperSkin === 'hypernova_eclipse') {
          bladeColor = '#f97316'; bladeGlow = '#ea580c'; bladeCore = '#fef08a';
        }

        ctx.save();
        ctx.translate(effect.x, effect.y);

        // 1. Expanding Blade Cleave Shockwave Ring
        const ringR = radius * (0.3 + progress * 0.7);
        ctx.strokeStyle = bladeGlow;
        ctx.lineWidth = Math.max(1, (1 - progress) * 8);
        ctx.globalAlpha = (1 - progress) * 0.8;
        ctx.shadowBlur = 25;
        ctx.shadowColor = bladeColor;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Dual Spinning Razor Crescent Slash Waves
        ctx.globalAlpha = 1 - progress * 0.6;
        for (let s = 0; s < 2; s++) {
          const slashAngle = rotAngle + s * Math.PI;
          ctx.save();
          ctx.rotate(slashAngle);
          
          // Outer glowing crescent arc
          ctx.strokeStyle = bladeColor;
          ctx.lineWidth = 8;
          ctx.shadowBlur = 20;
          ctx.shadowColor = bladeGlow;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.85, -0.6, 0.6);
          ctx.stroke();

          // Inner bright blade edge
          ctx.strokeStyle = bladeCore;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.85, -0.4, 0.4);
          ctx.stroke();

          // Slicing particle sparks along the blade arc
          for (let p = 0; p < 5; p++) {
            const sparkA = -0.5 + p * 0.25;
            const sx = Math.cos(sparkA) * (radius * 0.85);
            const sy = Math.sin(sparkA) * (radius * 0.85);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx - 2, sy - 2, 4, 4);
          }
          ctx.restore();
        }

        // 3. Dimensional Cross-Slash Incision in Center
        ctx.strokeStyle = bladeCore;
        ctx.lineWidth = (1 - progress) * 4;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.45, -radius * 0.45);
        ctx.lineTo(radius * 0.45, radius * 0.45);
        ctx.moveTo(radius * 0.45, -radius * 0.45);
        ctx.lineTo(-radius * 0.45, radius * 0.45);
        ctx.stroke();

        ctx.restore();
      }
      else if (effect.type === 'warper_lasers' as any) {
        // WARPER FORM 1, Flank Lasers & Armoured Titan Heavy Cannons
        const targetX = (effect as any).targetX ?? (effect.x + 1200 * Math.cos(effect.angle || 0));
        const targetY = (effect as any).targetY ?? (effect.y + 1200 * Math.sin(effect.angle || 0));
        const warperSkin = (effect as any).warperSkin || 'standard';
        const isHeavyCannon = !!(effect as any).isHeavyCannon;

        let outerColor = isHeavyCannon ? '#0369a1' : '#7e22ce';
        let shadowColor = isHeavyCannon ? '#00f0ff' : '#d946ef';
        let innerColor = isHeavyCannon ? '#38bdf8' : '#c084fc';

        if (!isHeavyCannon) {
          if (warperSkin === 'void_lord') {
            outerColor = '#991b1b';
            shadowColor = '#ef4444';
            innerColor = '#f87171';
          } else if (warperSkin === 'cyber_matrix') {
            outerColor = '#0e7490';
            shadowColor = '#00f0ff';
            innerColor = '#38bdf8';
          } else if (warperSkin === 'celestial_archon') {
            outerColor = '#a16207';
            shadowColor = '#facc15';
            innerColor = '#fde047';
          } else if (warperSkin === 'hypernova_eclipse') {
            outerColor = '#c2410c';
            shadowColor = '#ea580c';
            innerColor = '#fb923c';
          }
        }

        // Outer Aura
        ctx.strokeStyle = outerColor;
        ctx.lineWidth = isHeavyCannon ? 26 : 20;
        ctx.shadowBlur = isHeavyCannon ? 35 : 30;
        ctx.shadowColor = shadowColor;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Inner Core
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = isHeavyCannon ? 13 : 10;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // White Center
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHeavyCannon ? 4.5 : 3.5;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Heavy Cannon Muzzle Flare
        if (isHeavyCannon) {
          ctx.save();
          ctx.fillStyle = '#00f0ff';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#38bdf8';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      else if (effect.type === 'titan_ultra_laser') {
        // ACTIVE SKILL: ULTRA LASER (30s SCREEN-SHATTERING MEGA BEAM)
        const angle = effect.angle || 0;
        const targetX = effect.x + 1600 * Math.cos(angle);
        const targetY = effect.y + 1600 * Math.sin(angle);
        const laserColor = effect.color || '#38bdf8';
        const isRed = laserColor === '#e11d48';

        // Blinding screen pulse
        ctx.fillStyle = isRed ? 'rgba(225, 29, 72, 0.08)' : 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Colossal Megabeam (64px wide)
        ctx.strokeStyle = isRed ? '#9f1239' : '#0284c7';
        ctx.lineWidth = 64;
        ctx.shadowBlur = 50;
        ctx.shadowColor = isRed ? '#f43f5e' : '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        ctx.strokeStyle = laserColor;
        ctx.lineWidth = 38;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Disintegrating Electric Arc Flares
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        const timeOffset = Date.now() / 50;
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
          const ratio = (i / 20);
          const px = effect.x + (targetX - effect.x) * ratio;
          const py = effect.y + (targetY - effect.y) * ratio;
          const offset = Math.sin(timeOffset + i) * 32;
          const pX = -Math.sin(angle) * offset;
          const pY = Math.cos(angle) * offset;
          ctx.arc(px + pX, py + pY, 3, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
      else if (effect.type === 'crit_text') {
        const elapsed = Date.now() - effect.startTime;
        const duration = effect.duration || 750;
        const progress = Math.min(1, Math.max(0, elapsed / duration));

        // Smooth vertical float with subtle arc easing
        const floatY = effect.y - (32 * Math.pow(progress, 0.72));
        const floatX = effect.x + Math.sin(progress * 5) * 1.5;

        // Snappy scale pop-in (springs up to 1.35x then settles to ~1.0x)
        const scale = progress < 0.15 
          ? 0.35 + (progress / 0.15) * 1.0 
          : Math.max(0.75, 1.35 - ((progress - 0.15) / 0.85) * 0.45);

        // Alpha fade out during latter half
        const alpha = progress > 0.65 ? Math.max(0, (1 - progress) / 0.35) : 1.0;
        const elementCol = effect.color || '#ef4444';

        // 1. Draw radiant elemental spark burst particles exploding outward (Hardware-accelerated additive blend)
        const particleCount = isMobile ? 3 : 5;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < particleCount; i++) {
          const pAngle = (i / particleCount) * Math.PI * 2 + (effect.startTime % 1000) * 0.01;
          const pDist = 6 + progress * 24;
          const px = effect.x + Math.cos(pAngle) * pDist;
          const py = effect.y - 6 + Math.sin(pAngle) * (pDist * 0.65) - (progress * 10);
          const pAlpha = Math.max(0, (1 - progress * 1.25)) * alpha;
          const pSize = Math.max(0.6, (1 - progress) * 3.2);

          ctx.globalAlpha = pAlpha;
          ctx.fillStyle = elementCol;

          // Diamond spark shape
          ctx.beginPath();
          ctx.moveTo(px, py - pSize * 1.6);
          ctx.lineTo(px + pSize, py);
          ctx.lineTo(px, py + pSize * 1.6);
          ctx.lineTo(px - pSize, py);
          ctx.closePath();
          ctx.fill();

          // Bright center sparkle core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, pSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 2. Draw Floating Combat Text
        ctx.save();
        ctx.translate(floatX, floatY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        const rawDmg = effect.damageAmount || 0;
        const dmgText = rawDmg > 0 ? ` ${formatDamageNumber(rawDmg)}` : '';
        const displayText = effect.text || `✦ CRIT!${dmgText}`;

        // Dark high-contrast outer stroke
        ctx.font = '900 12px "Inter", system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(displayText, 0, 0);

        // Matching Element Color fill
        ctx.fillStyle = elementCol;
        ctx.fillText(displayText, 0, 0);

        // Inner bright white highlight core
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10.5px "Inter", system-ui, -apple-system, sans-serif';
        ctx.fillText(displayText, 0, 0);

        ctx.restore();
      }
      ctx.restore();
    });

    // --- DYNAMIC PLACEMENT POINTER ARROW & HOLOGRAPHIC PREVIEW ---
    if (selectedDeployAnimal && hoverPos) {
      const isTitan = selectedDeployAnimal.id === 'titan_defender';
      let snapX = hoverPos.x;
      let snapY = hoverPos.y;
      let isValid = false;

      if (isTitan) {
        // 2x2 Titan snap to 40px grid node boundaries
        snapX = Math.floor((hoverPos.x + 20) / 40) * 40;
        snapY = Math.floor((hoverPos.y + 20) / 40) * 40;
        snapX = Math.max(40, Math.min(CANVAS_WIDTH - 40, snapX));
        snapY = Math.max(40, Math.min(CANVAS_HEIGHT - 40, snapY));
        isValid = isPositionValidForTitan(snapX, snapY, path, towers, isUltraBoss);
      } else {
        // 1x1 Standard Unit snap to cell center (20, 60, 100...)
        snapX = Math.floor(hoverPos.x / 40) * 40 + 20;
        snapY = Math.floor(hoverPos.y / 40) * 40 + 20;
        snapX = Math.max(20, Math.min(CANVAS_WIDTH - 20, snapX));
        snapY = Math.max(20, Math.min(CANVAS_HEIGHT - 20, snapY));
        isValid = isPositionValidForTower(snapX, snapY, path, towers, isUltraBoss);
      }

      ctx.save();
      const glowColor = isValid ? '#22c55e' : '#ef4444';
      const glowFill = isValid ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.3)';

      // 1. Placement Bounding Box (80x80 for 2x2 Titan, 40x40 for 1x1 standard)
      const boxSize = isTitan ? 80 : 40;
      const boxHalf = boxSize / 2;

      ctx.fillStyle = glowFill;
      ctx.fillRect(snapX - boxHalf, snapY - boxHalf, boxSize, boxSize);

      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = glowColor;
      ctx.strokeRect(snapX - boxHalf + 1, snapY - boxHalf + 1, boxSize - 2, boxSize - 2);

      // Cyber Corner Reticles
      const cornerLen = isTitan ? 16 : 9;
      ctx.lineWidth = 3;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(snapX - boxHalf, snapY - boxHalf + cornerLen);
      ctx.lineTo(snapX - boxHalf, snapY - boxHalf);
      ctx.lineTo(snapX - boxHalf + cornerLen, snapY - boxHalf);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(snapX + boxHalf - cornerLen, snapY - boxHalf);
      ctx.lineTo(snapX + boxHalf, snapY - boxHalf);
      ctx.lineTo(snapX + boxHalf, snapY - boxHalf + cornerLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(snapX - boxHalf, snapY + boxHalf - cornerLen);
      ctx.lineTo(snapX - boxHalf, snapY + boxHalf);
      ctx.lineTo(snapX - boxHalf + cornerLen, snapY + boxHalf);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(snapX + boxHalf - cornerLen, snapY + boxHalf);
      ctx.lineTo(snapX + boxHalf, snapY + boxHalf);
      ctx.lineTo(snapX + boxHalf, snapY + boxHalf - cornerLen);
      ctx.stroke();

      // 2. Attack Range Circle
      let previewRange = selectedDeployAnimal.range;
      if (equippedRelicIds?.includes('quantum_magnet')) {
        previewRange *= 1.40;
      }
      ctx.beginPath();
      ctx.arc(snapX, snapY, previewRange, 0, Math.PI * 2);
      ctx.strokeStyle = isValid ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -(now * 0.03) % 18;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)';
      ctx.fill();

      // 3. Semi-transparent Hologram of Animal
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.translate(snapX, snapY);
      drawCubeAnimal(
        ctx,
        isTitan ? 36 : 22,
        selectedDeployAnimal.color,
        ['Mythic', 'Secret', '???', 'Original', 'Unrivaled', 'Overseer', 'Arcane'].includes(selectedDeployAnimal.rarity),
        selectedDeployAnimal.id,
        1,
        false
      );
      ctx.restore();

      // 4. DOWNWARD POINTING GLOWING NEON ARROW (⬇)
      const bobbing = Math.sin(now / 130) * 6;
      const arrowTipY = snapY - boxHalf - 12 + bobbing;
      const arrowHeight = 22;
      const arrowTopY = arrowTipY - arrowHeight;
      const arrowWidth = 18;

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      // Draw downward chevron arrowhead
      ctx.beginPath();
      ctx.moveTo(snapX, arrowTipY); // Bottom tip pointing directly at target unit cell
      ctx.lineTo(snapX - arrowWidth / 2, arrowTipY - 14);
      ctx.lineTo(snapX - arrowWidth / 4, arrowTipY - 14);
      ctx.lineTo(snapX - arrowWidth / 4, arrowTopY);
      ctx.lineTo(snapX + arrowWidth / 4, arrowTopY);
      ctx.lineTo(snapX + arrowWidth / 4, arrowTipY - 14);
      ctx.lineTo(snapX + arrowWidth / 2, arrowTipY - 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Secondary floating chevron above arrow
      ctx.beginPath();
      ctx.moveTo(snapX - 8, arrowTopY - 6);
      ctx.lineTo(snapX, arrowTopY - 2);
      ctx.lineTo(snapX + 8, arrowTopY - 6);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 5. Floating Tactical Info Pill
      const badgeText = isValid 
        ? (isTitan ? `✓ TITAN 2x2 DEPLOY (🥩 ${selectedDeployAnimal.cost})` : `✓ DEPLOY READY (🥩 ${selectedDeployAnimal.cost})`)
        : (isTitan ? `⚠ TITAN REQUIRES 2x2 CLEAR AREA` : `⚠ BLOCKED / OCCUPIED`);
      
      ctx.font = 'bold 10px monospace';
      const textMetrics = ctx.measureText(badgeText);
      const badgeW = textMetrics.width + 16;
      const badgeH = 20;
      const badgeY = arrowTopY - 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(snapX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isValid ? '#4ade80' : '#f87171';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, snapX, badgeY);

      ctx.restore();
      ctx.restore();
    }

    // Tactical Mode Hover Reticle & Telemetry Callout
    if (isTacticalActive && hoverPos && heatmapData && !selectedDeployAnimal) {
      const hoverGx = Math.floor(hoverPos.x / 40);
      const hoverGy = Math.floor(hoverPos.y / 40);
      if (hoverGx >= 0 && hoverGx < 20 && hoverGy >= 0 && hoverGy < 15) {
        const hoveredCell = heatmapData.cells.find(c => c.gx === hoverGx && c.gy === hoverGy);
        if (hoveredCell) {
          const hx = hoveredCell.cx;
          const hy = hoveredCell.cy;

          // Animated Crosshair Reticle
          ctx.save();
          ctx.strokeStyle = hoveredCell.isRoadway ? '#f43f5e' : (hoveredCell.tier === 'S' ? '#fbbf24' : '#22d3ee');
          ctx.lineWidth = 1.5;
          
          // Outer bracket
          const s = 18;
          ctx.strokeRect(hx - s, hy - s, s * 2, s * 2);

          // Center cross
          ctx.beginPath();
          ctx.moveTo(hx - 6, hy);
          ctx.lineTo(hx + 6, hy);
          ctx.moveTo(hx, hy - 6);
          ctx.lineTo(hx, hy + 6);
          ctx.stroke();

          // Floating Telemetry Callout Badge
          const badgeW = 160;
          const badgeH = 28;
          let bx = hx + 22;
          let by = hy - 14;
          if (bx + badgeW > CANVAS_WIDTH) bx = hx - badgeW - 22;
          if (by < 10) by = 10;
          if (by + badgeH > CANVAS_HEIGHT - 10) by = CANVAS_HEIGHT - badgeH - 10;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fillRect(bx, by, badgeW, badgeH);
          ctx.strokeStyle = hoveredCell.isRoadway ? 'rgba(244, 63, 94, 0.6)' : (hoveredCell.tier === 'S' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(6, 182, 212, 0.6)');
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, badgeW, badgeH);

          ctx.fillStyle = hoveredCell.isRoadway ? '#fda4af' : (hoveredCell.tier === 'S' ? '#fef08a' : '#a5f3fc');
          ctx.font = 'bold 8px ui-monospace, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`[${hoveredCell.coordName}] ${hoveredCell.isRoadway ? 'ROADWAY LANE' : `${hoveredCell.tier}-TIER (${hoveredCell.efficiency}%)`}`, bx + 6, by + 10);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '7.5px ui-monospace, monospace';
          const subText = hoveredCell.isRoadway 
            ? 'Blocked • Mob Path' 
            : `Dwell: ~${hoveredCell.dwellEstimate}s • ${hoveredCell.isOccupied ? 'Occupied' : 'Open Ground'}`;
          ctx.fillText(subText, bx + 6, by + 21);

          ctx.restore();
        }
      }
    }

    // Draw Weather / Atmospheric Overlays (On top of everyone)
    const isSavannaStorm = currentStage === 'savanna' && isWaveActive && (Date.now() % 20000) < 5000;
    if (isSavannaStorm) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.15)'; // Dusty golden-yellow haze
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw dynamic fluttering sand lines
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      const windOffset = (Date.now() / 3) % CANVAS_WIDTH;
      for (let i = 0; i < 45; i++) {
        const px = (i * 19 + windOffset) % CANVAS_WIDTH;
        const py = (i * 13) % CANVAS_HEIGHT;
        ctx.fillRect(px, py, 4, 1.5);
      }
    }

    ctx.restore();
  }, [towers, enemies, projectiles, skillEffects, path, selectedTowerId, selectedDeployAnimal, hoverPos, currentStage, isWaveActive, disableVFX, elementalHazards, isTacticalActive, heatmapData, showGrid]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedDeployAnimal && !isTacticalActive) {
      if (hoverPos) setHoverPos(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = (clickX / rect.width) * canvas.width;
    const y = (clickY / rect.height) * canvas.height;

    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map click coordinates of the scaled canvas back to the 800x600 virtual workspace
    const x = (clickX / rect.width) * canvas.width;
    const y = (clickY / rect.height) * canvas.height;

    // Check if clicked a tower
    const clickedTower = towers.find(t => {
      const dx = t.x - x;
      const dy = t.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedTower && onTowerClick) {
      onTowerClick(clickedTower.id);
    } else {
      onCanvasClick(x, y);
    }
  };

  return (
    <div className="relative inline-block select-none max-w-full">
      {/* Tactical Mode Quick Toggle HUD */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-1 shadow-xl">
        <button
          onClick={toggleTacticalMode}
          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
            isTacticalActive
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
          title="Toggle Tactical Grid & Lane Efficiency Heatmap (Hotkey: T)"
        >
          <Crosshair size={12} className={isTacticalActive ? 'text-cyan-400 animate-spin-slow' : 'text-slate-500'} />
          <span>TACTICAL HEATMAP</span>
          <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${isTacticalActive ? 'bg-cyan-400/30 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>
            {isTacticalActive ? 'ON' : 'OFF'}
          </span>
          <span className="text-[7.5px] font-mono opacity-60 bg-black/40 px-1 py-0.5 rounded ml-0.5">[T]</span>
        </button>

        {isTacticalActive && (
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className={`p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors border ${isLegendOpen ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'border-transparent hover:bg-slate-800/60'}`}
            title="Toggle Tactical Heatmap Legend & Analysis"
          >
            {isLegendOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Expandable Tactical Legend Drawer */}
      {isTacticalActive && isLegendOpen && heatmapData && (
        <div className="absolute top-11 left-2 z-30 w-72 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl space-y-2 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Activity size={12} /> LANE EFFICIENCY HEATMAP
            </span>
            <span className="text-[8px] font-mono text-cyan-300/70">
              {heatmapData.cells.filter(c => !c.isRoadway).length} SECTORS
            </span>
          </div>

          <div className="space-y-1.5 text-[9px]">
            <div className="flex items-center justify-between p-1 rounded bg-amber-500/10 border border-amber-400/30">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"></span>
                <span className="font-bold text-amber-300">★ APEX & S-TIER (84-100%)</span>
              </div>
              <span className="font-mono text-amber-200 font-bold">{heatmapData.sCount} Prime Spots</span>
            </div>

            <div className="flex items-center justify-between p-1 rounded bg-emerald-500/10 border border-emerald-400/30">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
                <span className="font-bold text-emerald-300">A-TIER PRIME (64-83%)</span>
              </div>
              <span className="font-mono text-emerald-200 font-bold">{heatmapData.aCount} Spots</span>
            </div>

            <div className="flex items-center justify-between p-1 rounded bg-cyan-500/10 border border-cyan-400/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400"></span>
                <span className="font-bold text-cyan-300">B-TIER FLANK (40-63%)</span>
              </div>
              <span className="font-mono text-cyan-200 font-bold">Standard</span>
            </div>

            <div className="flex items-center justify-between p-1 rounded bg-rose-500/10 border border-rose-400/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                <span className="font-bold text-rose-300">ROADWAY LANE</span>
              </div>
              <span className="font-mono text-rose-200 text-[8px]">NO DEPLOY</span>
            </div>
          </div>

          <div className="text-[8px] text-slate-400 border-t border-white/5 pt-1.5 flex items-center justify-between">
            <span>💡 Tip: Place towers in gold ★ APEX chokepoints for maximum lane coverage!</span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="rounded-lg shadow-2xl border-4 border-slate-800 cursor-crosshair max-w-full max-h-[70vh] md:max-h-[75vh] w-auto h-auto object-contain transform-gpu will-change-transform block"
      />
    </div>
  );
};
