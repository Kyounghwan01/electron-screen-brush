const { app, BrowserWindow } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const url = require("url");

require("@electron/remote/main").initialize();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false, // 상단 바
    // transparent: true, // 요소 빼고 배경 투명하게
    // kiosk: true, // 터치가능하게
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      // TypeError: window.require is not a function 일때 추가
      contextIsolation: false
    }
  });

  isDev
    ? win.loadURL("http://localhost:3000?main")
    : win.loadURL(
        url.format({
          pathname: path.join(__dirname, "../build/index.html"),
          protocol: "file:",
          slashes: true
        }) + "?main"
      );

  // win.loadURL(
  //   isDev
  //     ? "http://localhost:3000?main"
  //     : `file://${path.join(__dirname, "../build/index.html")}`
  // );

  // if (isDev) {
  //   win.webContents.openDevTools();
  //   const {
  //     default: installExtension,
  //     REACT_DEVELOPER_TOOLS,
  //     REDUX_DEVTOOLS
  //   } = require("electron-devtools-installer"); // eslint-disable-line
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //     .then(name => console.log(`Added Extension:  ${name}`))
  //     .catch(err => console.log("An error occurred: ", err));

  //   installExtension(REDUX_DEVTOOLS)
  //     .then(name => console.log(`Added Extension:  ${name}`))
  //     .catch(err => console.log("An error occurred: ", err));
  // }
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
