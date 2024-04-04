package routes

import (
	"contentServer/controllers"

	"github.com/gofiber/fiber/v2"
)

func ContentRouter(app *fiber.App) {
	app.Post("/upload",controllers.UploadFile)
	app.Get("/download/:fileId/:n",controllers.GetChunk)
	app.Get("/download/:fileId",controllers.GetAllChunks)
	app.Get("/getAllfiles",controllers.GetAllFiles)
}
