// Sandbox Credentials below
var apikey = 'DlQevR0qblMAoJXMWGnK6tFmspdCCsjL';
var apisecret = 'f09b001b16eab639ae52e3d543181d20640aca5b74a1c29b2f481e578519448a';
var merchant_token = 'fdoa-38e9f8cdd3da8fe04c382f4549c23ddc38e9f8cdd3da8fe0';

var payeezy = require('payeezy')(apikey, apisecret, merchant_token);
payeezy.version = "v1";


// Sandbox Environment - Replace this value for Live Environment "api.payeezy.com"
payeezy.host = "api-cert.payeezy.com";


// This will first execute an Auth followed by a Capture transaction .. followed by
// Auth followed by Void .. followed by
// Purchase followed by a Refund transaction
//runExamples();


// Below are the helper methods that will perform Authorize, Purchase, Capture, Void & Refund.

function runExamples() {
    performAuthorizeTransaction('capture');
}

exports.performAuthorizeTransaction = function(secondaryTransactionType) {
    console.log('*******************************************\nPerforming Authorize Transaction\n************************************')
    payeezy.transaction.authorize({
            method: 'credit_card',
            amount: '1299',
            currency_code: 'USD',
            credit_card: {
                card_number: '4788250000028291',
                cvv: '123',
                type: 'visa',
                exp_date: '1230',
                cardholder_name: 'Tom Eck'
            },
            billing_address: {
                street: '225 Liberty Street',
                city: 'NYC',
                state_province: 'NY',
                zip_postal_code: '10281',
                country: 'US'
            }
        },
        function(error, response) {
            if (error) {
                //console.log('Authorize Transaction Failed\n' + JSON.stringify(error));
				return JSON.stringify(error);
            }
            if (response) {
                //console.log('Authorize Successful.\nTransaction Tag: ' + response.transaction_tag);
                performSecondaryTransaction(secondaryTransactionType, response.transaction_id, response.transaction_tag, response.amount);
            }
        });

}



