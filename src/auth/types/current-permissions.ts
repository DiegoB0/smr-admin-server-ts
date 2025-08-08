export enum CurrentPermissions {
  /*
   * Permissions for admins
   */
  // Api keys
  CreateApiKey = 'create-api-key',
  DeleteApiKey = 'delete-api-key',

  // Usuarios
  CreateUser = 'create-user',
  ListUser = 'list-user',
  DeleteUser = 'delete-user',
  UpdateUser = 'edit-user',

  // Almacenes
  CreateAlmacen = 'create-almacen',
  ListAlmacen = 'list-almacen',
  DeleteAlmacen = 'delete-almacen',
  UpdateAlmacen = 'edit-almacen',

  // Accept requisiciones
  AcceptRequisicion = 'accept-requisicion',

  /*
   * Permissions for almacen admins
   */

  // Requisiciones
  CreateRequisicion = 'create-requisicion',
  DeleteRequisicion = 'delete-requisicion',
  UpdateRequisicion = 'edit-requisicion',
  ListRequisicion = 'list-requisicion',

  // Productos
  CreateProduct = 'create-product',
  ListProduct = 'list-product',
  DeleteProduct = 'delete-product',
  UpdateProduct = 'edit-product',

  // Iventario
  AddStock = 'add-stock',
  RemoveStock = 'remove-stock',
  ListStock = 'list-stock',

  /*
   * Permissions for almacen employees
   */

  AcceptReport = 'accept-report',

  /*
   * TODO: Define permissions for enter/exit of products on inventory
   */

  // Could be add/remove stock???
  // SalidaProduct = 'exit-product', 
  // EntradaProduct = 'enter-product',

  /*
   * Permissions for non-almacen employees (Operators, other-branch administrators, etc) NOTE: Anyone but the almacen guys
   */
  CreateReport = 'create-report',
  ListReport = 'list-report',
  EditReport = 'edit-report',
  DeleteReport = 'delete-report',
}
