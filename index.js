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
    classifier.addDocument('Hoi', 'welcome');
    classifier.addDocument('issues', 'help');
    classifier.addDocument('help', 'help');
    classifier.addDocument('problem', 'help');
    classifier.addDocument('fail', 'help');
    classifier.addDocument('failure', 'help');
    classifier.addDocument('does not work', 'help');
    classifier.addDocument('Shavers', 'shavers');
    classifier.addDocument('shavers', 'shavers');
    classifier.addDocument('Generic', 'generic');
    classifier.addDocument('Philips', 'philips');
    classifier.addDocument('qqqqqqq', 'error');
    classifier.addDocument('Peter', 'name');
    classifier.addDocument('replacement', 'replacement');
    classifier.addDocument('information', 'information');
    classifier.addDocument('new', 'new');
    classifier.addDocument('location', 'location');
    classifier.addDocument('buy', 'new');
    classifier.addDocument('know', 'new');
    classifier.addDocument('looking', 'new');
    classifier.addDocument('feeding', 'feeding');
    classifier.addDocument('monitoring', 'monitoring');
    classifier.addDocument('details', 'details');
    classifier.addDocument('ProductFeeding', 'ProductFeeding');
    classifier.addDocument('ProductMonitoring', 'ProductMonitoring');
    classifier.addDocument('smart', 'smart');
    classifier.addDocument('sub-category', 'sub-category');
    classifier.addDocument('informationonsmart', 'informationonsmart');
    classifier.addDocument('MAC1', 'smartyes');
    classifier.addDocument('Strong', 'smartyes');
    classifier.addDocument('Green', 'green');
    classifier.addDocument('yes', 'yes');
    classifier.addDocument('end', 'end');
    classifier.addDocument('no', 'no');
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

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = process.env.FB_PAGE_ACCESS_TOKEN

function classifyText(sender, classify, text) {
    switch (classify) {
        case 'welcome':
            //let user_details_params = { 'fields': 'first_name', 'access_token': token };
            //let user_details = JSON.stringify(request.get("https://graph.facebook.com/v2.6/${request.sender}?fields=first_name&access_token=${token}"));
            //console.log("USER = " + user_details);
            //let name = user_details['first_name'];

            let name = ""
            let name2 = ""

            let url = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAAYepm9TRtoBAENBBsfcbW23T0Qh5yTYRA03QFZCLFLxu1aZBePST1i5X6GxrZAR8WSrRU7gLzjs1RpQF9CAIAO2JcZBDZA9QvktqS2CVF9TDpC5XLv5EnOo3U33P0KB4HzokMbWRu0FgRib7P5ZCnqdCcZCBo4YNZAtZA8bVE8pm6AZDZD"

            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let xbody = JSON.stringify(body)
                    let split = body.split(':')
                    name = split[1].replace("}", "")
                    name2 = name.replace(/\"/g, "")
                    sendTextMessage(sender, "Hi " + name2 + ", Welcome to Philips Consumer Care.  My name is Mac. How can I help you ?");
                    //sendImageMessage(sender);
                    //console.log() 
                }
            });

            
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
        case 'new':
            sendNewMenu(sender);
            break;
        case 'location':
            sendLocation(sender);
            break;
        case 'information':
            sendInformationMenu(sender);
            break;
        case 'feeding':
            sendFeedingProductsMenu(sender);
            break;
        case 'monitoring':
            sendProductsMonitoringMenu(sender);
            break;
       // case 'ProductFeeding':
       //     sendProductsfeedingdetailsMenu(sender);
       //     break;
        case 'ProductMonitoring':
            sendProductsMonitoringMenu(sender);
            break;
        case 'details':
            sendProductsfeedingdetailsMenu(sender);
            break;
        case 'smart':
            sendhelpissuesMenu(sender);
            break;
        case 'sub-category':
            sendhelpissuesmonitoringsubcategoriesMenu(sender);
            break;
        case 'informationonsmart':
            sendsmartcategoryquestionsMenu(sender, "");
            break;
        case 'smartyes':
            sendsmartcategoryquestionsMenu(sender, classify);
            break;
        case 'green':
            sendsmartcategoryquestionsMenu(sender, classify);
            break;
        case 'yes':
            sendsmartcategoryquestionsMenu(sender, classify);
            break;
        case 'no':
            sendsmartcategoryquestionsMenu(sender, classify);
            break;
        case 'end':
            sendImageMessage(sender);
            break;
        case 'error':
            sendTextMessage(sender, "I did not understand your request ?");
        default:
            sendTextMessage(sender, "I did not understand your request ?");
            break;
    }
    console.log('Classifier = ' + classify)
}