exports.performPurchaseTransaction = function(req, res) {
    //console.log('*******************************************\nPerforming Purchase Transaction\n************************************')
	var obj = {
	  "merchant_ref": "Astonishing-Sale",
	  "transaction_type": "purchase",
	  "method": "credit_card",
	  "amount": req.body.amount,
	  "partial_redemption": "false",
	  "currency_code": req.body.currencyCode,
	  "credit_card": {
		"type": req.body.cardDetails.type,
		"cardholder_name": req.body.cardDetails.holderName,
		"card_number": req.body.cardDetails.number,
		"exp_date": req.body.cardDetails.expirationMonth+req.body.cardDetails.expirationYear.slice(-2),
		"cvv": req.body.cardDetails.cvv
	  }
	};
	//console.log("--->"+obj);
	//console.log("-==->"+JSON.stringify(obj));
    payeezy.transaction.purchase(
		obj,
        function(error, response) {
            if (error) {
                //console.log('Purchase Transaction Failed\n' + error);
				res.send(error);
            }
            if (response) {
                //console.log('Purchase Successful.\nTransaction Tag: ' + response.transaction_tag);
				req.body.authorizationResponse = {
					  "responseCode": "1000",
					  "responseReason": response.bank_message,
					  "responseDescription": response.gateway_message,
					  "authorizationCode": response.gateway_resp_code,
					  "hostTransactionId": response.transaction_id,
					  "merchantTransactionId": response.transaction_id,
					  "token": response.token.token_data.value
				 };
				res.send(req.body);
                //performSecondaryTransaction(secondaryTransactionType, response.transaction_id, response.transaction_tag, response.amount);
            }
        });
}

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('cGnjNZ82NL45TUV10VtsgQ');
exports.SendEmail = function(req, res) {
	console.log("-------========------>"+JSON.stringify(req.body));
	var message = {
		"html": "<p>Example HTML content</p>",
		"text": "Example text content",
		"subject": "example subject",
		"from_email": "khasim.a@echidnainc.com",
		"from_name": "Example Name",
		"to": [{
				"email": "khasim.a@echidnainc.com",
				"name": "khasim ali",
				"type": "to"
			}],
		"headers": {
			"Reply-To": "khasim.a@echidnainc.com"
		},
		"important": false,
		"track_opens": null,
		"track_clicks": null,
		"auto_text": null,
		"auto_html": null,
		"inline_css": null,
		"url_strip_qs": null,
		"preserve_recipients": null,
		"view_content_link": null,
		"bcc_address": "khasim.a@echidnainc.com",
		"tracking_domain": null,
		"signing_domain": null,
		"return_path_domain": null,
		"merge": true,
		"merge_language": "mailchimp",
		"global_merge_vars": [{
				"name": "merge1",
				"content": "merge1 content"
			}],
		"merge_vars": [{
				"rcpt": "khasim.a@echidnainc.com",
				"vars": [{
						"name": "merge2",
						"content": "merge2 content"
					}]
			}],
		"tags": [
			"password-resets"
		],
		"subaccount": "customer-123",
		"google_analytics_domains": [
			"echidnainc.com"
		],
		"google_analytics_campaign": "khasim.a@echidnainc.com",
		"metadata": {
			"website": "www.echidnainc.com"
		},
		"recipient_metadata": [{
				"rcpt": "khasim.a@echidnainc.com",
				"values": {
					"user_id": 123456
				}
			}],
		"attachments": [{
				"type": "text/plain",
				"name": "myfile.txt",
				"content": "ZXhhbXBsZSBmaWxl"
			}],
		"images": [{
				"type": "image/png",
				"name": "IMAGECID",
				"content": "ZXhhbXBsZSBmaWxl"
			}]
	};
	var async = false;
	var ip_pool = "Main Pool";
	var send_at = new Date();
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
		console.log(result);
		/*
		[{
				"email": "recipient.email@example.com",
				"status": "sent",
				"reject_reason": "hard-bounce",
				"_id": "abc123abc123abc123abc123abc123"
			}]
		*/
	}, function(e) {
		// Mandrill returns the error as an object with name and message keys
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		// A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}

function performSecondaryTransaction(secondaryTransactionType, id, tag, amount) {

    if (secondaryTransactionType == 'capture') {
        console.log('*******************************************\nPerforming Capture Transaction\n************************************')

        payeezy.transaction.capture(id, {
                method: 'credit_card',
                amount: amount,
                currency_code: 'USD',
                transaction_tag: tag,
            },

            function(error, response) {
                if (error) {
                    console.log('Capture Transaction Failed\n' + error);
					return JSON.stringify(error);
                }
                if (response) {
                    console.log('Capture Successful');
					return JSON.stringify(response);
                    //performAuthorizeTransaction('void');
                }
            });

    } else if (secondaryTransactionType == 'refund') {
        console.log('*******************************************\nPerforming Refund Transaction\n************************************')

        payeezy.transaction.refund(id, {
                method: 'credit_card',
                amount: amount,
                currency_code: 'USD',
                credit_card: {
                    card_number: '4788250000028291',
                    cvv: '123',
                    type: 'visa',
                    exp_date: '1230',
                    cardholder_name: 'Tom Eck'
                },
            },

            function(error, response) {
                if (error) {
                    console.log('Refund Transaction Failed\n' + error);
                }
                if (response) {
                    console.log('Refund Successful');
                    generateToken();
                }
            });
    } else if (secondaryTransactionType == 'void') {
        console.log('*******************************************\nPerforming Void Transaction\n************************************')

        payeezy.transaction.void(id, {
                method: 'credit_card',
                amount: amount,
                currency_code: 'USD',
                transaction_tag: tag,
            },

            function(error, response) {
                if (error) {
                    console.log('Void Transaction Failed\n' + error);
                }
                if (response) {
                    console.log('Void Successful');
                    performPurchaseTransaction('refund');
                }
            });
    }

}

function generateToken() {
    console.log('*******************************************\nCreating FD-Token for a Credit Card\n************************************')

    payeezy.tokens.getToken({
            type: "FDToken",
            credit_card: {
                type: "VISA",
                cardholder_name: "Tom Eck",
                card_number: "4788250000028291",
                exp_date: "1030",
                cvv: "123"
            },
            auth: "false",
            ta_token: "NOIW"
        },
        function(error, response) {
            if (error) {
                console.log('Get Token for Card Failed\n' + error);
            }
            if (response) {
                console.log('FD-Token is generated Successfully, Token Value: ' + JSON.stringify(response.token, null, 4));
                tokenBasedAuthorizeTransaction();
            }
        });
}

function tokenBasedAuthorizeTransaction() {

    console.log('*******************************************\n Authorize using FD - Token \n************************************')

    payeezy.transaction.tokenAuthorize({
        merchant_ref: "Simple FD Token Authorize",
        method: "token",
        amount: "200",
        currency_code: "USD",
        token: {
            token_type: "FDToken",
            token_data: {
                type: "visa",
                value: "2537446225198291",
                cardholder_name: "Tom Eck",
                exp_date: "1030"
            }
        }
    }, function(error, response) {
        if (error) {
            console.log('Authorize Token Failed\n' + error);
        }
        if (response) {
            console.log('Authorize Token -  Success.\nTransaction Tag: ' + response.transaction_tag);
        }
    });
}