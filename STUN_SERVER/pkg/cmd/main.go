package main

import (
	// "fmt"
	"fmt"
	Utils "stun_server/pkg/utils"

	// "fmt"
	// "net/http"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	// "github.com/gofiber/fiber/v2/utils"
)

func main() {
	config := fiber.Config{
		ServerHeader: "Cache Server",
		Prefork:      true,
		// Concurrency:  1024 * 512,
	}
	app := fiber.New(config)

	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// app.Get("/", utils.connect())
	app.Get("/ws", websocket.New(Utils.Connect))

	fmt.Println(app.Listen(":8080"))
}
