/*
|--------------------------------------------------------------------------
| Inertia Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import Inertia from '@ioc:EidelLev/Inertia'

Inertia.share({
  errors: (ctx) => {
    return ctx.session.flashMessages.get('errors')
  },
  auth: (ctx) => {
    return { isLoggedIn: !!ctx.request.user, username: ctx.request.user?.pubKey }
  },
}).version(() => Inertia.manifestFile('public/assets/manifest.json'))
