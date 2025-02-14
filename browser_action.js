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
/*
*
Key points about ClickUp API authentication:
- No Refresh Token: As of now, ClickUp does not offer refresh tokens in their API. 
- Token Regeneration: If your API token is compromised, you can regenerate a new one within your ClickUp settings. 
*
*/




const URL_SET = "https://api.clickup.com/api/v2/";
const USER_GUIDE_URL = "https://github.com/Ruvin/ClickUp-Mail-Sync-Thunderbird-Addon/wiki";
let TEAM_ID = "";
let SAVE_TYPE = ""; // HTML or Plain TEXT
//const requests = {  accountCheckboxId : 'cliksyancaheckboranid' };

/*
* WINDOW INIT
* store gobel variables
*/
 const load = () => {
  continueCode();
}
window.onload = load;



/*
* Window Load after INIT
*/
async function continueCode(){
but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.add('disabled');
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = true;
//document.getElementById("cuSearchOption1").checked= true;




let targetLink = document.getElementById("cuSearchOptionM1");
if (targetLink) {
    targetLink.click(); // Trigger the click event
}


let getuserdata = await getUserDetails();
if(getuserdata){
let getTeamID = await setTeamID(); // get and set teamid to global variable 

if(getTeamID){
radioChangeHandler();
onLoadSpaces();
folderless_onLoadSpaces();
searchByTag_onLoadSpaces(); 
setSelboxVals(); 
RadioBut_DefaultSet();

}
}
}




saveWhenUserChangeRadioButtons(); // load the function Radio buttons
async function saveWhenUserChangeRadioButtons() {
    var radioButtons = document.querySelectorAll(".chg-radio-cls");
    radioButtons.forEach(function (radio) {
        radio.addEventListener("change", async function () {
            if (radio.checked) {
                let selID = radio.name;  // Use 'name' to group radios correctly
                let selVal = radio.id;
                SAVE_TYPE = radio.value; // set glob val
                await browser.storage.local.set({ [selID]: selVal });
            }
        });
    });
}





async function RadioBut_DefaultSet() {
let init_saveType = "TEXT";
let radiobut =  await browser.storage.local.get("cli_save_type");
if(radiobut.cli_save_type){
     let getRadiVal = document.getElementById(radiobut.cli_save_type).value;
    init_saveType = getRadiVal;
 document.getElementById(radiobut.cli_save_type).checked = true;  
}else{
document.getElementById("save_as_text").checked = true;   // default set
}
SAVE_TYPE = init_saveType;
return true;
}



saveSelBoxVals(); // load the function
async function saveSelBoxVals() {

  var selectBoxes = document.querySelectorAll(".clisync-storeval");

  selectBoxes.forEach(function (selectBox) {
    selectBox.addEventListener("change", async function () {

let selID = selectBox.id;
let selVal = selectBox.value;
await browser.storage.local.set({ [selID]: selVal});

  });
  });
}



async function setSelboxVals() {
  var selectBoxes = document.querySelectorAll(".clisync-storeval");
  let selectBoxVal = "";
  selectBoxes.forEach(async function (selectBox,index) {


let space_list_val =  await browser.storage.local.get([selectBox.id]); //await browser.storage.local.get(["space_list","foder_list","listOf_list"]);
selectBoxVal = space_list_val[selectBox.id];

if(selectBoxVal){
await selectValueAfterLoad(selectBox,selectBoxVal);
}

})

}









async function selectValueAfterLoad(selectBox, selectBoxVal) {
    let spaceList = document.getElementById(selectBox.id);

      // Use MutationObserver to detect changes in the select box
    let observer = new MutationObserver(() => {
        if (spaceList.querySelectorAll("option").length > 1) { // Ensure options are loaded
            spaceList.value = selectBoxVal; // Set the selected value
            
            // Trigger change event to simulate user selection
            let event = new Event("change", { bubbles: true });
            spaceList.dispatchEvent(event);
            
            observer.disconnect(); // Stop observing once the value is set
        }
    });

    observer.observe(spaceList, { childList: true });
}





async function getMsgFull(itemId) {
  return await browser.messages.getFull(itemId);

};



/*
* Search Button Task submit
*/

