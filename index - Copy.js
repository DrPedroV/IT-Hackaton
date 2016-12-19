'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
		    let text = event.message.text
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			} else if (text === 'Funky') {
			    sendFunkyMessage(sender)
                continue
			} else if (text === 'Philips') {
			    PhilipsProductSelectionMessage(sender)
			} else if (text === 'Shavers') {
                PhilipsShavers(sender)
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = process.env.FB_PAGE_ACCESS_TOKEN

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function PhilipsShavers(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "list",
                "elements": [
                    {
                        "title": "Men Series Shavers",
                        "image_url": "https://www.philips.co.uk/c-dam/b2c/mg-q4-campaign/en_GB/masthead/shaver-9000-masthead.png",
                        "subtitle": "See the whole Series Collection",
                        "buttons": [ {
                            "title": "View",
                            "type": "web_url",
                            "url": "http://www.philips.co.uk/c-m-pe/face-shavers/series-shavers/latest#filters=SERIES_SHAVERS_SU&sliders=&support=&price=&priceBoxes=&page=&layout=12.subcategory.p-grid-icon"
                        }
                        ]
                    },
                    {
                        "title": "Men Series Shavers",
                        "image_url": "https://www.philips.co.uk/c-dam/b2c/mg-q4-campaign/en_GB/masthead/shaver-9000-masthead.png",
                        "subtitle": "See the whole Series Collection",
                        "buttons": [{
                            "title": "View",
                            "type": "web_url",
                            "url": "http://www.philips.co.uk/c-m-pe/face-shavers/series-shavers/latest#filters=SERIES_SHAVERS_SU&sliders=&support=&price=&priceBoxes=&page=&layout=12.subcategory.p-grid-icon"
                        }
                        ]
                    }
                ]
            }
        }
    }

    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function PhilipsProductSelectionMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "OneBlade",
                    "subtitle": "Not a shaver, OneBlae does it all",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/QP2520_25-IMS-en_GB",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.philips.co.uk/c-m-pe/oneblade-face-style-and-shave",
                        "webview_height_ratio": "compact",
                        "title": "Product Info"
                    }, {
                        "type": "web_url",
                        "title": "Buy",
                        "url": "https://www.shop.philips.co.uk/cart?_ref=ca-wtb&_refv=91aea35a-9ed8-4b96-8656-6a0e15467c19"
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }

    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendFunkyMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "The POWER of node.js in Messenger",
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Show OneBlade",
                        "payload": "Payload content"
                    },
                    {
                        "type": "web_url",
                        "title": "Show OneBlade Product Page",
                        "url": "http://www.philips.co.uk/c-m-pe/oneblade-face-style-and-shave",
                        "webview_height_ratio": "compact"
                    }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.8/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
