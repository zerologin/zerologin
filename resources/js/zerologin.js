import QRCode from 'qrcode'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    const zeroLoginContainer = document.querySelector('#zero-login')
    if (!zeroLoginContainer) return
    const source = new EventSource(APP_URL + '/sse/lnurl')
    const canvas = document.createElement('canvas')
    zeroLoginContainer.appendChild(canvas)
    const lnurlSpan = document.createElement('span')
    zeroLoginContainer.appendChild(lnurlSpan)

    source.addEventListener(
      'message',
      function (e) {
        const parsed = JSON.parse(e.data)
        console.log(parsed)
        console.log(parsed.message)
        if (parsed.message === 'challenge') {
          lnurlSpan.outerHTML = parsed.encoded
          QRCode.toCanvas(canvas, parsed.encoded, function (error) {
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
  false
)
