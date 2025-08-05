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

  /*
   * Permissions for almacen admins
   */

  // Accept requisiciones
  AcceptRequisicion = 'accept-requisicion',

  // Productos
  CreateProduct = 'create-product',
  ListProduct = 'list-product',
  DeleteProduct = 'delete-product',
  UpdateProduct = 'edit-product',

  // Iventario
  AddStock = 'add-stock',
  RemoveStock = 'remove-stock',

  SalidaProduct = 'exit-product',
  EntradaProduct = 'enter-product',

  // Requisiciones
  CreateRequisicion = 'create-requisicion',
  DeleteRequisicion = 'delete-requisicion',
  UpdateRequisicion = 'edit-requisicion',
  ListRequisicion = 'list-requisicion',

  /*
   * Permissions for almacen employees
   */

  AcceptReport = 'accept-report',

 /*
  * Permissions for non-almacen employees (Operators, other-branch administrators, etc) NOTE: Anyone but the almacen guys
  */
  CreateReport = 'create-report',
  ListReport = 'list-report',
  EditReport = 'edit-report',
  DeleteReport = 'delete-report',
}