document.getElementById("but_seachTaskSubmit").onclick = async () => {

let selectedVal = '';
if(document.querySelector('input[name="searchTaskName"]:checked')){
   selectedVal = document.querySelector('input[name="searchTaskName"]:checked').value ;
}
let url = 'task/'+selectedVal+'/comment';



    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select at least one email!', 'warning');
        return;
    }
    if (selectedVal === '') {
        swal('Error!', 'Please select a Task!', 'warning');
       // alert('Please select a task from the drop-down');
        return;
    }

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }

        

 let cleanedEmailBody = removeQuotedText(emailBodyText);


if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            cleanedEmailBody = stripHtml(cleanedEmailBody);    
}

  
     




            let sendData = {
                "comment_text": cleanedEmailBody,
                "notify_all": false
            };

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }

swal('Success!', 'Mail List Successfully Saved!', 'success')
.then(() => {
    //window.location.reload(); // Example: Reload the page
   window.close(); // close window
});
    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }






};






 function getMailBodyHtmlorPlain(object, string) {
    var result;
    if (!object || typeof object !== 'object') return;
    Object.values(object).some(v => {
        if (v === string) return result = object;
        return result = getMailBodyHtmlorPlain(v, string);
    });
    return result;
};







/*
* Search Button Tag submit
*/

document.getElementById("but_seachTagSubmit").onclick = async () => {

let selectedVal = '';
if(document.querySelector('input[name="searchTagName"]:checked')){
   selectedVal = document.querySelector('input[name="searchTagName"]:checked').value ;
}
 
let url = 'task/'+selectedVal+'/comment';




    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select at least one email!', 'warning');
        return;
    }
    if (selectedVal === '') {
        swal('Error!', 'Please select a Task!', 'warning');
       // alert('Please select a task from the drop-down');
        return;
    }

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }

        

 let cleanedEmailBody = removeQuotedText(emailBodyText);


if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            cleanedEmailBody = stripHtml(cleanedEmailBody);    
}

  
     




            let sendData = {
                "comment_text": cleanedEmailBody,
                "notify_all": false
            };

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }

swal('Success!', 'Mail List Successfully Saved!', 'success')
.then(() => {
    //window.location.reload(); // Example: Reload the page
   window.close(); // close window
});
    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }



/*
let messageList = await browser.mailTabs.getSelectedMessages();
if (messageList.messages.length == 0) {
  //alert('Please Select least one email!');
   swal(
      'Error..!',
      'Please Select least one email!',
      'error'
    );
    return;
}
if (selectedVal == '') {
  alert('Please Select a Task!');
    return;
}

await messageList.messages.forEach(function(item, index) {
 getMsgFull(item.id).then(data => {
 let emailBodyText = data.parts[0].parts[0].body;


sendData = {
  "comment_text":emailBodyText, 
  "notify_all": false
};


 postData(url, sendData)
  .then(data => {
if(data == undefined){
  this.window.close();
}else{
alert('Mail List Successfully Saved!');
}
 });
});
 });
*/








};





/**
 * 🛠 Function to Convert HTML to Markdown (if needed)
 */
function htmlToMarkdown(html) {
    let turndownService = new TurndownService();
    return turndownService.turndown(html);
}



function stripHtml(html) {
let doc = new DOMParser().parseFromString(html, 'text/html');
let text = doc.body.textContent || "";

// Replace multiple spaces with a single space
text = text.replace(/[ \t]+/g, ' ');

// Replace multiple newlines with a single newline
text = text.replace(/\n\s*\n+/g, '\n');

// Trim leading and trailing spaces/newlines
return text.trim();
}

// Function to clean the reply/quoted text
function removeQuotedText(body) {
return body
.split(/(?:On\s.*?wrote:|From:|To:|Subject:)/i)[0] // Removes quoted sections
.split(/\n>/)[0]  // Removes any email client "quoted" text
.trim();  // Clean up extra spaces
}



/*
* Submit button inside list
*/
document.getElementById("but_insideList").onclick = async () => {
    let selected_val = document.querySelector('#listOf_task').value;
    let url = 'task/' + selected_val + '/comment';

    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select at least one email!', 'warning');
        return;
    }
    if (selected_val === '') {
        swal('Error!', 'Please select a task from the drop-down', 'warning');
       // alert('Please select a task from the drop-down');
        return;
    }

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }

         
 let cleanedEmailBody = removeQuotedText(emailBodyText);

