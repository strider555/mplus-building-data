# M+ Building Data

從香港政府 3D Map API (`3d.map.gov.hk`) 及相關 CSDI API 提取 M+ 博物館建築資料。

## 項目內容

### Part 1: 3D Model Tiles
- 從 Cesium 3D Tiles API 下載 M+ Building 嘅 3D 模型
- 格式：`.b3dm` (Batched 3D Model)

### Part 2: Indoor Floor Plans
- 透過 Indoor Layout API 搵 M+ 室內樓層平面圖
- 各樓層設施分佈

### Part 3: Structured JSON
- 整合所有建築資料成統一 JSON 格式
- 包括：基本數據、設施、坐標、3D 模型參考

## 數據來源
- 地政總署 3D Visualisation Map API (CSDI)
- Location Search API (`www.map.gov.hk`)
- Indoor Map API
- M+ 官網 (mplus.org.hk)

## 座標
- WGS84: 22.3019°N, 114.1578°E
- HK80 Grid: x=834441, y=817991

## License
Data sourced from Hong Kong Government open data (Terms of Use apply).
