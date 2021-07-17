async function xApp_init() {

    const xummApiKey = "76c6fc5c-7fba-4e7e-a733-488f03bc1558";

    const urlParams = new URLSearchParams(window.location.search);
    const oneTimeToken = urlParams.get('xAppToken') || '';
    const ottEndpoint = `https://testport.whirled.io/xapp/ott/${oneTimeToken}`;
    
    const res = await axios(ottEndpoint, { headers: {'x-api-key':xummApiKey} })
    
    await fetch('/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({type: "setKey",key: res.data.account, user: res.data.user})
    })  
    .then(response => {
        if(response.ok) {
            return response.json();
        }
    }).then( async(res) => {
            console.log(res.message);
    })
    
    await fetch('/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({type: "setDevice", device: "xApp"})
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        }
    }).then( async(res) => {
            console.log(res.message);
            Events.fire('add-color');
    })
}

//Open sign request
async function xApp_payload(data) {

    fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })           
        .then(response => {
            if(response.ok) {
                return response.json();
            }
        }).then(resp => {
            if(resp) {

                if (typeof window.ReactNativeWebView !== 'undefined') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    "command": "openSignRequest",
                    "uuid": resp.uuid
                  }))

                    const ws = new WebSocket(resp.websocket);
            
                    ws.onmessage = function(event) {
                        const response = JSON.parse(event.data);
            
                        if(Object.keys(response).indexOf('signed') > -1) {
                            console.log(response);
            
                            Events.fire('xumm-get-hash', {uuidPayload :response.payload_uuidv4, uuidCall :response.reference_call_uuidv4})
                            ws.close();
            
                        } else if (Object.keys(response).indexOf('opened') > -1){
                            Events.fire('signInOpen')
                        }else {
                            //wait for user to open or sign tx
                        };
                    }
                }

        }}).catch(err => console.error(err));
}






