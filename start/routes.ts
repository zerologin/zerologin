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

Route.group(() => {
  Route.get('sse/lnurl', 'AuthController.sseLnurl')
  Route.get('lnurl', 'AuthController.lnurlChallenge')
  Route.post('callback/:key/:k1', 'AuthController.callback').as('callback_internal')
  Route.get('logout', 'AuthController.logout').middleware('auth')
}).prefix('api/internal')

Route.group(() => {
  Route.get('sse/lnurl', 'AuthController.sseLnurl')
  Route.get('lnurl', 'AuthController.lnurlChallenge')
  Route.post('callback/:key/:k1/:publicId', 'AuthController.callback').as('callback')
  Route.get('logout', 'AuthController.logout').middleware('auth')
  Route.post('refresh-token', 'RefreshTokensController.refresh')
}).prefix('api/v1')

Route.group(() => {
  Route.group(() => {
    Route.get('', 'SigauthController.index')
    Route.get('verify', 'SigauthController.verify')
  }).prefix('sigauth')
}).prefix('api/v2')

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

Route.group(() => {
  Route.get('/create', 'SigauthDomainsController.create')
  Route.post('/', 'SigauthDomainsController.store')

  Route.get(':id', 'SigauthDomainsController.edit')
  Route.put(':id', 'SigauthDomainsController.update')

  Route.delete('/:id', 'SigauthDomainsController.delete')
})
  .prefix('sigauth-domains')
  .middleware('auth')

