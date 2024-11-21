const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Environment variables
const { CLIENT_ID, CLIENT_SECRET, TENANT_ID, DYNAMICS_INSTANCE } = process.env;

// Endpoint to fetch access token
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

// Endpoint to fetch contacts from Dynamics 365
const CONTACTS_URL = `https://${DYNAMICS_INSTANCE}/api/data/v9.0/contacts?$expand=account_primary_contact,deals,sharepointdocumentlocation`;
const ACCOUNTS_URL = `https://${DYNAMICS_INSTANCE}/api/data/v9.0/accounts?$expand=account_primary_contact,deals,sharepointdocumentlocation`;

/**
 * Fetch Access Token from Azure AD
 */
async function getAccessToken() {
  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: `https://${DYNAMICS_INSTANCE}/.default`,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error.response.data);
    throw new Error("Failed to retrieve access token");
  }
}

/**
 * Fetch Contacts from Dynamics 365
 */
async function fetchContacts(accessToken) {
  try {
    const response = await axios.get(CONTACTS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
      },
    });
    return response.data.value;
  } catch (error) {
    console.error("Error fetching contacts:", error.response.data);
    throw new Error("Failed to retrieve contacts");
  }
}

/**
 * Main Route: Fetch and Display Contacts
 */
app.get("/contacts", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const contacts = await fetchContacts(accessToken);
    res.json(contacts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



/**
 * Fetch Account from Dynamics 365
 */
async function fetchAccounts(accessToken) {
    try {
      const response = await axios.get(ACCOUNTS_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
        },
      });
      return response.data.value;
    } catch (error) {
      console.error("Error fetching contacts:", error.response.data);
      throw new Error("Failed to retrieve contacts");
    }
  }
  
  /**
   * Main Route: Fetch and Display Contacts
   */
  app.get("/accounts", async (req, res) => {
    try {
      const accessToken = await getAccessToken();
      const accounts = await fetchAccounts(accessToken);
      res.json(accounts);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

/**
 * Start the Express App
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//Then sent to hubspot and associate