package controllers

import (
	"contentServer/configs"
	"contentServer/responses"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func UploadFile(c *fiber.Ctx) error {
	pathfile := c.FormValue("filepath")

	bucket := configs.CreateBucket(configs.DB, "fs")
	file, err := os.Open(pathfile)

	if err != nil {
		panic(err)
	}

	uploadOPts := options.GridFSUpload().SetMetadata((bson.D{{"metadata tag", "first"}}))

	objectID, err := bucket.UploadFromStream("file", io.Reader(file), uploadOPts)
	if err != nil {
		panic(err)
	}
	fmt.Println(objectID)
	return c.Status(http.StatusOK).JSON(responses.Response{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"objectID": objectID.Hex()}})

}

func DownloadFile(c *fiber.Ctx) error {
	objectID := c.Params("id")
	bucket := configs.CreateBucket(configs.DB, "fs")
	file, err := bucket.OpenDownloadStream(objectID)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	c.Response().Header.Set("Content-Disposition", "attachment; filename="+objectID)
	c.Response().Header.Set("Content-Type", "application/octet-stream")
	c.SendStream(file)
	return nil
}
