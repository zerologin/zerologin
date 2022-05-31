import QRCode from 'qrcode'
import { defineCustomElement } from 'vue'

const MyVueElement = defineCustomElement({
  props: { zlurl: String },
  emits: {},
  data() {
    return {
      lnurl: '',
      textCopy: 'Click to copy'
    }
  },
  template: `
  <div class="zl">
    <canvas class="zl-canvas" ref="canvas"></canvas>
    <div class="zl-lnurl-input-group" @click="copy()">
      <input type="text" v-model="lnurl" disabled="true" />
      <span class="zl-copy-text" ref="copyText">{{textCopy}}</span>
    </div>
    <div class="zl-powered">Powered by <a href="https://zerologin.co" target="_blank">Zerologin</a></div>
  </div>
  `,
  styles: [`
  .zl{
    display: flex;
    flex-direction: column;
    align-items: center;
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
  `],
  methods: {
    copy() {
      this.textCopy = 'Copied'
      navigator.clipboard.writeText(this.lnurl);
      setTimeout(() => { this.textCopy = 'Click to copy' }, 3000)
    }
  },
  mounted() {
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

    source.addEventListener(
      'open',
      function (e) {
        console.log(e)
      },
      false
    )

    // source.addEventListener(
    //   'error',
    //   function (e) {
    //     if (e.eventPhase == EventSource.CLOSED) source.close()
    //     if (e.target.readyState == EventSource.CLOSED) {
    //       console.log('Disconnected')
    //     } else if (e.target.readyState == EventSource.CONNECTING) {
    //       console.log('Connecting...')
    //     }
    //   },
    //   false
    // )
  },
})

customElements.define('zero-login', MyVueElement)