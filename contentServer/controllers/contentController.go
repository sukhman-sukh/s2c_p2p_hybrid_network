package controllers

import (
	"contentServer/configs"
	"contentServer/responses"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func UploadFile(c *fiber.Ctx) error {
	pathfile := c.FormValue("filepath")

	bucket := configs.CreateBucket(configs.DB, "fs")
	file, err := os.Open(pathfile)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		log.Fatal(err)
	}

	fileSize := fileInfo.Size()
	numChunks := 10
	chunkSize := fileSize / int64(numChunks)

	uploadOPts := options.GridFSUpload().SetChunkSizeBytes(int32(chunkSize))


	objectID, err := bucket.UploadFromStream(fileInfo.Name(), io.Reader(file), uploadOPts)
	if err != nil {
		panic(err)
	}
	fmt.Println(objectID)
	return c.Status(http.StatusOK).JSON(responses.Response{Status: http.StatusOK, Message: "success", Data: &fiber.Map{"objectID": objectID.Hex()}})

}

func DownloadFile(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	bucket := configs.Bucket
	file, err := bucket.OpenDownloadStream(objectID)
	if err != nil {
		fmt.Println("Error opening download stream:", err)
		return err
	}
	defer file.Close()

	c.Response().Header.Set("Content-Disposition", "attachment; filename="+id)
	c.Response().Header.Set("Content-Type", "application/octet-stream")

	if _, err := io.Copy(c, file); err != nil {
		fmt.Println("Error sending file:", err)
		return err
	}

	return nil
}