if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            cleanedEmailBody = stripHtml(cleanedEmailBody);    
}


            let sendData = {
                "comment_text": cleanedEmailBody,
                "notify_all": false
            };

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }
swal('Success!', 'Mail List Successfully Saved!', 'success');
       // alert('Mail List Successfully Saved!');
    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }
};



/*
* Submit button outside List
*/
document.getElementById("but_outsideList").onclick = async () => {
 let selected_val = document.querySelector('#folderless_listOf_task').value ;
 let url = 'task/'+selected_val+'/comment';



    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select at least one email!', 'warning');
        return;
    }
    if (selected_val === '') {
        swal('Error!', 'Please select a task from the drop-down', 'warning');
       // alert('Please select a task from the drop-down');
        return;
    }

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }

         
 let cleanedEmailBody = removeQuotedText(emailBodyText);

if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            cleanedEmailBody = stripHtml(cleanedEmailBody);    
}


            let sendData = {
                "comment_text": cleanedEmailBody,
                "notify_all": false
            };

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }
swal('Success!', 'Mail List Successfully Saved!', 'success');
       // alert('Mail List Successfully Saved!');
    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }


};



/*
* Close buttons
*/
document.querySelector("#but_close1").onclick = async () => {
this.window.close();
};
document.querySelector("#but_close2").onclick = async () => {
this.window.close();
};
document.querySelector("#but_close3").onclick = async () => {
this.window.close();
};


/*
* Search button by Custom Task ID
*/
document.getElementById("but_searchByTskName").onclick = async () => {

/*getClickUpTasks().then(tasks => {

    if (tasks) {
        console.log("ClickUp Tasks:", tasks);
    } else {
        console.log(" Could not fetch tasks.");
    }
})*/








 let custom_id = document.querySelector('#search_task_name').value;
  taskResults =  'task/'+custom_id+'?custom_task_ids=true&team_id='+TEAM_ID;

 if (custom_id == '') {
    let option = document.createElement("P");
  option.innerHTML =  '<span style="color: crimson">Please Enter Task-ID or Custom Task-ID</span>'; 
  document.querySelector('#customIdTaskList_results').innerHTML= option.innerHTML;
  searchedResultsubmit.style.display = 'none';
  return;
}




  getData(taskResults)
    .then(data => {
     document.querySelector("#customIdTaskList_results").innerHTML = "";
 
if(data.id){
let option = document.createElement("DIV");
option.setAttribute("class", "radioItem"); 

 let radioNo = document.createElement("input");  
            radioNo.setAttribute("type", "radio");  
            radioNo.setAttribute("id", "searchTaskId1" );  
            radioNo.setAttribute("name", "searchTaskName" ); 
            radioNo.setAttribute("value", data.id ); 

 let lblNo = document.createElement("label");  
  lblNo.setAttribute("for", "searchTaskId1"  ); 
            lblNo.innerHTML =  data.name;  
            option.appendChild(radioNo);  
            option.appendChild(lblNo); 
      document.querySelector('#customIdTaskList_results').appendChild(option);
      searchedResultsubmit.style.display = 'flex';
 }else{
  let option = document.createElement("P");
  option.innerHTML =  '<span style="color: #31871c">No matching results found. please check the Task ID or Custom Task ID !<span>'; 
  document.querySelector('#customIdTaskList_results').appendChild(option); 
  searchedResultsubmit.style.display = 'none';
 }

      });
      









};




/*TAG SEARCH SECTION*/



/*
* Dependant drop-down: Generation Spaces when page load : Search by Tag
*/
async function searchByTag_onLoadSpaces() {
let spaceListUrl = 'team/'+TEAM_ID+'/space?archived=false';

  getData(spaceListUrl)
    .then(data => {  
     document.querySelector("#searchbytag_space_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select Space -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#searchbytag_space_list').appendChild(option);

if (data.spaces !== undefined) {
    // Sort spaces alphabetically by name
     data.spaces.sort((a, b) => a.name.localeCompare(b.name));


     data.spaces.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#searchbytag_space_list').appendChild(option);
    });

     }
      });
};



