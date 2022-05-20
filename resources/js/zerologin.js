import QRCode from 'qrcode'
import ky from 'ky'

document.addEventListener('DOMContentLoaded', function () {
    const source = new EventSource("https://zerologin.co/sse/lnurl");
    // const source = new EventSource("https://zl-server.loca.lt/sse/lnurl");
    // const source = new EventSource("http://localhost:3333/sse/lnurl");
    const zeroLoginContainer = document.querySelector('#zero-login')
    const canvas = document.createElement('canvas')
    zeroLoginContainer.appendChild(canvas)
    const lnurlSpan = document.createElement('span')
    zeroLoginContainer.appendChild(lnurlSpan)

    source.addEventListener(
        "message",
        function (e) {
            const parsed = JSON.parse(e.data);
            console.log(parsed);
            console.log(parsed.message);
            if (parsed.message === 'challenge') {
                lnurlSpan.outerHTML = parsed.encoded
                QRCode.toCanvas(canvas, parsed.encoded, function (error) {
                    if (error) console.error(error)
                })
            }
            if (parsed.message === "loggedin") {
                console.log("in loggedin", { ...parsed });
                // ky.post("http://localhost:3333/lnurl-login", { json: { ...parsed } }).then(r => {
                //     console.log(r)
                // });
                // ky.post("https://zl-server.loca.lt/lnurl-login", { json: { ...parsed } }).then(r => {
                //     console.log(r)
                // });
                ky.post("https://zerologin.co/lnurl-login", { json: { ...parsed } }).then(r => {
                    console.log(r)
                });
            }
        },
        false
    );

    source.addEventListener(
        "open",
        function (e) {
            console.log(e);
        },
        false
    );

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
}, false);
