// OpenFreeMap's place layer carries OSM name:xx values when they exist.
// Keep the source style's expression as the fallback so unlabeled features stay visible.
const originalFields = new WeakMap();

const languageKeys = {
  ko: ['name:ko'],
  en: ['name:en'],
  ja: ['name:ja'],
  'zh-CN': ['name:zh-Hans', 'name:zh'],
  es: ['name:es'],
  th: ['name:th'],
  hi: ['name:hi'],
  fr: ['name:fr'],
  de: ['name:de'],
};

export function localizedMapTextField(original, locale) {
  const keys = languageKeys[locale];
  if (!keys?.length) return original;
  return ['coalesce', ...keys.map((key) => ['get', key]), original];
}

export function applyMapLanguage(map, locale) {
  if (!map?.getStyle()?.layers) return;
  let fields = originalFields.get(map);
  if (!fields) {
    fields = new Map();
    for (const layer of map.getStyle().layers) {
      if (layer.type === 'symbol' && ['place', 'water_name'].includes(layer['source-layer']) && layer.layout?.['text-field']) {
        fields.set(layer.id, layer.layout['text-field']);
      }
    }
    originalFields.set(map, fields);
  }
  for (const [layerId, original] of fields) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'text-field', localizedMapTextField(original, locale));
  }
}
