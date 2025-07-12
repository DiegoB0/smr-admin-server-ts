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
  UpdateUser = 'update-user',

  // Almacenes
  CreateAlamacen = 'create-almacen',
  ListAlmacen = 'list-almacen',
  DeleteAlmacen = 'delete-almacen',
  UpdateAlmacen = 'update-almacen',

  /*
   * Permissions for almacen admins
   */

  // Accept requisiciones
  AcceptRequisicion = 'accept-requisicion',

  // Productos
  CreateProduct = 'create-product',
  ListProduct = 'list-product',
  DeleteProduct = 'delete-product',
  UpdateProduct = 'update-product',

  SalidaProduct = 'exit-product',
  EntradaProduct = 'enter-product',

  // Requisiciones
  CreateRequisicion = 'create-requisicion',
  DeleteRequisicion = 'delete-requisicion',
  UpdateRequisicion = 'update-requisicion',
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
