import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["get_data"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["get_data"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);
const electronHandler = {
    ipcRenderer: {
      sendMessage(channel, args) {
        ipcRenderer.send(channel, args);
      },
      on(channel, args) {
        const subscription = (_event, ...args) =>
          func(...args);
        ipcRenderer.on(channel, subscription);
  
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      },
      once(channel, args) {
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      },
    },
  };
  
  contextBridge.exposeInMainWorld('electron', electronHandler);