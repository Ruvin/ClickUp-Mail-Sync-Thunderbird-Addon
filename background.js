/**********************************************************************
 * 
 * * Copyright © Ruvin Roshan - 2025. All rights reserved. [ruvin@conscious.co.uk, ruvinroshan@gmail.com][https://ruvinroshan.com]
 * * Conscious Solutions Ltd. [https://www.conscious.co.uk/]
 *
 * This script is the sole property of Ruvin Roshan.  
 * Unauthorized use, modification, distribution, or reproduction of any part  
 * of this code, in whole or in segments, is strictly prohibited without  
 * explicit written permission from the owner.
 * 
 * This file is part of the Conscious Solutions ClickUp Thunderbird Plugin.
 *
 * The Conscious Solutions ClickUp Thunderbird Plugin
 * is Freeware:you can redistribute it and use for free.
 *
 * The Conscious Solutions ClickUp Thunderbird Plugin
 * is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * 
 *********************************************************************/ 

let CLIENT_ID = "";
let CLIENT_SECRET = "";
let REDIRECT_URI = "";
let CLK_TOKEN = "";
const URL_SET = "https://api.clickup.com/api/v2/";

// Function to load values from storage
function loadStoredValues() {
browser.storage.local.get(["clientId", "clientSecret", "redirectUrl", "clickupToken"]).then(data => {
if (data.clientId) CLIENT_ID = data.clientId;
if (data.clientSecret) CLIENT_SECRET = data.clientSecret;
if (data.redirectUrl) REDIRECT_URI = data.redirectUrl;
if (data.clickupToken) CLK_TOKEN = data.clickupToken;
}).catch(error => console.error("Error loading storage values:", error));
}

document.addEventListener("DOMContentLoaded", async () => {
loadStoredValues();
});

// Listener
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authWithClickup") {
        authClickup().then(sendResponse).catch(error => sendResponse({ error: error.message }));
        return true; // Required for async sendResponse
    }

});

// Generate a random state value for security
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}


// Function to handle authentication
async function authClickup() {   
    return openAuthWindow(); // Ensure it returns a value
}

// Function to open auth popup and return the access token
async function openAuthWindow() {
      let state = generateRandomState();
      await browser.storage.local.set({ clickup_oauth_state: state });

    let authUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;   
   // let authUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

    let authWindow = await browser.windows.create({
        url: authUrl,
        type: "popup",
        height: 635,
        width: 795
    });

    return checkForAuthCode(authWindow.id); // Return the token after auth
}

// Function to check for authorization code
async function checkForAuthCode(windowId) {
    return new Promise((resolve, reject) => {
        let interval = setInterval(async () => {
            try {
                let win = await browser.windows.get(windowId, { populate: true });

                if (!win) {
                    clearInterval(interval);
                    reject(new Error("Auth window closed before completion"));
                    return;
                }

                let tab = win.tabs[0];
                if (tab && tab.url.startsWith(REDIRECT_URI)) {
                    let url = new URL(tab.url);
                    let code = url.searchParams.get("code");

  let state = url.searchParams.get("state");

                    let storedState = (await browser.storage.local.get("clickup_oauth_state")).clickup_oauth_state;
                    if (state !== storedState) {
                        reject(new Error("Invalid state parameter"));
                        return;
                    }


                    if (code) {
                       // console.log("Authorization Code:", code);
                        clearInterval(interval);
                        await browser.windows.remove(windowId);

                        let tokenData = await exchangeAuthCodeForToken(code);
                        if (tokenData.access_token) {
                            resolve(tokenData); // Resolve with the access token
                        } else {
                            reject(new Error("Failed to get access token"));
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking auth window:", error);
                clearInterval(interval);
                reject(error);
            }
        }, 1000);
    });
}

// Exchange auth code for access token
async function exchangeAuthCodeForToken(code) {
    let url_endpoint = "oauth/token";
    let urlSet = new URL(url_endpoint, URL_SET);
    
    let response = await fetch(urlSet, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI
        })
    });

    let data = await response.json();
    if (data.access_token) {
        await browser.storage.local.set({ clickupToken: data.access_token });

        let teamData = await getTeamDetails();
        if (teamData.teams) {
            await browser.storage.local.set({ 
                teamName: teamData.teams[0].name, 
                teamId: teamData.teams[0].id 
            });
        }

        return data; // Return the token data
    } else {
        console.error("OAuth Error:", data);
        throw new Error("OAuthentication Error!");
    }
}

// Fetch team details
async function getTeamDetails() {
    return getData("team").catch(err => {
        console.error("Error fetching team details:", err);
        return null;
    });
}

// Generic GET request function
async function getData(url_endpoint = '') {
    let urlSet = new URL(url_endpoint, URL_SET);

    try {
        let storedData = await browser.storage.local.get(["clickupToken", "refreshToken"]);
        let token = storedData.clickupToken;

        let response = await fetch(urlSet, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        return await response.json();
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

/*
To set Thunderbird plugin options only when the plugin is first installed
@param:
The extension is installed (reason === "install")
The extension is updated (reason === "update")
The browser is updated (reason === "browser_update")
*/
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
       // console.log("Thunderbird extension installed. Setting default options");

        // Set default options in storage
        browser.storage.local.set({
            outsideFolders: false,
            searchByTaskID: true,
            searchByTag: false,
            saveMailAttachment: false
        }).then(() => {
            console.log("Default settings have been saved.");
        }).catch((error) => {
            console.error("Error setting default options:", error);
        });
    }
});