/*
* Dependant drop-down: Generation tags : Tag Search
*/
document.getElementById("searchbytag_space_list").addEventListener("change", function() {
//call function here
let space_id = document.querySelector('#searchbytag_space_list').value;
let get_tag_lists = 'space/'+space_id+'/tag?archived=false';


  getData(get_tag_lists)
    .then(data => {  
     document.querySelector("#searchbytag_gettag_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select List -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#searchbytag_gettag_list').appendChild(option);

if (data.tags !== undefined) {
    // Sort spaces alphabetically by name
      data.tags.sort((a, b) => a.name.localeCompare(b.name));

     data.tags.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
     

  
      option.value = item.name;
      option.appendChild(name);
      document.querySelector('#searchbytag_gettag_list').appendChild(option);
    });

}

      });
});



/*
* Create Task - Folder-less List inside
*/
document.getElementById("but_foderless_list_createTask").onclick = async () => {
 
 let selected_val = document.querySelector('#folderless_listOf_list').value ;
let selectElement = document.querySelector('#folderless_listOf_list');
let selectedText = selectElement.options[selectElement.selectedIndex].text;



    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select a email!', 'warning');
        return;
    }
      

      if (messageList.messages.length > 5) {
        swal('Error!', 'Please select maximum 5 emails at a time!', 'warning');
        return;
    }


    if (selected_val === '') {
        swal('Error!', 'Please select a List from the drop-down', 'warning');
        return;
    }





swal({
  title: "Are you sure?",
  text: `Please Note: this will create a new task(s) inside \nList name: ${selectedText}\n\nTask name will be => mail subject\nTask description will be => mail body text\n\n*You can select maximum 5 emails at a time\n*Mail subject and body text will be saved as plain TEXT format`,
  type: "warning",
  showCancelButton: true,
  confirmButtonClass: "btn-danger",
  confirmButtonText: "OK",
  cancelButtonText: "Cancel",
  closeOnConfirm: false,
  closeOnCancel: false
}).then(function(result) {

if(result === true){
proceedTo_but_foderless_list_createTask();
}
});

};




/*
* proceedTo to create task (but_foderless_list_createTask)
*/
async function proceedTo_but_foderless_list_createTask() {


 let list_id = document.querySelector('#folderless_listOf_list').value;
url =  'list/'+list_id+'/task';

    let messageList = await browser.mailTabs.getSelectedMessages();

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";
            let emailSubject = data.headers.subject[0] || "No Subject";  // Add email subject

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }


////if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            emailBodyText = stripHtml(emailBodyText);    
////}


sendData = {
  "name":emailSubject,
  "content":emailBodyText
};
//console.log(sendData);

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }
swal('Success!', 'New Task Successfully Created!', 'success')
.then(() => {
    //window.location.reload(); // Example: Reload the page
   window.close(); // close window
});

    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }

}




/*
* Create Task - List inside folders
*/
document.getElementById("but_foder_list_createTask").onclick = async () => {
 

 let selected_val = document.querySelector('#listOf_list').value ;
let selectElement = document.querySelector('#listOf_list');
let selectedText = selectElement.options[selectElement.selectedIndex].text;



    let messageList = await browser.mailTabs.getSelectedMessages();
    if (messageList.messages.length === 0) {
        swal('Error!', 'Please select a email!', 'warning');
        return;
    }
      

      if (messageList.messages.length > 5) {
        swal('Error!', 'Please select maximum 5 emails at a time!', 'warning');
        return;
    }


    if (selected_val === '') {
        swal('Error!', 'Please select a List from the drop-down', 'warning');
        return;
    }








swal({
  title: "Are you sure?",
  text: `Please Note: this will create a new task(s) inside \nList name: ${selectedText}\n\nTask name will be => mail subject\nTask description will be => mail body text\n\n*You can select maximum 5 emails at a time\n*Mail subject and body text will be saved as plain TEXT format`,
  type: "warning",
  showCancelButton: true,
  confirmButtonClass: "btn-danger",
  confirmButtonText: "OK",
  cancelButtonText: "Cancel",
  closeOnConfirm: false,
  closeOnCancel: false
}).then(function(result) {

if(result === true){
proceedTo_but_foder_list_createTask();
}
});

};



