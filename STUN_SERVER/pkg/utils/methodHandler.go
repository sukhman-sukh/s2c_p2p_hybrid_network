package Utils

import (
	// // "http"
	"encoding/json"
	"fmt"
	"strconv"
	"stun_server/pkg/types"

	"github.com/gofiber/contrib/websocket"
)

func MethodHandler(commandType types.CommandType) {
	fmt.Println("recieved %s", commandType.Command)

	switch commandType.Command {
	case "file":
		CheckFileInConnections(commandType)
		break
	case "fileAvailable":
		findSdp(commandType)
		break
	}
}

func CheckFileInConnections(commandType types.CommandType) {

	fmt.Println(types.Connections[commandType.Cid].Conn)
	types.Connections[commandType.Cid].Sdp = commandType.Sdp

	var commandSend types.CommandSend
	commandSend.Command = "checkFile"
	commandSend.Cid = commandType.Cid
	commandSend.Argument = commandType.Argument
	commandSendJson, err := json.Marshal(commandSend)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	for _, c := range types.Connections {
		err := c.Conn.WriteMessage(websocket.TextMessage, commandSendJson)
		if err != nil {
			fmt.Println(err)
		}
	}
}

func findSdp(commandType types.CommandType) {
	cid_requester, _ := strconv.Atoi(commandType.Argument)
	cid_sender := commandType.Cid
	var c = types.Connections[cid_requester].Conn
	var c_seeder = types.Connections[cid_sender].Conn

	// Send SDP seeder's sdp to leecher
	var commandSend types.CommandSend
	commandSend.Command = "Sdp_seeder"
	commandSend.Cid = cid_sender
	commandSend.Argument = types.Connections[cid_sender].Sdp 					//strconv.Itoa(cid_sender)
	commandSendJson, err := json.Marshal(commandSend)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	err = c.Conn.WriteMessage(websocket.TextMessage, commandSendJson)
		if err != nil {
			fmt.Println(err)
		}



		
	
	// Send SDP leecher's sdp to seeder
	var commandSend_seeder types.CommandSend
	commandSend_seeder.Command = "Sdp_leecher"
	commandSend_seeder.Cid = cid_requester
	commandSend.Argument = types.Connections[cid_requester].Sdp 		
	commandSendJson, err = json.Marshal(commandSend_seeder)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	err = c_seeder.Conn.WriteMessage(websocket.TextMessage, commandSendJson)
		if err != nil {
			fmt.Println(err)
		}
	
		// remoteAddr := c.Locals("remoteAddr").(string)
	// ip, port, _ := net.SplitHostPort(remoteAddr)
	// println("Client IP:", ip)
	// println("Client Port:", port)

}
