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
//document.getElementById("redirect_url").value = getdata.redirectUrl || "";

document.querySelector("#team-name").innerHTML = getdata.teamName || "";
document.querySelector("#team-id").innerHTML = getdata.teamId || "";

//default menu items
document.getElementById("outsideFolders").checked = getdata.outsideFolders;
document.getElementById("searchByTaskID").checked = getdata.searchByTaskID;
document.getElementById("searchByTag").checked = getdata.searchByTag;

document.getElementById("saveMailAttachment").checked = getdata.saveMailAttachment;

});

document.getElementById("saveButton").addEventListener("click", async () => {
let clientId = document.getElementById("clientId").value;
let clientSecret = document.getElementById("clientSecret").value;
let redirectUrl = document.getElementById("redirect_url").value;

let searchByTaskID = document.getElementById("searchByTaskID").checked;
let outsideFolders = document.getElementById("outsideFolders").checked;
let searchByTag = document.getElementById("searchByTag").checked;
let saveMailAttachment = document.getElementById("saveMailAttachment").checked;

// await browser.runtime.sendMessage({ action: "saveCredentials", clientId, clientSecret });
if(clientId == "" || clientSecret == "" || redirectUrl == ""){
alert("Please enter the required fields!");
return;  
}
saveCredentials(clientId, clientSecret,redirectUrl,searchByTaskID,outsideFolders,searchByTag,saveMailAttachment)
.then(data => {  
if(data){
  swal('Success!', 'Credentials saved successfully! \n\nPlease click - `Authenticate Clickup` after close this window', 'success')
.then(() => {
	 browser.runtime.reload(); 
});



}   
});
});







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



async function saveCredentials(clientId, clientSecret,redirectUrl,searchByTaskID,outsideFolders,searchByTag,saveMailAttachment) {
let status = false;
await browser.storage.local.set({ clientId, clientSecret, redirectUrl, searchByTaskID:searchByTaskID, outsideFolders:outsideFolders, searchByTag:searchByTag,saveMailAttachment:saveMailAttachment });
status = true;
return status;
}

async function getCredentials() {
let data = await browser.storage.local.get(["clientId", "clientSecret", "redirectUrl","teamName", "teamId", "searchByTaskID", "outsideFolders", "searchByTag","saveMailAttachment"]);
return data;
}

document.getElementById("deleteUserdata").addEventListener("click", async () => {
// Show confirmation dialog
let confirmDelete = confirm("Are you sure you want to clear all the stored data of the plugin? \nEg: Cliend ID, Cliend Secret, Redirect URI etc.");

if (confirmDelete) {
try {
let chkState = await browser.storage.local.clear();
	let setsearchByTaskID = true;
await browser.storage.local.set({  searchByTaskID:setsearchByTaskID });
alert("Storage cleared successfully!");


} catch (error) {
console.error("Error clearing storage:", error);
}

}
browser.runtime.reload();
});