/*
* proceedTo to create task (but_foder_list_createTask)
*/
async function proceedTo_but_foder_list_createTask() {
    let list_id = document.querySelector('#listOf_list').value;
   // let folder_id = document.querySelector('#foder_list').value;
    let url = 'list/' + list_id + '/task';



    let messageList = await browser.mailTabs.getSelectedMessages();

    try {
        for (const item of messageList.messages) {  
            let data = await getMsgFull(item.id);

            // Safe Handling for Different Email Structures
            let emailBodyText = "";
            let emailSubject = data.headers.subject[0] || "No Subject";  // Add email subject

            if (data.parts && data.parts.length > 0) {
                if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
                    // Multi-part email: Extract body from the first inner part
                    emailBodyText = data.parts[0].parts[0].body || "";
                } else {
                    // Single-part email: Use the direct body
                    emailBodyText = data.parts[0].body || "";
                }
            } else {
                // Plain text fallback
                emailBodyText = data.body || "";
            }


////if(SAVE_TYPE === "TEXT"){
            // Ensure the text is clean (remove HTML tags + extra whitespace)
            emailBodyText = stripHtml(emailBodyText);    
////}



sendData = {
  "name":emailSubject,
  "content":emailBodyText
};




//console.log(sendData);

            let response = await postData(url, sendData);

            if (!response) {
                window.close(); // Close the window if there's no response
            }
        }
swal('Success!', 'New Task Successfully Created!', 'success')
.then(() => {
    //window.location.reload(); // Example: Reload the page
   window.close(); // close window
});

    } catch (error) {
        console.error("Error processing email:", error);
        swal('Error..!', 'An error occurred while saving emails.', 'error');
    }






    // let messageList = await browser.mailTabs.getSelectedMessages();
    // if (messageList.messages.length === 0) {
    //     swal('Error..!', 'Please select at least one email!', 'error');
    //     return;
    // }
    // if (list_id === '') {
    //     swal('Error..!', 'Please select a list from the drop-down!', 'error');
    //     return;
    // }

    // try {
    //     for (const item of messageList.messages) {
    //         let data = await getMsgFull(item.id);

    //         // 🛠 Handle Different Email Structures
    //         let emailBodyText = "";
    //         if (data.parts && data.parts.length > 0) {
    //             if (data.parts[0].parts && Array.isArray(data.parts[0].parts) && data.parts[0].parts.length > 0) {
    //                 // Multi-part email: Extract body from first inner part
    //                 emailBodyText = data.parts[0].parts[0].body || "";
    //             } else {
    //                 // Single-part email: Use the direct body
    //                 emailBodyText = data.parts[0].body || "";
    //             }
    //         } else {
    //             // Plain text fallback
    //             emailBodyText = data.body || "";
    //         }

    //         let subjectTxt = data.headers.subject ? data.headers.subject[0] : "No Subject";

    //         let sendData = {
    //             "name": subjectTxt,
    //             "content": stripHtml(emailBodyText) // Clean the text before sending
    //         };

    //         console.log("Creating Task with Data:", sendData);

    //         let response = await postData(create_task, sendData);

    //         if (!response) {
    //             window.close();
    //         } else {
    //             alert('New task successfully created!');
    //         }
    //     }
    // } catch (error) {
    //     console.error("Error processing email:", error);
    //     swal('Error..!', 'An error occurred while creating tasks.', 'error');
    // }




}







/*
* Search button by Tag
*/
document.getElementById("but_searchByTagName").onclick = async () => {
//let TEAM_ID = sessionStorage.getItem('TEAM_ID');
 let custom_id = document.querySelector('#searchbytag_gettag_list').value;
//  taskResults =  'task/'+custom_id+'?custom_task_ids=true&team_id='+TEAM_ID;
taskResults =  'team/'+TEAM_ID+'/task?tags[0]='+custom_id;




 if (custom_id == '') {
    let option = document.createElement("P");
  option.innerHTML =  '<span style="color: crimson">Please select a Tag first!</span>'; 
  document.querySelector('#customIdTagList_results').innerHTML= option.innerHTML;
  searchedResultsubmit.style.display = 'none';
  return;
}

  getData(taskResults)
    .then(data => {
     document.querySelector("#customIdTagList_results").innerHTML = "";
 

if(data.tasks.length > 0){

if (data.tasks !== undefined) {
   // Sort spaces alphabetically by name
      data.tasks.sort((a, b) => a.name.localeCompare(b.name));


    data.tasks.forEach(function(item, index) { 

let option = document.createElement("DIV");
option.setAttribute("class", "radioItem"); 

 let radioNo = document.createElement("input");  
            radioNo.setAttribute("type", "radio");  
            radioNo.setAttribute("id", "searchTagId"+item.id  );  
            radioNo.setAttribute("name", "searchTagName" ); 
            radioNo.setAttribute("value", item.id ); 

 let lblNo = document.createElement("label");  
  lblNo.setAttribute("for", "searchTagId"+item.id  ); 
            lblNo.innerHTML =  item.name;  
            option.appendChild(radioNo);  
            option.appendChild(lblNo); 
      document.querySelector('#customIdTagList_results').appendChild(option);
      searchedResultsubmit.style.display = 'flex';


});
    }

 }else{
  let option = document.createElement("P");
  option.innerHTML =  '<span style="color: #31871c">No matching results found!<span>'; 
  document.querySelector('#customIdTagList_results').appendChild(option); 
  searchedResultsubmit.style.display = 'none';
 }

      });



}

