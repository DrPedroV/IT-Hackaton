'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

// NLP libraries
const natural = require('natural')
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

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

function trainClassifier() {
    // classifier.retrain();
    classifier.addDocument('hello', 'welcome');
    classifier.addDocument('hi', 'welcome');
    classifier.addDocument('issues', 'help');
    classifier.addDocument('help', 'help');
    classifier.addDocument('problem', 'help');
    classifier.addDocument('Shavers', 'shavers');
    classifier.addDocument('shavers', 'shavers');
    classifier.addDocument('Generic', 'generic');
    classifier.addDocument('Philips', 'philips');
    classifier.addDocument('qqqqqqq', 'error');
    classifier.addDocument('Peter', 'name');
    classifier.addDocument('replacement', 'replacement');
    classifier.addDocument('information', 'information');
    classifier.train();
}

// to post data
app.post('/webhook/', function (req, res) {
    trainClassifier();
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
		    let text = event.message.text
            let classify = ""
		    classify = classifier.classify(text)
		    classifyText(sender, classify)
     }
		if (event.postback) {
		    let text = JSON.stringify(event.postback)
            let classify = ""
		    classify = classifier.classify(text)
		    classifyText(sender, classify)
			//sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})

function classifyText(sender, classify, text) {
    switch (classify) {
        case 'welcome':
            sendTextMessage(sender, "Welcome to Philips Consumer Care.  How can I help you ?");
            break;
        case 'generic':
            sendGenericMessage(sender);
            break;
        case 'help':
            sendHelpMenu(sender);
            break;
        case 'shavers':
            PhilipsShavers(sender);
            break;
        case 'philips':
            PhilipsProductSelectionMessage(sender);
            break;
        case 'name':
            sendTextMessage(sender, "Hi Peter");
            break;
        case 'error':
            sendTextMessage(sender, "I did not understand your request ?");
        default:
            sendTextMessage(sender, "I did not understand your request ?");
            break;
    }
    console.log('Classifier = ' + classify)
}


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = process.env.FB_PAGE_ACCESS_TOKEN

function sendHelpMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Product broken ?",
                    "subtitle": "",
                    "image_url": "https://media.coindesk.com/uploads/2014/04/shutterstock_17561926-300x185.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Click",
                        "payload": "replacement",
                    }],
                }, {
                    "title": "Product Malfunctioning",
                    "subtitle": "",
                    "image_url": "http://www.counseloroffices.net/wp-content/uploads/2015/04/Chicago-Product-Liability-Attorney.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Click",
                        "payload": "information",
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

function sendImageMessage(sender, text) {
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": "https://lh3.googleusercontent.com/rMY-8mgwwqt1uPbHA3tLDJ900LhAFye5VpFc8bdMSKaiBinug9Zx6rz84CTLmCKIrSkEVVP5EI2dIN51PGdk5O89bmyF_EiI_fZHC2YDllQ7uTReWzEO2PTLqLImG6y3VNidIZvVkTzzQuDGpkAcprMdYW0fyophggF5eOrowOzbyqryMmcJXyNbvHIQ1SuvE7evru3OsMlOAgXiXSdcEjJjD5dIQa8DXdS8MLXSp1eD8Gq6g2q3fbNnLVX5VJR5yS-uLbudfLpvUC2BMed7Ez1yYMjy2gKIPbCXhQXkvOYQ3LdcsUvMZM0eVLVQrAZn4u0_dgAT-KJp-MBQvz0ApENvYMtatqJLdup8dRLFNg1LlWVTsp2aI8gtgQebAMeZRfKQHd2eQB0f9WCiAXdaZ9feB8BmKG_OiuYXxPLDyAVYy68oixnPEZR9mXdtvZf3kllz9mTgP6ctI5BQvsOsCW34PEm_fkgWsoD3j0AHfVVLU2uTpXTK_Sj6l4z7u5dkt-cGvP1kCBLrLYYWtd0CzDQUPF97pNi1Sw4c_F34OF2mW1ZmJ7ZL6vJtXadmGDZnYN_-yBwywfuUVvLinEJUkjgfpe1-0K4fkvoNByK44dXJqF4kS3nO=s400-no"
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
                    "subtitle": "Not a shaver, OneBlade does it all",
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
                        "title": "Shavers",
                        "payload": "Shavers",
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

//Register to events coming from classifier library
classifier.events.on('trainedWithDocument', function (obj) {
    console.log(obj);
});

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
