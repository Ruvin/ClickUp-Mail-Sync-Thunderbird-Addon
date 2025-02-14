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

document.addEventListener("DOMContentLoaded", async () => {
let getdata = await getCredentials();
document.getElementById("clientId").value = getdata.clientId || "";
document.getElementById("clientSecret").value = getdata.clientSecret || "";
document.getElementById("redirect_url").value = getdata.redirectUrl || "";

document.querySelector("#team-name").innerHTML = getdata.teamName || "";
document.querySelector("#team-id").innerHTML = getdata.teamId || "";
});

document.getElementById("saveButton").addEventListener("click", async () => {
let clientId = document.getElementById("clientId").value;
let clientSecret = document.getElementById("clientSecret").value;
let redirectUrl = document.getElementById("redirect_url").value;

// await browser.runtime.sendMessage({ action: "saveCredentials", clientId, clientSecret });
if(clientId == "" || clientSecret == "" || redirectUrl == ""){
alert("Please enter the required fields!");
return;  
}
saveCredentials(clientId, clientSecret,redirectUrl)
.then(data => {  
if(data){
  swal('Success!', 'Credentials saved successfully! \n\nPlease click - `Authenticate Clickup` after close this window', 'success')
.then(() => {
	 browser.runtime.reload(); 
});


// .then(() => {
// // saveAndLogin_to_Clickup(); // Login to Clickup app 
// });

}   
});
});



// async function saveAndLogin_to_Clickup() {
//     try {
//         let data = await browser.runtime.sendMessage({ action: "loginClickup" });
//         console.log('Access Token:', data);
//      } catch (error) {
//         console.error("Error during authentication:", error);
//   }
// }



document.getElementById("clk_auth_clickup").addEventListener("click", async () => {
try {
let data = await browser.runtime.sendMessage({ action: "authWithClickup" });

if (!data || data.access_token === undefined) {
throw new Error("Invalid response from background script");
}
if (data.access_token) {
swal('Success!', 'You have successfully authenticated with ClickUp!', 'success')
.then(() => {
browser.runtime.reload();
});

//browser.runtime.reload();
// alert("You have successfully authenticated with ClickUp!");
} else {
swal('Error!', 'ClickUp authentication failed. Please check your credentials!', 'error')
.then(() => {
browser.runtime.reload();
});
}
} catch (error) {
console.error("Error during authentication:", error);
swal('Error!', 'An error occurred while authenticating. Please try again.', 'error')
.then(() => {
browser.runtime.reload();
});

}
});



async function saveCredentials(clientId, clientSecret,redirectUrl) {
let status = false;
await browser.storage.local.set({ clientId, clientSecret, redirectUrl });
status = true;
return status;
}

async function getCredentials() {
let data = await browser.storage.local.get(["clientId", "clientSecret", "redirectUrl","teamName", "teamId"]);
return data;
}

document.getElementById("deleteUserdata").addEventListener("click", async () => {
// Show confirmation dialog
let confirmDelete = confirm("Are you sure you want to clear all stored data for the plugin? \nEg: Cliend ID, Cliend Secret, Redirect URI");

if (confirmDelete) {
try {
await browser.storage.local.clear();
// console.log("All local storage data cleared!");
alert("Storage cleared successfully!");
} catch (error) {
console.error("Error clearing storage:", error);
}

}
browser.runtime.reload();
});