function sendLocation(sender) {
    let messageData = {
        "text": "Please share your location",
        "quick_replies": [
            {
                "content_type":"location",
            }
        ]
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

function sendNewMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Feeding",
                    "subtitle": "Avent",
                    "image_url": "http://www.mothercare.com/on/demandware.static/-/Sites-MCENGB-Library/default/dw2f2e0649/brand-pages/responsivebrandpages/philips/images/banner1.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "feeding",
                    }
                    ],
                }, {
                    "title": "Monitoring",
                    "subtitle": "Avent",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCD860_05-A2P-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "monitoring",
                    }],
                }, {
                    "title": "Accesories",
                    "subtitle": "Avent",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF334_02-U2P-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "Products",
                    }],
                }
                ]
            }
        }
    }

    let name = ""
    let name2 = ""

    let url = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAAYepm9TRtoBAENBBsfcbW23T0Qh5yTYRA03QFZCLFLxu1aZBePST1i5X6GxrZAR8WSrRU7gLzjs1RpQF9CAIAO2JcZBDZA9QvktqS2CVF9TDpC5XLv5EnOo3U33P0KB4HzokMbWRu0FgRib7P5ZCnqdCcZCBo4YNZAtZA8bVE8pm6AZDZD"

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let xbody = JSON.stringify(body)
            let split = body.split(':')
            name = split[1].replace("}", "")
            name2 = name.replace(/\"/g, "")
            sendTextMessage(sender, "Thank you for your interest " + name2 + ", Please have a look at our product lines");
            //console.log() 
        }
    });

    //sendTextMessage(sender, "So " + name2 + ", Please have a look at our product lines");

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

function sendInformationMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Feeding",
                    "subtitle": "Avent",
                    "image_url": "http://www.mothercare.com/on/demandware.static/-/Sites-MCENGB-Library/default/dw2f2e0649/brand-pages/responsivebrandpages/philips/images/banner1.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "feeding",
                    }
                    ],
                }, {
                    "title": "Monitoring",
                    "subtitle": "Avent",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCD860_05-A2P-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "monitoring",
                    }],
                }, {
                    "title": "Accesories",
                    "subtitle": "Avent",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF334_02-U2P-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "postback",
                        "title": "Products",
                        "payload": "Products",
                    }],
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

function sendProductsMonitoringMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Audio",
                    "subtitle": "Monitoring",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCD560_01-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/baby-monitors/c/MCC_BABY_MONITORS_CA?q=:relevance:category:MCC_AUDIO_MONITORS_SU",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }],
                }, {
                    "title": "Video",
                    "subtitle": "Monitoring",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCD860_05-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/baby-monitors/smart-baby-monitors/c/MCC_SMART_MONITORS_SU",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }],
                },
                                                                {
                                                                    "title": "Spare parts",
                                                                    "subtitle": "Monitoring",
                                                                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/CRP393_01-RTP-global-001?wid=500&hei=500&$jpglarge$",
                                                                    "buttons": [{
                                                                        "type": "web_url",
                                                                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/baby-monitors/spare-parts/c/MCC_MONITORS_SPARE_PARTS_SU",
                                                                        "webview_height_ratio": "compact",
                                                                        "title": "Buy"
                                                                    }],
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



function sendFeedingProductsMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Breast Pump",
                    "subtitle": "Feeding",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF334_02-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/breast-pumps-and-care/breast-pumps/avent-breast-pumps-comfort-double-electric-breast-pump/p/SCF334_02",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }, {
                        "type": "postback",
                        "title": "Show all products",
                        "payload": "Details",
                    }

                    ],
                }, {
                    "title": "Bottle",
                    "subtitle": "Feeding",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF563_17-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/baby-bottles-and-teats/c/MCC_BOTTLE_FEEDING_CA",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }],
                }
                ]
            }
        }
    }

    let name = ""
    let name2 = ""

    let url = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAAYepm9TRtoBAENBBsfcbW23T0Qh5yTYRA03QFZCLFLxu1aZBePST1i5X6GxrZAR8WSrRU7gLzjs1RpQF9CAIAO2JcZBDZA9QvktqS2CVF9TDpC5XLv5EnOo3U33P0KB4HzokMbWRu0FgRib7P5ZCnqdCcZCBo4YNZAtZA8bVE8pm6AZDZD"

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let xbody = JSON.stringify(body)
            let split = body.split(':')
            name = split[1].replace("}", "")
            name2 = name.replace(/\"/g, "")
            sendTextMessage(sender, "Oh very nice " + name2 + ". These are our feeding products of today.  What are you most interested in ?");
            //console.log() 
        }
    });

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
                        "type": "web_url",
                        "url": "https://www.philips.co.uk/myphilips/login?resource=%2Fmyphilips%2Fregister-product.html%3Fctn%3DSCD860%2F05%26loc%3Den_GB%26cl%3Dpdp#tab=log-in"
,
                        "webview_height_ratio": "compact",
                        "title": "Product Replacement"
                    }],
                }, {
                    "title": "Product Malfunctioning",
                    "subtitle": "",
                    "image_url": "http://www.counseloroffices.net/wp-content/uploads/2015/04/Chicago-Product-Liability-Attorney.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Help to solve issues",
                        "payload": "smart",
                    }],
                }]
            }
        }
    }

    let name = ""
    let name2 = ""

    let url = "https://graph.facebook.com/v2.6/" + sender + "?fields=first_name&access_token=EAAYepm9TRtoBAENBBsfcbW23T0Qh5yTYRA03QFZCLFLxu1aZBePST1i5X6GxrZAR8WSrRU7gLzjs1RpQF9CAIAO2JcZBDZA9QvktqS2CVF9TDpC5XLv5EnOo3U33P0KB4HzokMbWRu0FgRib7P5ZCnqdCcZCBo4YNZAtZA8bVE8pm6AZDZD"

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let xbody = JSON.stringify(body)
            let split = body.split(':')
            name = split[1].replace("}", "")
            name2 = name.replace(/\"/g, "")
            sendTextMessage(sender, "Sorry to hear " + name2 + ". Can you let me know what kind of issue you have ?");
            //console.log() 
        }
    });
                
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

