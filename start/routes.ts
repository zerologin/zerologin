/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'HomeController.index')
Route.inertia('login', 'Auth/Login')

Route.get('sse/lnurl', 'AuthController.sseLnurl')
Route.get('lnurl', 'AuthController.lnurlChallenge')
Route.get('callback/:key/:k1', 'AuthController.callback').as('callback')
Route.get('logout', 'AuthController.logout').middleware('auth')

Route.group(() => {
  Route.get('/', 'AccountsController.index').as('account_index')
})
  .prefix('account')
  .middleware('auth')

Route.group(() => {
  Route.get('/create', 'DomainsController.create')
  Route.post('/', 'DomainsController.store')

  Route.get(':id', 'DomainsController.edit')
  Route.put(':id', 'DomainsController.update')

  Route.delete('/:id', 'DomainsController.delete')
})
  .prefix('domains')
  .middleware('auth')
