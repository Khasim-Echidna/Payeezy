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
    payeezy.transaction.purchase(
		{
     "transactionId": "o30446-pg30417-1458555741310",
     "currencyCode": "USD",
     "paymentId": "pg30417",
     "locale": "en",
     "gatewaySettings": {
          "paymentMethodTypes": "card",
          "filteredFields": ["paymentMethodTypes"]
     },
     "cardDetails": {
          "expirationMonth": "02",
          "expirationYear": "2018",
          "cvv": "234",
          "number": "4111111111111111",
          "type": "visa",
          "holderName": "Test Shopper"
     },
     "amount": "000000122526",
     "transactionType": "0100",
     "transactionTimestamp": "2016-03-21T10:22:21+0000",
     "billingAddress": {
          "lastName": "Shopper",
          "postalCode": "01242",
          "phoneNumber": "617-555-1977",
          "email": "tshopper@example.com",
          "state": "MA",
          "address1": "1 Main Street",
          "address2": "",
          "firstName": "Test",
          "city": "Cambridge",
          "country": "US"
     },
     "channel": "storefront",
     "shippingAddress": {
          "lastName": "Shopper",
          "postalCode": "01242",
          "phoneNumber": "617-555-1977",
          "email": "tshopper@example.com",
          "state": "MA",
          "address1": "1 Main Street",
          "address2": "",
          "firstName": "Test",
          "city": "Cambridge",
          "country": "US"
     },
     "orderId": "o30446",
     "paymentMethod": "card",
     "gatewayId": "gatewayDemo",
     "profile": {
          "id": "110454",
          "phoneNumber": "617-555-1977",
          "email": "tshopper@example.com"
     }
},
        function(error, response) {
            if (error) {
                console.log('Purchase Transaction Failed\n' + error);
				res.send(error);
            }
            if (response) {
                console.log('Purchase Successful.\nTransaction Tag: ' + response.transaction_tag);
				res.send(response);
                //performSecondaryTransaction(secondaryTransactionType, response.transaction_id, response.transaction_tag, response.amount);
            }
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