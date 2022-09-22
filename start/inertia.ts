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
import Env from '@ioc:Adonis/Core/Env'

Inertia.share({
  errors: (ctx) => {
    return ctx.session.flashMessages.get('errors')
  },
  auth: (ctx) => {
    return { isLoggedIn: !!ctx.request.user, username: ctx.request.user?.pubKey }
  },
  appUrl: () => Env.get('APP_URL') + '/api/internal',
}).version(() => Inertia.manifestFile('public/assets/manifest.json'))
