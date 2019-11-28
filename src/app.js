const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow').v2beta1;
require('dotenv').config();

const webApp = express();

// Web app settings
webApp.use(bodyParser.json());
webApp.use(bodyParser.urlencoded({
    extended: true
}));

// Dialogflow settings
const secretData = JSON.parse(process.env.CREDENTIALS);

const projectId = secretData['project_id'];
const kbID = process.env.KBID;
const knowledgeBaseFullName = `projects/${projectId}/knowledgeBases/${kbID}`;

// Instantiate a DialogFlow Documents client.
const documentClient = new dialogflow.DocumentsClient({
    projectId: projectId,
    credentials: {
        private_key: secretData['private_key'],
        client_email: secretData['client_email']
    }
});

// Webhook GET method to check it's working
webApp.get('/', (req, res) => {
    res.send('Hello World');
});

// Function to insert new document to the knowledgbase
const insertNewDocument = (req) => {

    let outputContexts = req['body']['queryResult']['outputContexts'];
    let documentName, knowledgeTypes = 'FAQ', mimeType, documentPath;

    outputContexts.forEach(oc => {
        if (oc['name'].includes('session-vars')) {
            documentName = oc['parameters']['docName']
            mimeType = `text/${oc['parameters']['mimeType']}`;
            documentPath = oc['parameters']['url'];
        }
    });

    if (documentName) {

        let request = {
            parent: knowledgeBaseFullName,
            document: {
                knowledgeTypes: [knowledgeTypes],
                displayName: documentName,
                contentUri: documentPath,
                source: `contentUri`,
                mimeType: mimeType,
            },
        };

        documentClient.createDocument(request)
            .then(response => {

                const [operation, initialApiResponse] = response;
                console.log('Inside the function.');

                operation.on('complete', (result, metadata, finalApiResponse) => {
                    // doSomethingWith(result)
                    console.log('Inside complete');
                    console.log('The result --> ', result);
                });

                operation.on('progress', (metadata, apiResponse) => {
                    // doSomethingWith(metadata)
                    console.log('Inside progress');
                });

                operation.on('error', err => {
                    console.log('Error at createDocument --> ', err);
                });
            })
            .catch(error => {
                console.log('Error at createDocument --> ', error);
            });

        return {
            'followupEventInput': {
                name: 'event-one'
            }
        };

    } else {
        return {
            'fulfillmentText': 'Something is not right, contact admin.'
        };
    }

};


// Webhook get method, Dialogflow will send request here
webApp.post('/webhook', async (req, res) => {

    // Get the action of the query
    let action = req['body']['queryResult']['action'];
    if (action === 'provides-url') {
        let responseText = insertNewDocument(req);
        res.send(responseText);
    } else {
        res.send({
            'fulfillmentText': 'Something is not right, contact admin.'
        });
    }
});

webApp.post('/webhookZoho', (req, res) => {

    let documentName = req['body']['doc_name'];
    let knowledgeTypes = 'FAQ'; 
    let mimeType = req['body']['mime_type']
    let documentPath = req['body']['url'];

    let tempurl = documentPath.split(' ')[2];
    let url = tempurl.slice(1, -1);

    let request = {
        parent: knowledgeBaseFullName,
        document: {
            knowledgeTypes: [knowledgeTypes],
            displayName: documentName,
            contentUri: url,
            source: `contentUri`,
            mimeType: mimeType,
        },
    };

    documentClient.createDocument(request)
        .then(response => {

            const [operation, initialApiResponse] = response;
            console.log('Inside the function.');

            operation.on('complete', (result, metadata, finalApiResponse) => {
                // doSomethingWith(result)
                console.log('Inside complete');
                console.log('The result --> ', result);
            });

            operation.on('progress', (metadata, apiResponse) => {
                // doSomethingWith(metadata)
                console.log('Inside progress');
            });

            operation.on('error', err => {
                console.log('Error at createDocument --> ', err);
            });
        })
        .catch(error => {
            console.log('Error at createDocument --> ', error);
        });

    res.sendStatus(200);
});

webApp.listen(process.env.PORT, () => {
    console.log(`Server is started on port ${process.env.PORT}.`);
});