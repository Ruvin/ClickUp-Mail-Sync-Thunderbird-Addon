# Welcome to the ClickUp-Mail-Sync-Thunderbird-Addon wiki!

## ClickUp Mail Sync Thunderbird add-on

### What's in this repository 

The plugin Conscious ClickUp Thunderbird Mail Sync allows you to sync your Thunderbird emails with ClickUp.

The add-on will work with Thunderbird versions v128 and higher.

### Installing

#### Step 1 - Download the Add-on
Download the most recent version of the.XPI add-on from [release section](https://github.com/Ruvin/ClickUp-Mail-Sync-Thunderbird-Addon/releases). 
To manually install it, get into Thunderbird and select Tool > Add-ons > Extensions > Install Add-on from file.


#### Step 2 - Configure ClickUp [[for more info](https://developer.clickup.com/docs/authentication#step-1-create-an-oauth-app)]
```
This plugin needed to be configured with Clickup 0Auth.

Create an OAuth app

[Note:] Only Workspace owners or admins can create OAuth apps.

    1. Log in to ClickUp.
    2. In the upper-right corner, click your avatar.
    3. Select Settings.
```
<img src="https://i.ibb.co/mVJMmbkG/1.png" width="300">

```

    4. In the sidebar, click Apps. (Deeplink: https://app.clickup.com/settings/apps)
    5. Click Create new app. 
    6. Name the app and add a redirect URL. Enter the below details.
        App Name = Clickup Mail Sync App
        Redirect URL = app.clickup.com
```
<img src="https://i.ibb.co/BKtms84V/2.png" width="400">

```
    7. You'll receive a Client ID and Client Secret. make note those.
```
<img src="https://i.ibb.co/S4sYQ6Pw/3.png" width="400">


Later on, you can examine the app settings by going to Clickup API.

<img src="https://i.ibb.co/jv8P4hCP/4.png" width="600">


#### Step 3 - Configure the Add-on

```
 1. In your Thunderbird navigate
        Menu icon > Add-ons and Themes > Extensions > ClickUp Mail Sync > Options 
            OR 
        Tool > Add-ons and Themes > Extensions > ClickUp Mail Sync > Options
```
 <img src="https://i.ibb.co/0pZ1BP4N/5.png" width="300">

```

 
 2. Enter Client ID, Client Secret, Redirect URI
    [Note:] Redirect URI should be a proper URL starting from https://  
            Eg: https://app.clickup.com
```
 <img src="https://i.ibb.co/ZRT7JgwV/6.png" width="500">

```

 3. First you have to click SAVE

 4. Next click 'Authenticate Clickup'. A popup will appear
    i) After choosing your workspace, click Next. Close the popup window manually if it hasn't closed automatically.
```
 <img src="https://i.ibb.co/9kxH1WM7/7.png" width="500">

```

 5. You will see your workspace name in the settings if the plugin has successfully authenticated

```
 <img src="https://i.ibb.co/BH8X0gmf/8.png" width="400">

```

Congratulations! You have successfully set up the Clickup Mail Sync Thunderbird add-on.

```

#### Step 4 - Usage

```
"ClickUp Mail Sync" icon will appear in the upper right corner of your Thunderbird. 
Additionally, the icon is visible in the message window as well.
```
 <img src="https://i.ibb.co/Hf8rZ9LZ/9.png" width="400">


## Authors

* **Ruvin Roshan - Conscious Solutions** - [Conscious Solutions](https://www.conscious.co.uk/)

### Support & Licensing 

This file is part of the Conscious Solutions ClickUp Mail Sync Thunderbird Plugin.

The Conscious Solutions ClickUp Mail Sync Thunderbird Plugin is Freeware:you can redistribute it and use for free.

The Conscious Solutions ClickUp  ClickUp Mail Sync Thunderbird Plugin is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.