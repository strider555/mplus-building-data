#!/usr/bin/env python3
"""
Part 1: Download M+ Building 3D model tiles from HK Gov 3D Visualisation Map API.

Strategy:
1. Start from root tileset.json
2. Traverse tile tree to find tiles covering M+ coordinates
3. Download the relevant .b3dm files
"""
import requests
import json
import math
import os
import time

API_KEY = "3967f8f365694e0798af3e7678509421"
BASE_URL = "https://data.map.gov.hk/api/3d-data/3dtiles/f2"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data/3d-tiles")

# M+ Museum WGS84 → ECEF
LAT = math.radians(22.3019)
LON = math.radians(114.1578)
A = 6378137.0
F = 1/298.257223563
E2 = 2*F - F*F
N = A / math.sqrt(1 - E2 * math.sin(LAT)**2)
MPLUS_X = N * math.cos(LAT) * math.cos(LON)
MPLUS_Y = N * math.cos(LAT) * math.sin(LON)
MPLUS_Z = N * (1 - E2) * math.sin(LAT)

print(f"M+ ECEF: ({MPLUS_X:.2f}, {MPLUS_Y:.2f}, {MPLUS_Z:.2f})")


def distance_to_mplus(box):
    """Calculate distance from bounding box center to M+"""
    cx, cy, cz = box[0], box[1], box[2]
    return math.sqrt((cx - MPLUS_X)**2 + (cy - MPLUS_Y)**2 + (cz - MPLUS_Z)**2)


def fetch_json(url):
    """Fetch JSON with retry"""
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                return r.json()
            print(f"  HTTP {r.status_code} for {url}")
        except Exception as e:
            print(f"  Error (attempt {attempt+1}): {e}")
            time.sleep(1)
    return None


def download_b3dm(url, filepath):
    """Download .b3dm binary file"""
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                f.write(r.content)
            print(f"  ✅ Downloaded: {filepath} ({len(r.content)} bytes)")
            return True
        else:
            print(f"  ❌ HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    return False


def find_closest_child(children):
    """Find the child tile closest to M+"""
    best = None
    best_dist = float('inf')
    for child in children:
        if 'boundingVolume' not in child:
            continue
        box = child['boundingVolume']['box']
        dist = distance_to_mplus(box)
        if dist < best_dist:
            best_dist = dist
            best = child
    return best, best_dist


def traverse_and_download(base_url, tileset_path, depth=0, max_depth=8):
    """Recursively traverse tile tree toward M+ and download tiles"""
    indent = "  " * depth
    url = f"{base_url}/{tileset_path}?key={API_KEY}"
    print(f"{indent}📂 Fetching: {tileset_path}")
    
    data = fetch_json(url)
    if not data:
        return []
    
    downloaded = []
    root = data.get('root', data)
    children = root.get('children', [])
    
    if not children:
        # Leaf node - check for content
        content = root.get('content', {})
        uri = content.get('uri', '')
        if uri.endswith('.b3dm') or uri.endswith('.glb'):
            print(f"{indent}🎯 Found model: {uri}")
            # Resolve relative URI
            parent_dir = tileset_path.rsplit('/', 1)[0] if '/' in tileset_path else ''
            full_url = f"{base_url}/{parent_dir}/{uri}?key={API_KEY}" if parent_dir else f"{base_url}/{uri}?key={API_KEY}"
            out_path = os.path.join(OUTPUT_DIR, uri.lstrip('../').lstrip('./'))
            if download_b3dm(full_url, out_path):
                downloaded.append(out_path)
        return downloaded
    
    # Find children close to M+
    close_children = []
    for child in children:
        if 'boundingVolume' not in child:
            continue
        box = child['boundingVolume']['box']
        dist = distance_to_mplus(box)
        # At deeper levels, use tighter radius
        threshold = 5000 / (depth + 1)
        if dist < threshold or depth < 2:
            close_children.append((dist, child))
    
    close_children.sort(key=lambda x: x[0])
    
    # Take closest few at each level
    for dist, child in close_children[:3]:
        content = child.get('content', {})
        uri = content.get('uri', '')
        
        if uri.endswith('.json'):
            # Sub-tileset
            parent_dir = tileset_path.rsplit('/', 1)[0] if '/' in tileset_path else ''
            sub_path = f"{parent_dir}/{uri}" if parent_dir else uri
            # Clean up ../ references
            parts = sub_path.split('/')
            clean_parts = []
            for p in parts:
                if p == '..':
                    if clean_parts:
                        clean_parts.pop()
                elif p != '.':
                    clean_parts.append(p)
            sub_path = '/'.join(clean_parts)
            
            if depth < max_depth:
                downloaded.extend(traverse_and_download(base_url, sub_path, depth+1, max_depth))
        elif uri.endswith('.b3dm') or uri.endswith('.glb'):
            parent_dir = tileset_path.rsplit('/', 1)[0] if '/' in tileset_path else ''
            full_url = f"{base_url}/{parent_dir}/{uri}?key={API_KEY}" if parent_dir else f"{base_url}/{uri}?key={API_KEY}"
            # Clean URL
            full_url = full_url.replace('/../', '/').replace('/./', '/')
            out_path = os.path.join(OUTPUT_DIR, os.path.basename(uri))
            if download_b3dm(full_url, out_path):
                downloaded.append(out_path)
        
        print(f"{indent}  → dist={dist:.0f}m, uri={uri}")
    
    return downloaded


if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("=" * 60)
    print("M+ Building 3D Tile Downloader")
    print("=" * 60)
    
    # Start traversal from root
    downloaded = traverse_and_download(BASE_URL, "tileset.json", depth=0, max_depth=6)
    
    print(f"\n{'='*60}")
    print(f"✅ Downloaded {len(downloaded)} tile files")
    for f in downloaded:
        size = os.path.getsize(f)
        print(f"  📦 {os.path.basename(f)} ({size:,} bytes)")
