import QRCode from 'qrcode'
import { defineCustomElement } from 'vue'

const MyVueElement = defineCustomElement({
  props: { zlurl: String },
  emits: {},
  data() {
    return {
      lnurl: '',
    }
  },
  template: `
  <div class="zl">
    <canvas class="zl-canvas" ref="canvas"></canvas>
    <div class="zl-lnurl-input-group">
      <input type="text" v-model="lnurl" disabled="true" />
      <button type="button" @click="copy()">Copy</button>
    </div>
  </div>
  `,
  styles: [`
  .zl{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  `],
  methods: {
    copy() {
      navigator.clipboard.writeText(this.lnurl);
    }
  },
  mounted() {
    const source = new EventSource(this.zlurl + '/sse/lnurl')
    source.addEventListener(
      'message',
      (e) => {
        const parsed = JSON.parse(e.data)
        console.log(parsed)
        console.log(parsed.message)
        if (parsed.message === 'challenge') {
          this.lnurl = parsed.encoded
          QRCode.toCanvas(this.$refs.canvas, parsed.encoded, function (error) {
            if (error) console.error(error)
          })
        }
        if (parsed.message === 'loggedin') {
          console.log('in loggedin', { ...parsed })
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