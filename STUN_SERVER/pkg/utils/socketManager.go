package Utils

import (
	"stun_server/pkg/types"

	"github.com/gofiber/contrib/websocket"

	// "github.com/gofiber/fiber/v2"
	// "http"
	// "/stun_server/pkg/types"
	"encoding/json"
	"fmt"
)

var Connect = func(c *websocket.Conn) {
	var WebSocConn types.WebSocConn
	WebSocConn.Conn = c
	WebSocConn.Sdp = ""
	WebSocConn.Id = len(types.Connections)

	types.Connections = append(types.Connections, WebSocConn)

	// remoteAddr := c.Locals("remoteAddr").(string)
	// ip, port, _ := net.SplitHostPort(remoteAddr)
	// println("Client IP:", ip)
	// println("Client Port:", port)

	fmt.Println(c.Locals("allowed"))
	// fmt.Println(c.Params("id"))
	// fmt.Println(c.Query("v"))
	// fmt.Println(c.Cookies("session"))

	var (
		messageType int
		msg         []byte
		err         error
	)

	for {
		fmt.Println("connection established")
		if messageType, msg, err = c.ReadMessage(); err != nil {
			fmt.Println("read error :", err)
			break
		}
		fmt.Printf("receive: %s", msg)
		var commandType types.CommandType
		err := json.Unmarshal(msg, &commandType)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		commandType.Cid = WebSocConn.Id
		response := string(msg)
		MethodHandler(commandType)

		if err = c.WriteMessage(messageType, []byte(fmt.Sprintf("Server: %s", response))); err != nil {
			fmt.Println("Write error: ", err)
			break
		}
	}

}
