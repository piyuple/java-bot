var Botkit = require('botkit');
var request = require('request');
require('dotenv').config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
} else {
    console.log('variables intact!');
}

// payload for external API
var options = {
    method: 'POST',
    uri: process.env.SUBMISSION_URI,
    json: {
        source_code: "",
        language_id: process.env.LANGUAGE_ID,
        stdin: ""
    },
    headers: {
        'Content-type': 'application/json'
    }
}, token = null, result = null;

var controller = Botkit.slackbot({
    json_file_store: './db_slackbutton_slash_command/',
    debug: true,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET
});

controller.configureSlackApp({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    scopes: ['commands', 'bot']
});

var bot = controller.spawn({
    token: process.env.BOT_TOKEN,
    incoming_webhook: {
        url: 'slack_webhook_url_for_a_channel'
    }
}).startRTM();

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);
    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});

// sending payload
function callAPI() {
    console.log("calling external API");
    request(options, function (error, response, body) {
        console.log("response received");

        // status 201 is submission successful
        if (!error && response.statusCode == 201) {
            token = body.token;
            console.log(body); // API response.

            // querying the token received
            getSub();

        } else {
            console.log("DURING CALLING EXTERNAL API FOR TOKEN");
            console.log("Error: " + error + "\nResponse: " + JSON.stringify(response));
        }
    });
}

// querying external API with token
function getSub(valid, bot, message) {
    console.log("querying external API with token");
    request(options.uri + "/" + token, function (err, res, bdy) {
            console.log("response received");
            if (!err && res.statusCode == 200) {
                result = JSON.parse(bdy);
                // will need to bot.reply with the result
                // for bot.reply()
                if (valid)
                    bot.reply(message, 'Output: \n' + result.stdout);
                else
                    console.log("body:\n" + bdy);

            } else {
                console.log("DURING QUERYING EXTERNAL API WITH TOKEN");
                console.log("Error: " + err + "\nResponse: " + JSON.stringify(res));
            }
        });
}


controller.hears('hi', 'direct_message', function (bot, message) {
    bot.reply(message, "Hello!");
});

// commands
controller.on('slash_command', function (bot, message) {
    bot.replyAcknowledge(); // for 3000 ms limit
    switch (message.command) {
        case "/echo":
            bot.reply(message, '<@'+ message.user +'> heard ya!\nYour message was: ' + message.text);
            break;

        case "/java":
            // compilation logic through external API

            // updating source
            options.json.source_code = message.text;
            bot.reply(message, '<@' + message.user + '>!\nSource:\n' + message.text);
            // will be implementing stdin later

            callAPI();
            setTimeout(getSub, 15000, true, bot, message);
            /*bot = controller.spawn({
                    token: process.env.BOT_TOKEN,
                    incoming_webhook: {
                    url: 'slack_webhook_url_for_a_channel'
                }
            }).startRTM();
            */
            break;


        default:
            bot.reply(message, 'I don\'t think I can help you with that.');
    }
});


// for testing the external APIs
controller.on('direct_mention', function (bot, message) {
    bot.replyAcknowledge();
    console.log('The message was : ' + JSON.stringify(message, undefined, 4));
    switch (message.text) {
        case "hi":
        case "hello":
            bot.reply(message, 'hey <@'+ message.user + '>! Hope you\'re doing great today.\nYou can compile java code using the command: \\java <source_code>');
            break;

        case "help":
            bot.reply(message, 'hey <@'+ message.user +'>!\nIn case you have any trouble understanding code, contact <@piyuple>.');
            break;

        default:
            bot.reply(message, 'I don\'t understand English much.\nUnderstand Java though!\nPlease use the command \\java <source_code> to talk java.');
    }
});
