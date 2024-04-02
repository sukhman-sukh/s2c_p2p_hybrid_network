package routes

import (
	"contentServer/controllers"

	"github.com/gofiber/fiber/v2"
)

func ContentRouter(app *fiber.App) {
	app.Post("/upload",controllers.UploadFile)
	app.Get("/download/:id",controllers.DownloadFile)
}
