<template>
  <div class="homepage">
    <h1>Zerlogin, a passwordless authentication server</h1>
    <p>Integrate a passwordless authentication on your website at lightning speed...</p>
    <h3 style="align-self: center">...in just 3 steps</h3>
    <div class="start">
      <h2>Step 1</h2>
      <div><Link href="/login">Login</Link> or host Zerologin yourself</div>

      <h2>Step 2</h2>
      <div>Add your domain name in your Zerologin dashboard + define a secret</div>
      <div>
        then add a CNAME in your DNS
        <pre>login CNAME zerologin.co.</pre>
      </div>

      <h2>Step 3</h2>
      <div>Add zerologin's auth component in your website</div>
      <pre>{{ codeComponent }}</pre>

      <p>
        On successful login 1 cookie will be added. It contains a JWT encrypted with your secret
        previously configured using HS256 algorithm.
      </p>
      <p>
        Cookie will be available for your toplevel domain and all subdomains. The cookie secure flag
        is set, so your services must run over https.
      </p>
      <p>
        You can now verify the JWT signature using your secret to authorize/unauthorize and identify
        your users.
      </p>

      <el-divider />

      <h2>FAQ</h2>
      <h3>What technology does Zerologin use?</h3>
      <p>
        Zerologin uses
        <a
          href="https://github.com/fiatjaf/lnurl-rfc/blob/luds/04.md"
          target="_blank"
          rel="noopener noreferrer"
          >LNURL-Auth protocol</a
        >
      </p>

      <h3>What software my users can use to log in?</h3>
      <p>LNURL is supported by a large majority of Bitcoin Lightning-network wallets</p>
      <a href="https://github.com/getAlby/lightning-browser-extension">Alby</a>,
      <a href="https://github.com/alexbosworth/balanceofsatoshis">Balance of Satoshis</a>,
      <a href="https://blixtwallet.github.io" rel="nofollow">Blixt</a>,
      <a href="https://breez.technology" rel="nofollow">Breez</a>,
      <a href="https://coinos.io" rel="nofollow">coinos</a>,
      <a href="https://lnbits.com" rel="nofollow">LNbits</a>,
      <a href="https://lntxbot.com" rel="nofollow">@lntxbot</a>,
      <a href="https://phoenix.acinq.co" rel="nofollow">Phoenix</a>,
      <a href="http://github.com/fiatjaf/seed-auth">SeedAuth</a>,
      <a href="https://lightning-wallet.com" rel="nofollow">SimpleBitcoinWallet</a>,
      <a href="https://www.thunderhub.io" rel="nofollow">ThunderHub</a>,
      <a href="https://zaphq.io/" rel="nofollow">Zap Desktop</a>,
      <a href="https://zeusln.app" rel="nofollow">Zeus</a>

      <h3>Can I use Zerologin without a Bitcoin wallet?</h3>
      <p>
        Yes using <a href="http://github.com/fiatjaf/seed-auth">SeedAuth</a>. Soon the Zerologin
        native component will provide a Login/password alternative but still using LNURL specs.
      </p>

      <h3>Where are stored my users?</h3>
      <p>
        It is the responsibility of your application to store your users. Zerologin facilitates
        LNURL-Auth integration for everyone. You can link your users in your database using the user pubkey
      </p>

      <el-divider />

      <h2>Demo</h2>
      <p>
        A demo website is
        <a href="http://dolu.dev" target="_blank" rel="noopener noreferrer">available here</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/inertia-vue3'
const codeComponent = `<head>
  <script src="https://login.yoursuperwebsite.com/zerologin.js" defer />
</head>
<body>
  <h1>Your super website</h1>
  <zero-login zlurl="https://login.yoursuperwebsite.com"></zero-login>
</body>`
</script>

<style lang="scss" scoped>
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;

  .start {
    align-self: flex-start;
  }
}

pre {
  padding: 10px;
  background-color: #000;
  color: #fff;
  font-weight: bold;
}
</style>
