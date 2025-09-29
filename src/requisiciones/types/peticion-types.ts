export const COMPONENTE_KEYS = [
  'motor',
  'transmision',
  'sistema_hidraulico',
  'tren_de_rodaje',
  'herramienta_de_corte',
  'sistema_electrico',
  'ac',
  'sistema_de_enfriamiento',
  'otros',
] as const;
export type ComponenteKey = (typeof COMPONENTE_KEYS)[number];

export const FASE_KEYS = [
  'carrileria',
  'elementos_de_desgaste',
  'preventivo',
  'llantas',
  'lubricacion',
  'mantenimiento_mecanico',
  'reparacion_mayor',
  'taller',
] as const;
export type FaseKey = (typeof FASE_KEYS)[number];
