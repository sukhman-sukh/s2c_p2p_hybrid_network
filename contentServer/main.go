package main

import (
	"contentServer/configs"
	"contentServer/responses"
	"contentServer/routes"
	"fmt"
	"net/http"
	"sync"

	"github.com/gofiber/fiber/v2"
)

// type connTracker struct {
//     net.Listener
//     conns int
//     mu    sync.Mutex
// }

type Counter struct {
	count int
	mu    sync.Mutex
}

// func Accept() (net.Conn, error) {
// 	conn, err := t.Listener.Accept()
// 	if err != nil {
// 		return nil, err
// 	}
// 	t.mu.Lock()
// 	t.conns++
// 	t.mu.Unlock()
// 	return conn, nil
// }

func main() {
	config := fiber.Config{
		ServerHeader: "Content Server",
		// Prefork:      true,
		// Concurrency:  1024 * 512,
	}
	app := fiber.New(config)

	counter := &Counter{}

	configs.ConnectDB()

	app.Use(func(c *fiber.Ctx) error {
		// fmt.Println("reached counter = ", counter.GetCount())
		counter.Increment()
		// defer counter.Decrement() // Decrement connection count after request handling
		// return c.Next()
		// })

		// app.Use(func(c *fiber.Ctx) error {
		// counter.Increment()
		// defer counter.Decrement() // Decrement connection count after request handling
		conn := counter.GetCount()
		if conn >= 20 {
			fmt.Println("More = ", counter.GetCount())
			var x = c.Status(http.StatusGatewayTimeout).JSON(responses.Response{Status: http.StatusGatewayTimeout, Message: "Success", Data: &fiber.Map{"files": "Limit Exceeded"}})
			counter.Decrement()
			return x
		} else {
			fmt.Println("Less", counter.GetCount())
			var z = c.Next()
			counter.Decrement()
			return z
		}
	})

	routes.ContentRouter(app)
	// ln, _ := net.Listen("tcp", ":4000")
	// tln := &connTracker{Listener: ln}

	// go func() {
	//     for {
	//         conn, err := ln.Accept()
	//         if err != nil {
	//             fmt.Printf("Failed to accept connection: %v", err)
	//             continue
	//         }

	//         go func(c net.Conn) {
	//             // handle connection
	//             tln.mu.Lock()
	//             if tln.conns > 20 {
	//                 fmt.Println("Connection limit reached")
	//             } else {
	//                 fmt.Println("Connection established")
	//             }

	//             tln.mu.Unlock()
	//             c.Close()
	//         }(conn)
	//     }
	// }()

	// app.Listener(tln)
	app.Listen(":4000")

}

func (c *Counter) Increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count++
}

// Decrement decrements the connection count
func (c *Counter) Decrement() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count--
}

func (c *Counter) GetCount() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.count
}