/* TAG - END*/






/*
* Dependant drop-down: Generation Spaces when page load : folderless
*/
async function folderless_onLoadSpaces() {
//let TEAM_ID = sessionStorage.getItem('TEAM_ID');
let spaceListUrl = 'team/'+TEAM_ID+'/space?archived=false';

  getData(spaceListUrl)
    .then(data => {  
     document.querySelector("#folderless_space_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select Space -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#folderless_space_list').appendChild(option);

if (data.spaces !== undefined) {
    // Sort spaces alphabetically by name
    data.spaces.sort((a, b) => a.name.localeCompare(b.name));

     data.spaces.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#folderless_space_list').appendChild(option);
    });
     }
      });
};

/*
* Dependant drop-down: Generation Lists : folderless
*/
document.getElementById("folderless_space_list").addEventListener("change", function() {
//call function here
let space_id = document.querySelector('#folderless_space_list').value;
let get_folderless_lists = 'space/'+space_id+'/list?archived=false';

  getData(get_folderless_lists)
    .then(data => {  
     document.querySelector("#folderless_listOf_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select List -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#folderless_listOf_list').appendChild(option);

if (data.lists !== undefined) {
 // Sort spaces alphabetically by name
      data.lists.sort((a, b) => a.name.localeCompare(b.name));


     data.lists.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#folderless_listOf_list').appendChild(option);
    });
     }
      });
});


/*
* Dependant drop-down: Generation Tasks : folderless
*/
document.getElementById("folderless_listOf_list").addEventListener("change", function() {
//call function here
let list_id = document.querySelector('#folderless_listOf_list').value;
let get_folderless_list = 'list/'+list_id+'/task?archived=false';

  getData(get_folderless_list)
    .then(data => {  
     document.querySelector("#folderless_listOf_task").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select List -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#folderless_listOf_task').appendChild(option);

if (data.tasks !== undefined) {
// Sort spaces alphabetically by name
      data.tasks.sort((a, b) => a.name.localeCompare(b.name));


     data.tasks.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#folderless_listOf_task').appendChild(option);
    });

     }
      });
});




/*
* Radio buttons options
*/

//RR
var hnav_as = document.querySelectorAll('#hnav-menu .cuSearchOption');

    

hnav_as.forEach(function(hnav_a) {
    hnav_a.addEventListener('click', function() {

    // Remove 'current' class from all spans
        hnav_as.forEach(s => s.classList.remove('current'));
 // Add 'current' class to the clicked span
        this.classList.add('current');

        var dataValue = hnav_a.getAttribute('data-value');
        spanClickHandler(dataValue);
    });
});

function spanClickHandler(value) {
    //console.log("Selected data-value:", value);

this.value = value;
radioChangeHandler(this);

    // You can use the value here as needed
}
// RR end






var radios = document.querySelectorAll('input[type=radio][name="cuSearchOption"]');
Array.prototype.forEach.call(radios, function(radio) {
   radio.addEventListener('change', radioChangeHandler);

});









