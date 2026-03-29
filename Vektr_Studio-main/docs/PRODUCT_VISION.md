# Vektr Studio Product Vision

## 1. Vision Statement
Vektr Studio is a musician-first creative workspace where song work and promo content creation happen in one natural flow.

The product exists to remove the usual friction between:
- making music
- packaging visuals
- preparing social content

Core promise:
Create share-ready promo assets while you create music, without it feeling like extra work.

## 2. Product Positioning
Vektr Studio is **not** a DAW.

It is a:
- Track + Lyric + Visualizer hub
- Content acceleration layer for musicians
- High-quality transform and export system for promo-ready outputs

Category shorthand:
A creator workspace for music-to-content workflows.

## 3. Problem Being Solved
Musicians invest most of their energy in song creation, then face a second heavy workflow for content creation.

Current pain points:
- context switching between music tools and design/video tools
- repetitive manual creation of social assets
- weak linkage between lyrics, releases, and visual content
- inconsistent quality when trying one-click audio transformation tools

## 4. Core User Outcomes
Users should be able to:
1. Store and organize tracks, stems, and release assets in one place.
2. Keep a lyric book connected to tracks and sections.
3. Generate stylized lyric/quote/release content quickly.
4. Apply high-quality one-click audio effect chains to existing songs.
5. Produce exportable/shareable visualizer videos with synced lyrics.

## 5. Product Pillars
### 5.1 Track Library
A central library with support for:
- finished tracks
- versions
- stem packs
- release metadata
- promo outputs

### 5.2 Lyric Book
A structured lyric system with:
- songs and sections
- line-level entries
- quote extraction candidates
- sync metadata for visual overlays

### 5.3 Visualizer Studio (Hero Surface)
The visualizer is a flagship layer that connects to:
- tracks
- lyrics
- release context

It should support:
- lyric overlays
- style templates
- social aspect ratio exports

### 5.4 Content Kit Templates
Reusable content components including:
- Bio Cards
- Release Cards (with links)
- Lyric Cards
- Quote Cards
- Hook/teaser templates

### 5.5 Audio Transform Lab
Replace sequencer scope with an effects-first model:
- one-click style chains (for existing tracks)
- advanced quick mastering (beyond basic EQ)
- A/B preview and export-ready loudness profiles

## 6. Scope Decision: No Sequencer-Led DAW Path
The sequencer is not a core pillar unless a full DAW direction is chosen.

Current direction:
- focus on transforming pre-existing tracks and stems
- avoid deep multitrack composition features
- prioritize speed, quality, and export outcomes

## 7. Quality Standard (Non-Negotiable)
Only ship core features that produce top-tier output quality.

Implementation policy:
- prefer user-provided stems as primary workflow
- offer auto stem extraction only as optional/beta fallback
- add quality gating with confidence signals before final export

If quality confidence is low:
- warn clearly
- suggest better source stems
- avoid silently producing low-grade outputs

## 8. Link System Requirement
A centralized Link Vault should power all templates.

Goals:
- store links once
- reuse across all content
- auto-resolve artist-level and release-level links
- support fast copy/export for captions and publishing workflows

## 9. Auto-Sync / Mashup Direction
Auto-aligning vocals from one song to another beat is possible and strategically valuable.

Preferred workflow:
- stem-based ingest first
- automatic BPM/key/phrase alignment
- confidence-scored results
- output variants (e.g., Tight/Natural/Creative)

Ship only when quality is consistently strong enough for public-facing content.

## 10. MVP Definition (Quality-First)
### 10.1 Must-Have
1. Track Library with stem-aware structure
2. Lyric Book tied to tracks
3. Visualizer + lyric overlay templates
4. Bio Card + Release Card template set
5. Link Vault with easy injection into outputs
6. One-click effect recipes + advanced quick mastering controls
7. Export pipeline for 9:16, 1:1, 16:9 assets

### 10.2 Should-Have
1. Quote extraction suggestions from lyrics
2. Batch exports by release
3. Preset packs and style variants

### 10.3 Later
1. Auto stem extraction as optional fallback
2. Auto vocal-to-beat sync and mashup workflows
3. deeper AI-assisted arrangement/sync tools

## 11. UX Principles
1. Preset-first, tweak-second.
2. Keep users in creative flow.
3. Minimize manual repetitive tasks.
4. Preserve quality confidence with clear status indicators.
5. Default outputs should be publish-ready.

## 12. Success Metrics
1. Time to first exportable promo asset.
2. Number of assets produced per track/release.
3. Repeat use of template + link reuse flows.
4. User-reported effort reduction for content creation.
5. Quality acceptance rate of transformed/exported outputs.

## 13. One-Line North Star
Vektr Studio helps musicians turn tracks, lyrics, and identity assets into high-quality promo content in the same creative session.
