# Anrop Arma3Sync

A simple web manager

* Search and install mods from Play withSIX API
* Delete mods no longer desired
* Rebuild your repository automatically after mod installs or manually

## Requirements

* Code is written in [Node.js](https://nodejs.org/) and is required to launch the application.
* The application requires [Java](https://www.java.com/en/) to interact with Arma3Sync.
* You must supply a [Arma3Sync](http://www.sonsofexiled.fr/wiki/index.php/ArmA3Sync_Wiki_English) installation by yourself.
* The application does not create your Arma3Sync repository if it does not already exists, make sure you've set it up first before using this application.
* The application will currently not actually serve your Arma3Sync repository so make sure you have a web service handling that.

## How To Use

Install dependences with `npm install`.

Copy the `.env.example` to `.env` and change values as desired.

Start the application with `npm start`.

Server will be available at the port specified in the config.

## Configuration Values

Values that can be defined in your `config.js`

| Key | Required | Description |
| --- | -------- | ----------- |
| arma3sync | Yes | Path to the Arma3Sync installation folder. This is used to access the `resources` folder with your repositories configurations  |
| arma3syncJarFile | Yes | Path to the Arma3Sync jar file |
| java | Yes | Path to your Java binary, if found in path this could just be `java` |
| host | Yes | Restrict to specific network interface or just leave it as `'0.0.0.0'` |
| path | Yes | Path to the Arma3Sync repository folder containing your mods |
| port | Yes | Port that HTTP Server is bound to |
| repository | Yes | Repository to rebuild on mod changes or manually |
