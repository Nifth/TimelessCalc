# API Contracts

## External APIs

### PoE Watch Leagues API

- **Endpoint**: `https://api.poe.watch/leagues`
- **Method**: GET
- **Description**: Fetches available Path of Exile leagues
- **Response Type**: `League[]`
- **Filtering**: Excludes "Solo Self-Found" league
- **Caching**: Cached in memory with Map

### Local Data Loading

#### Jewels Data
- **Path**: `/src/data/jewels/*.jsonl.gz`
- **Format**: JSONL (compressed with gzip)
- **Description**: Precomputed timeless jewel statistics
- **Structure**: Each line is a `JewelEntry` object
- **Files**:
  - ElegantHubris.jsonl.gz
  - MilitantFaith.jsonl.gz
  - BrutalRestraint.jsonl.gz
  - LethalPride.jsonl.gz
  - GloriousVanity.jsonl.gz

#### Tree Data
- **Path**: `/src/data/tree.json`
- **Format**: JSON
- **Description**: Passive skill tree structure and data

#### Translation Data
- **Path**: `/src/data/translation.json`
- **Format**: JSON
- **Description**: Stat translations for jewel calculations

#### Jewel Stats Data
- **Path**: `/src/data/jewelstats.json`
- **Format**: JSON
- **Description**: Jewel stat definitions