function radioChangeHandler(event) {
   if ( this.value === '1' ) {
 listinsidefolders.style.display = 'block';
  listoutsidefolders.style.display = 'none';
  listsearchbyTask.style.display = 'none';
  but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.add('disabled');
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = true;

listoutsideTagSearch.style.display = 'none';



document.querySelector("#listOf_task").selectedIndex = 0;
document.querySelector("#folderless_listOf_task").selectedIndex = 0;

   } else if ( this.value === '2' ) {
 listoutsidefolders.style.display = 'block';
 listinsidefolders.style.display = 'none';
  listsearchbyTask.style.display = 'none';
  but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.add('disabled');
document.querySelector("#listOf_task").selectedIndex = 0;
document.querySelector("#folderless_listOf_task").selectedIndex = 0;
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = true;
listoutsideTagSearch.style.display = 'none';
   
   }  else if( this.value === '3' ) {
  listsearchbyTask.style.display = 'block';
  listinsidefolders.style.display = 'none';
  listoutsidefolders.style.display = 'none';
  but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.remove('disabled');
document.querySelector("#listOf_task").selectedIndex = 0;
document.querySelector("#folderless_listOf_task").selectedIndex = 0;
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = false;
listoutsideTagSearch.style.display = 'none';  



   }  else if( this.value === '4' ) {
    listoutsideTagSearch.style.display = 'block';
  listsearchbyTask.style.display = 'none';
  listinsidefolders.style.display = 'none';
  listoutsidefolders.style.display = 'none';
  but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.remove('disabled');
document.querySelector("#listOf_task").selectedIndex = 0;
document.querySelector("#folderless_listOf_task").selectedIndex = 0;
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = false;







   }else{
    //default
     listinsidefolders.style.display = 'block';
  listoutsidefolders.style.display = 'none';
  listsearchbyTask.style.display = 'none';
  but_insideList.classList.add('disabled');
but_outsideList.classList.add('disabled');
but_seachTaskSubmit.classList.add('disabled');
document.querySelector("#listOf_task").selectedIndex = 0;
document.querySelector("#folderless_listOf_task").selectedIndex = 0;
but_insideList.disabled = true;
but_outsideList.disabled = true;
but_seachTaskSubmit.disabled = true;

   }
}



/*
* If change Enable the sync button
*/
document.getElementById("listOf_task").addEventListener("change", function() {
but_insideList.classList.toggle('disabled');
but_insideList.disabled = false;
});
document.getElementById("folderless_listOf_task").addEventListener("change", function() {
but_outsideList.classList.toggle('disabled');
but_outsideList.disabled = false;
});


/*
* Dependant drop-down: Generation Tasks : inside folders
*/
document.getElementById("listOf_list").addEventListener("change", function() {
//call function here
let list_id = document.querySelector('#listOf_list').value;
let get_listOf_folders = 'list/'+list_id+'/task?archived=false';

  getData(get_listOf_folders)
    .then(data => {  
     document.querySelector("#listOf_task").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select List -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#listOf_task').appendChild(option);

if (data.tasks !== undefined) {
// Sort spaces alphabetically by name
      data.tasks.sort((a, b) => a.name.localeCompare(b.name));


     data.tasks.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#listOf_task').appendChild(option);
    });
}

      });
});



/*
* Dependant drop-down: Generation Lists : inside folders
*/
document.getElementById("foder_list").addEventListener("change", function() {
//call function here
let folder_id = document.querySelector('#foder_list').value;
let get_listOf_folders = 'folder/'+folder_id+'/list?archived=false';

  getData(get_listOf_folders)
    .then(data => {  
     document.querySelector("#listOf_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select List -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#listOf_list').appendChild(option);

if (data.lists !== undefined) {
// Sort spaces alphabetically by name
      data.lists.sort((a, b) => a.name.localeCompare(b.name));


     data.lists.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#listOf_list').appendChild(option);
    });

}

      });
});




/*
* Dependant drop-down: Generation Folders : inside folders
*/
document.getElementById("space_list").addEventListener("change", function() {
//call function here
let space_id = document.querySelector('#space_list').value;
let get_listOf_folders = 'space/'+space_id+'/folder?archived=false';

  getData(get_listOf_folders)
    .then(data => {  
     document.querySelector("#foder_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select Folder -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#foder_list').appendChild(option);

if (data.folders !== undefined) {
// Sort spaces alphabetically by name
      data.folders.sort((a, b) => a.name.localeCompare(b.name));


      
     data.folders.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#foder_list').appendChild(option);
    });

}

      });
});



