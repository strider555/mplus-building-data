# M+ Building Data

從香港政府 3D Map API (`3d.map.gov.hk`) 及相關 CSDI API 提取 M+ 博物館建築資料。

## 📊 Project Status

| Part | Status | Notes |
|------|--------|-------|
| 1. 3D Model Tiles | ✅ Done | 12 `.b3dm` files (Region 11, West Kowloon) |
| 2. Indoor Floor Plans | ⚠️ N/A | M+ not in Gov Indoor Map system |
| 3. Structured JSON | ✅ Done | `data/mplus_building.json` (11KB) |

## 📁 Structure

```
data/
├── mplus_building.json     # 完整結構化 JSON (Part 3)
├── 3d-tiles/               # Cesium 3D Tiles .b3dm files (Part 1)
│   ├── Tile_6_2_L5.b3dm
│   ├── Tile_6_3_L5.b3dm
│   ├── Tile_7_2_L5.b3dm
│   ├── Tile_7_3_L5.b3dm
│   ├── Tile_6_4_L5.b3dm
│   ├── Tile_7_4_L5.b3dm
│   ├── Tile_8_2_L5.b3dm
│   ├── Tile_8_3_L5.b3dm
│   ├── Tile_9_2_L5.b3dm
│   ├── Tile_9_3_L5.b3dm
│   ├── Tile_8_4_L5.b3dm
│   └── Tile_9_4_L5.b3dm
└── indoor/
    ├── README.md           # Indoor API findings
    └── all_venues.json     # All 717 venues in HK Indoor Map system
scripts/
└── download_3d_tiles.py    # Tile download script
```

## 🏛️ Building Summary

| Field | Value |
|-------|-------|
| Name | M+ (博物館道 38 號) |
| Height | 65m |
| Floors | 20 above + 3 below ground |
| Area | 65,000 m² |
| Exhibition | 17,000 m² / 33 galleries |
| Architect | Herzog & de Meuron + TFP Farrells |
| Engineer | Arup |
| Facade | 140,000 ceramic tiles + LED screen (65.8m × 110m) |
| Opened | 2021-11-12 |

## 🔑 API Endpoints Used

| API | Endpoint | Key Required |
|-----|----------|-------------|
| Location Search | `www.map.gov.hk/gs/api/v1.0.0/locationSearch` | No |
| Identify | `www.map.gov.hk/gs/api/v1.0.0/identify` | No |
| Search Nearby | `www.map.gov.hk/gs/api/v1.0.0/searchNearby` | No |
| 3D Tiles | `data.map.gov.hk/api/3d-data/3dtiles/f2/` | Yes (in URL) |
| Indoor WFS | `mapapi.hkmapservice.gov.hk/ogc/wfs/indoor/` | Yes (header) |

**Note:** The old `geodata.gov.hk` host was suspended on 2026-05-04. Use `www.map.gov.hk` instead.

## 📝 Findings

### Indoor API
M+ is **not** in the government's Indoor Map system (as of June 2026). The system contains 717 venues, primarily shopping centres, MTR stations, and government buildings. Neither M+ nor adjacent buildings (Elements, ICC, West Kowloon Station) are included.

### 3D Tiles
The tiles cover the entire West Kowloon area (Region 11) at Level 5 detail. M+ building is contained within these tiles along with surrounding buildings. To isolate M+ specifically would require parsing the `.b3dm` binary format and filtering by coordinates.

## License
Building data from Hong Kong Government open data. M+ information from public sources.
