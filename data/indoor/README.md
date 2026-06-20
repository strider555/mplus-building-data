# Indoor Floor Plans

## Status: NOT AVAILABLE ❌

M+ Building is **not currently included** in the Hong Kong Government Indoor Map system.

### What we tried:
- OGC WFS Indoor API at `mapapi.hkmapservice.gov.hk/ogc/wfs/indoor/`
- Layers: `venue_polygon`, `level_polygon`, `unit_polygon`, `amenity_point`, `occupant_point`
- Searched by coordinates (WGS84 bbox) and venue name
- Result: 0 features for M+ area

### System Coverage:
- Total venues in system: 717
- Mainly covers: shopping centres, MTR stations, hospitals, government buildings
- Adjacent buildings (Elements, ICC, West Kowloon Station) also not in system

### Alternative Data:
Floor plan data has been compiled from:
- HK Gov Identify API (facility locations with floor info)
- M+ official website (mplus.org.hk)
- Arup engineering documentation

See `../mplus_building.json` for the compiled floor data.