/*
* Dependent drop-down: Generation Spaces when page load : inside folders
*/
async function onLoadSpaces() {
 // let TEAM_ID = sessionStorage.getItem('TEAM_ID');
let spaceListUrl = 'team/'+TEAM_ID+'/space?archived=false';

  getData(spaceListUrl)
    .then(data => {  
     document.querySelector("#space_list").innerHTML = "";
      let option = document.createElement("OPTION");
      let name = document.createTextNode('- Select Space -');
      option.value = ''
      option.appendChild(name);
      document.querySelector('#space_list').appendChild(option);

if (data.spaces !== undefined) {
    // Sort spaces alphabetically by name
    data.spaces.sort((a, b) => a.name.localeCompare(b.name));


     data.spaces.forEach(function(item, index) {     
      let option = document.createElement("OPTION");
      let name = document.createTextNode(item.name);
      option.value = item.id;
      option.appendChild(name);
      document.querySelector('#space_list').appendChild(option);
    });

}

      });


};




  //  GET method implementation:
  async function getData(url_endpoint = '') {
  let urlSet = new URL(url_endpoint, URL_SET);
  let loader = document.querySelector('#loader');
  loader.style.display = 'block'

  try{
 let storedData = await browser.storage.local.get(["clickupToken", "refreshToken"]);
 let token = storedData.clickupToken;
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);
  loader.style.display = 'block';
  // Default options are marked with *
  let response = await fetch(urlSet, {
  method: 'GET', // *GET, POST, PUT, DELETE, etc.
  headers: myHeaders,
  redirect: 'follow', // manual, *follow, error
  });
  loader.style.display = 'none';
  return await response.json(); // parses JSON response into native JavaScript objects
  }catch(err){
  console.error('Error:', err);
  // Handle errors here
  }
  }







  //  POST method implementation:
  async function postData(url_endpoint = '', data = {}) {
  let storedData = await browser.storage.local.get(["clickupToken", "refreshToken"]);
  let token = storedData.clickupToken;
  let urlSet = new URL(url_endpoint, URL_SET);
  let loader = document.querySelector('#loader');
  loader.style.display = 'block'
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", token);
  try{
  let response = await fetch(urlSet, {
  method: 'POST', // *GET, POST, PUT, DELETE, etc.
  headers: myHeaders,
  redirect: 'follow', // manual, *follow, error
  body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  loader.style.display = 'none';
  return await response.json(); // parses JSON response into native JavaScript objects
  }catch(err){
  console.error('Error:', err);
  // Handle errors here
  }
  }





function showErrorMessage(message, link) {
    let div = document.createElement("div");
    div.innerHTML = `
    <div style="width: 400px;padding: 10px; background: #f8d7da; border: 1px solid #721c24; color: #721c24; border-radius: 5px;">
    <strong>Error:</strong> ${message} <br> <br>
    <p>Please go to the plugin settings and validate the credentials</p> <br>
    <p>Tools > Add-ons and Themes > Extensions > ClickUp Mail Sync > Options</p><br>
    <a style="display: contents;" href="${link}" target="_blank" style="color: blue; text-decoration: underline;">Please click here to see more details</a>
    </div>
<style>
.panel-section-header {
      width: 400px;
}
      </style>
    `;
    document.body.appendChild(div);
}


async function getUserDetails() {

//const url = "https://api.clickup.com/api/v2/user";

let get_user_details = 'user';
let ret_status = false;

  let res = getData(get_user_details)
    .then(data => {  

if(data.err){
  //alert('! Error: '+ data.err + '\nPlease go to the plugin settings and validate the credentials');
showErrorMessage(data.err, USER_GUIDE_URL);
ret_status =  false;
}else{


  let userNameSpan = document.getElementById("text-section-user-name");
    // Set new text content
    userNameSpan.textContent = data.user.username;
if (data !== undefined) {
if (data.user.username) { 
      document.getElementById("wrapper-body").style.display = ""; 


   ret_status =  data;   
}
}
}


return ret_status;
});

   return res; 
}




async function setTeamID() {
  let res =   browser.storage.local.get(["clientId", "clientSecret", "redirectUrl", "clickupToken", "teamId", "teamName"]).then(data => {
     if (data.teamId) TEAM_ID = data.teamId;
 
 return  data.teamId;
    }).catch(error => console.error("Error loading storage values:", error));
  return res;
}