// new function for product malfunctioning 
function sendhelpissuesMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Feeding",
                    "subtitle": "Coming soon...",
                    //"image_url": "https://media.coindesk.com/uploads/2014/04/shutterstock_17561926-300x185.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Coming soon",
                        "payload": "XXX",
                    }],
                }, {
                    "title": "Monitoring",
                    "subtitle": "Product Help",
                    //"image_url": "http://www.counseloroffices.net/wp-content/uploads/2015/04/Chicago-Product-Liability-Attorney.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Show categories",
                        "payload": "sub-category",
                    }],
                },
                                                                {
                                                                    "title": "Accessories",
                                                                    "subtitle": "Coming soon...",
                                                                    //"image_url": "http://www.counseloroffices.net/wp-content/uploads/2015/04/Chicago-Product-Liability-Attorney.jpg",
                                                                    "buttons": [{
                                                                        "type": "postback",
                                                                        "title": "Coming soon...",
                                                                        "payload": "XXX",
                                                                    }],
                                                                }]
            }
        }
    }

    sendTextMessage(sender, "Please make a selection of te below categories");

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

    // new function for product malfunctioning monitoring subcategories
    function sendhelpissuesmonitoringsubcategoriesMenu(sender) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Smart baby monitors",
                        "subtitle": "Product help",
                        //"image_url": "https://media.coindesk.com/uploads/2014/04/shutterstock_17561926-300x185.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Initiate assistance",
                            "payload": "informationonsmart",
                        }],
                    }, {
                        "title": "others",
                        "subtitle": "product help",
                        //"image_url": "http://www.counseloroffices.net/wp-content/uploads/2015/04/Chicago-Product-Liability-Attorney.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Coming soon...",
                            "payload": "Coming soon...",
                        }],
                        }
                    ]
                }
            }
        }

        sendTextMessage(sender, "Please make a selection of the below categories");
                
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


    // new function for product malfunctioning monitoring subcategories
    function sendsmartcategoryquestionsMenu(sender, check) {
        let messageData = "";
        if (check === "") {
            messageData = {
                "text": "What is the strength of your current Wifi signal?",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Strong",
                        "payload": "MAC1"
                    },
                    {
                        "content_type": "text",
                        "title": "Weak",
                        "payload": "Weak"
                    }
                ]


            }
        }
        else if (check === "smartyes") {
            messageData = {
                "text": "Whats the color on your Wifi light on your monitor ?",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Red",
                        "payload": "Red"
                    },
                    {
                        "content_type": "text",
                        "title": "Green",
                        "payload": "Green"
                    }
                ]


            }
        }
        else if (check === "green") {
            messageData = {
                "text": "Are more then 3 people using the app ? ?",
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Yes",
                        "payload": "yes"
                    },
                    {
                        "content_type": "text",
                        "title": "No",
                        "payload": "no"
                    }
                ]


            }
        }
        else if (check === "yes") {
            let text = "We have identified the issue.  Please login as an administrator and de-activate the others." 
            messageData = { text: text }
        }
        else if (check === "no") {
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Call REAL person",
                            "subtitle": "Support officer",
                            //"image_url": "https://media.coindesk.com/uploads/2014/04/shutterstock_17561926-300x185.jpg",
                            "buttons": [{
                                "type": "phone_number",
                                "title": "Call Representative",
                                "payload": "+31621918786",
                            }],
                        }
                        ]
                    }
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



function sendProductsfeedingMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Breast Pump",
                    "subtitle": "Feeding",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF334_02-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/breast-pumps-and-care/breast-pumps/avent-breast-pumps-comfort-double-electric-breast-pump/p/SCF334_02",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }, {
                        "type": "postback",
                        "title": "Show all products",
                        "payload": "Details",
                    }

                    ],
                }, {
                    "title": "Bottle",
                    "subtitle": "Feeding",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF563_17-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/baby-bottles-and-teats/c/MCC_BOTTLE_FEEDING_CA",
                        "webview_height_ratio": "compact",
                        "title": "Buy"
                    }],
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


function sendProductsfeedingdetailsMenu(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic", 
                "elements": [{
                    "title": "Avent Comfort Manual breast pump",
                    "subtitle": "Breast Pump",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF330_20-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/breast-pumps-and-care/breast-pumps/avent-breast-pumps-comfort-manual-breast-pump/p/SCF330_20",
                        "webview_height_ratio": "compact",
                        "title": "Details"
                    } ],
                }, {
                    "title": "Avent Comfort single electric breast pump",
                    "subtitle": "Breast Pump",
                    "image_url": "https://images.philips.com/is/image/PhilipsConsumer/SCF332_01-RTP-global-001?wid=500&hei=500&$jpglarge$",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.shop.philips.co.uk/mother-and-child-care/breast-pumps-and-care/breast-pumps/avent-breast-pumps-comfort-single-electric-breast-pump/p/SCF332_01",
                        "webview_height_ratio": "compact",
                        "title": "Details"
                    }],
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

function sendImageMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": "http://dedoornenburger.nl/wp-content/uploads/applaus-300x200.jpg"
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
//classifier.events.on('trainedWithDocument', function (obj) {
//    console.log(obj);
//});

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
