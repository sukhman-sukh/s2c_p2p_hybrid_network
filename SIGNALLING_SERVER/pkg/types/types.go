package types

import (
	"github.com/gofiber/contrib/websocket"
)
type CommandType struct {
	Command  string `json:"command"`
	Argument string `json:"argument"`
	Sdp string `json:"sdp`
	Cid int `json:"cid"`
}

type WebSocConn struct {
	Conn *websocket.Conn
	Sdp string
	Id int
}
var Connections []WebSocConn

type CommandSend struct {
	Command  string `json:"command"`
	Argument string `json:"argument"`
	Cid int `json:"cid"`
}