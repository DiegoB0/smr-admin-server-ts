export enum RequisicionAprovalLevel {
  NONE = 'none', // under 2000$
  ADMIN = 'admin', // from 2000 - 5000 $
  SPECIAL_PERMISSION = 'special_permission' // > 5000 $
}

// TODO: Change all the PRODUCT types on the backend for REFACCIONES type
export enum RequisicionType {
  REFACCIONES = "refacciones",
  CONSUMIBLES = "consumibles",  
  FILTROS = "filtros",
}
