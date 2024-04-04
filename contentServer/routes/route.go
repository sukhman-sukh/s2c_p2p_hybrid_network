package routes

import (
	"contentServer/controllers"

	"github.com/gofiber/fiber/v2"
)

func ContentRouter(app *fiber.App) {
	//TODO complete routes and make controllers
	app.Post("/upload",controllers.UploadFile)
	app.Get("/download/:id",controllers.DownloadFile)//download/fileid/:id
	//download/fileid --> will download the entire file
	//getAllfiles --> will return all the files in the database
	app.Get("/getAllfiles",controllers.GetAllFiles)
}
