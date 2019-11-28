// Imports the Dialogflow client library
const dialogflow = require('dialogflow').v2beta1;
require('dotenv').config();

// Read the credentials
const secretData = JSON.parse(process.env.CREDENTIALS);

// Dialogflow Project ID
const projectId = secretData['project_id'];

// Create new KnowledgeBase
// Instantiate a DialogFlow KnowledgeBase client.
const knowledgeBaseClient = new dialogflow.KnowledgeBasesClient({
    projectId: projectId,
    credentials: {
        private_key: secretData['private_key'],
        client_email: secretData['client_email']
    }
});

const formattedParent = knowledgeBaseClient.projectPath(projectId);

// KnowledgeBase Name
const kbName = 'myKnowledgeBase'

const knowledgeBase = {
    displayName: kbName,
};
const request = {
    parent: formattedParent,
    knowledgeBase: knowledgeBase,
};

const createKB = async () => {

    let [result] = await knowledgeBaseClient.createKnowledgeBase(request);
    return result;
};

createKB()
    .then((result) => {
        console.log('Store this, we will need it later.');
        console.log(`Name: ${result.name}`);
        console.log(`displayName: ${result.displayName}`);
    })
    .catch((error) => {
        console.log('Error at createKB --> ', error);
    });
