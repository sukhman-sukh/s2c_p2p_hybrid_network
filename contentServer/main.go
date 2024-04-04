package main

import (
	"contentServer/configs"
	"contentServer/routes"
	"fmt"
	"net"
	"sync"

	"github.com/gofiber/fiber/v2"
)

type connTracker struct {
    net.Listener
    conns int
    mu    sync.Mutex
}
//TODO check if this counts the mnumber of users connected
func (t *connTracker) Accept() (net.Conn, error) {
    conn, err := t.Listener.Accept()
    if err != nil {
        return nil, err
    }
    t.mu.Lock()
    t.conns++
    t.mu.Unlock()
    return conn, nil
}

func main() {
    app := fiber.New()

    configs.ConnectDB()

    routes.ContentRouter(app)

    ln, _ := net.Listen("tcp", ":4000")
    tln := &connTracker{Listener: ln}

    go func() {
        for {
            conn, err := tln.Accept()
            if err != nil {
                // handle error
            }
            go func(c net.Conn) {
                fmt.Println(tln.conns)
                // handle connection
                tln.mu.Lock()
                if tln.conns > 20 {
                    // connections more than 20
                }
                tln.mu.Unlock()
                c.Close()
            }(conn)
        }
    }()

    app.Listener(tln)
}