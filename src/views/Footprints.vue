<template>
  <div class="page-container fp-page">
    <h2 class="page-title">🗺️ 我们的足迹</h2>
    <p class="page-subtitle">标记一起去过的每一个地方</p>

    <!-- Map Placeholder (Leaflet loaded dynamically) -->
    <div class="map-container card" ref="mapRef">
      <div v-if="!mapReady" class="map-loading">🗺️ 点击加载地图...</div>
      <div v-if="mapReady" id="fpMap" style="width:100%;height:300px;border-radius:16px;"></div>
    </div>

    <!-- Add Footprint -->
    <div class="add-fp card">
      <div class="fp-form-row">
        <input v-model="searchQuery" class="input" placeholder="搜索地点..." @keyup.enter="searchPlace" />
        <button class="btn btn-primary btn-sm" @click="searchPlace" :disabled="!searchQuery">🔍</button>
      </div>
      <div v-if="searchResults.length" class="search-results">
        <div v-for="r in searchResults" :key="r.lat+','+r.lon" class="search-item" @click="selectPlace(r)">
          <span class="si-name">{{ r.display_name.slice(0, 60) }}</span>
        </div>
      </div>
      <div v-if="selectedPlace" class="selected-place">
        <span>📍 {{ selectedPlace.display_name.slice(0, 80) }}</span>
        <input v-model="fpNote" class="input mt-2" placeholder="在这里发生了什么？" />
        <input v-model="fpDate" type="date" class="input mt-2" />
        <button class="btn btn-primary btn-sm mt-2" @click="addFootprint">📍 标记足迹</button>
      </div>
    </div>

    <!-- Footprint List -->
    <div v-if="footprints.length" class="fp-list">
      <div v-for="fp in footprints" :key="fp.id" class="fp-card card stagger-card">
        <span class="fp-icon">📍</span>
        <div class="fp-info">
          <h4 class="fp-name">{{ fp.name }}</h4>
          <p class="fp-date">📅 {{ fp.visit_date }}</p>
          <p v-if="fp.note" class="fp-note">{{ fp.note }}</p>
        </div>
        <button class="fp-del" @click="removeFp(fp.id)">×</button>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="icon">🗺️</span>
      <p>还没有记录一起去过的地方～</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { footprintApi } from '../utils/api.js'

const footprints = ref([])
const mapRef = ref(null)
const mapReady = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const selectedPlace = ref(null)
const fpNote = ref('')
const fpDate = ref(new Date().toISOString().slice(0, 10))
let mapInstance = null

onMounted(async () => {
  try { footprints.value = await footprintApi.list() } catch (e) { console.warn(e) }
  setTimeout(initMap, 500)
})

async function initMap() {
  try {
    // Dynamic import Leaflet
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')

    mapReady.value = true
    await new Promise(r => setTimeout(r, 100))

    const el = document.getElementById('fpMap')
    if (!el) return

    mapInstance = L.map(el).setView([35.86, 104.19], 4)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(mapInstance)

    // Fix default icon
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })

    // Add existing markers
    for (const fp of footprints.value) {
      const lat = parseFloat(fp.latitude)
      const lng = parseFloat(fp.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        L.marker([lat, lng]).addTo(mapInstance).bindPopup(`<b>${fp.name}</b><br>${fp.visit_date}<br>${fp.note || ''}`)
      }
    }
  } catch (e) {
    console.warn('Map init failed:', e.message)
  }
}

async function searchPlace() {
  if (!searchQuery.value) return
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`)
    searchResults.value = await res.json()
  } catch (e) {
    // Fallback: allow manual entry
    searchResults.value = [{ display_name: searchQuery.value, lat: '35.86', lon: '104.19' }]
  }
}

function selectPlace(place) {
  selectedPlace.value = place
  searchResults.value = []
  searchQuery.value = ''
}

async function addFootprint() {
  if (!selectedPlace.value) return
  try {
    const fp = await footprintApi.create({
      name: selectedPlace.value.display_name.slice(0, 200),
      latitude: parseFloat(selectedPlace.value.lat),
      longitude: parseFloat(selectedPlace.value.lon),
      visit_date: fpDate.value,
      note: fpNote.value
    })
    footprints.value.unshift(fp)
    selectedPlace.value = null
    fpNote.value = ''

    // Add marker to map
    if (mapInstance) {
      const L = await import('leaflet')
      L.marker([parseFloat(selectedPlace.value.lat), parseFloat(selectedPlace.value.lon)])
        .addTo(mapInstance)
        .bindPopup(`<b>${fp.name}</b><br>${fp.visit_date}`)
    }
  } catch (e) { alert(e.message) }
}

async function removeFp(id) {
  if (!confirm('删除这个足迹？')) return
  try {
    await footprintApi.remove(id)
    footprints.value = footprints.value.filter(f => f.id !== id)
  } catch (e) { alert(e.message) }
}
</script>

<style scoped>
.map-container { padding: 8px; min-height: 100px; cursor: pointer; }
.map-loading { text-align: center; padding: 40px; color: var(--text-light); font-size: 1.1rem; }

.fp-form-row { display: flex; gap: 8px; }
.search-results { margin-top: 8px; }
.search-item { padding: 10px 14px; cursor: pointer; border-radius: var(--radius-sm); background: rgba(255,255,255,0.5); margin-bottom: 4px; font-size: 0.85rem; }
.search-item:hover { background: rgba(252,228,236,0.4); }
.selected-place { margin-top: 12px; padding: 12px; background: rgba(252,228,236,0.3); border-radius: var(--radius-sm); font-size: 0.85rem; }
.mt-2 { margin-top: 8px; display: block; }

.fp-list { margin-top: 20px; }
.fp-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; position: relative; }
.fp-icon { font-size: 1.5rem; flex-shrink: 0; }
.fp-info { flex: 1; }
.fp-name { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
.fp-date { font-size: 0.78rem; color: var(--text-light); }
.fp-note { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

.fp-del {
  position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%;
  border: none; background: rgba(0,0,0,0.06); color: var(--text-light); cursor: pointer;
  font-size: 1rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all var(--transition-fast);
}
.fp-card:hover .fp-del { opacity: 1; }
</style>
