import QRCode from 'qrcode'
import { defineCustomElement } from 'vue'

const ZeroLoginElement = defineCustomElement({
  props: { zlurl: String },
  emits: {},
  data() {
    return {
      lnurl: '',
      textCopy: 'Click to copy',

      weblnSupported: false,
    }
  },
  template: `
  <div class="zl">
    <div class="zl-webln" v-if="weblnSupported">
        <div>Login browser extension detected</div>
        <button @click="weblnConnect()">Open</button>

        <div class="or-scan">or scan</div>
    </div>


    <canvas class="zl-canvas" ref="canvas"></canvas>
    <div class="zl-lnurl-input-group" @click="copy()">
      <input type="text" v-model="lnurl" disabled="true" />
      <span class="zl-copy-text" ref="copyText">{{textCopy}}</span>
    </div>
    <div class="zl-powered">Powered by <a href="https://zerologin.co" target="_blank">Zerologin</a></div>
  </div>
  `,
  methods: {
    copy() {
      this.textCopy = 'Copied'
      navigator.clipboard.writeText(this.lnurl)
      setTimeout(() => {
        this.textCopy = 'Click to copy'
      }, 3000)
    },
    async weblnConnect() {
      await window.webln.enable()
      try {
        await webln.lnurl(this.lnurl)
      }
      catch (e) {
        console.error(e);
      }
    }
  },
  async mounted() {
    const source = new EventSource(this.zlurl + '/sse/lnurl')
    source.addEventListener(
      'message',
      (e) => {
        const parsed = JSON.parse(e.data)
        if (parsed.message === 'challenge') {
          this.lnurl = parsed.encoded
          QRCode.toCanvas(this.$refs.canvas, parsed.encoded, function (error) {
            if (error) console.error(error)
          })


        }
        if (parsed.message === 'loggedin') {
          window.location = parsed.callback
        }
      },
      false
    )

    const maxInterval = 1500
    let currentIntervalChecking = 0;
    const intervalTime = 100
    const interval = setInterval(() => {
      currentIntervalChecking += intervalTime
      if (typeof window.webln !== 'undefined') {
        this.weblnSupported = true
        clearInterval(interval)
      }
      if (currentIntervalChecking >= maxInterval) {
        clearInterval(interval)
      }
    }, intervalTime)

  },
  styles: [
    `
  .zl{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .zl-webln {
    font-size: 12px;
    color: #626262;
    text-align: center;
  }
  .zl-webln > button {
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 15px;
    cursor: pointer;
    margin-top: 3px;
  }
  .zl-webln > button:hover {
    background-color: #4d4d4d;
  }

  .or-scan {
    margin-top: 15px;
    margin-bottom: 5px;
  }

  .zl-lnurl-input-group {
    position: relative;
    cursor: pointer;
  }
  .zl-lnurl-input-group > input {
    width: 180px;
    padding: 5px 10px;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 0;
    cursor: pointer;
  }
  .zl-lnurl-input-group > .zl-copy-text{
    position: absolute;
    top: 15%;
    left: 30%;
    display: none;
    cursor: pointer;
  }
  .zl-lnurl-input-group:hover > input{
    filter: blur(5px)
  }
  .zl-lnurl-input-group:hover > input + .zl-copy-text{
    display: block;
  }

  .zl-powered{
    margin-top:10px;
    font-size: 12px;
    color: #626262;
  }
  .zl-powered > a{
    color: #000;
  }
  `,
  ]
})

customElements.define('zero-login', ZeroLoginElement)
