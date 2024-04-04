package controllers

import (
	"contentServer/configs"
	"contentServer/responses"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type gridFSFile struct {
	ID         primitive.ObjectID `bson:"_id"`
	FileName   string             `bson:"filename"`
	Length     int64              `bson:"length"`
	ChunkSize  int32              `bson:"chunkSize"`
	UploadDate primitive.DateTime `bson:"uploadDate"`
}

type gridFSChunk struct {
	ID       primitive.ObjectID `bson:"_id"`
	FilesID  primitive.ObjectID `bson:"files_id"`
	N        int32              `bson:"n"`
	Data     []byte             `bson:"data"`
}

func UploadFile(c *fiber.Ctx) error {
	pathfile := c.FormValue("filepath")

	bucket := configs.CreateBucket(configs.DB, "fs")
	file, err := os.Open(pathfile)
	if err != nil {
		log.Fatal(err)
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

func GetAllChunks(c *fiber.Ctx) error {
	id := c.Params("fileId")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	bucket := configs.Bucket
	cursor, err := bucket.GetChunksCollection().Find(context.Background(), bson.D{{"files_id", objectID}})
	if err != nil {
		fmt.Println("Error finding files:", err)
		return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
	}
	defer cursor.Close(context.Background())

	var foundChunks []gridFSChunk
	if err := cursor.All(context.Background(), &foundChunks); err != nil {
		fmt.Println("Error retrieving files:", err)
		return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
	}
	return c.Status(http.StatusOK).JSON(responses.Response{Status: http.StatusOK, Message: "Success", Data: &fiber.Map{"files": foundChunks}})
}

func GetAllFiles(c *fiber.Ctx) error {
	fmt.Println("Get all files")
	bucket := configs.Bucket
	cursor, err := bucket.Find(bson.D{{}})
	if err != nil {
		fmt.Println("Error finding files:", err)
		return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
	}
	defer cursor.Close(context.Background())

	var foundFiles []gridFSFile
	if err := cursor.All(context.Background(), &foundFiles); err != nil {
		fmt.Println("Error retrieving files:", err)
		return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
	}

	for _, file := range foundFiles {
		fmt.Println(file.FileName)
	}

	return c.Status(http.StatusOK).JSON(responses.Response{Status: http.StatusOK, Message: "Success", Data: &fiber.Map{"files": foundFiles}})
}

func GetChunk(c *fiber.Ctx) error {
    id := c.Params("fileId")
    n := c.Params("n")
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        return err
    }

    bucket := configs.Bucket
    cursor, err := bucket.GetChunksCollection().Find(context.Background(), bson.D{{"files_id", objectID}, {"n", n}})
    if err != nil {
        fmt.Println("Error finding chunk:", err)
        return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
    }
    defer cursor.Close(context.Background())
	fmt.Println(cursor)
    var foundChunk gridFSChunk
    if err := cursor.Decode(&foundChunk); err != nil {
        if err == mongo.ErrNoDocuments {
            fmt.Println("Chunk not found:", err)
            return c.Status(http.StatusNotFound).JSON(responses.Response{Status: http.StatusNotFound, Message: "Chunk Not Found"})
        }
        fmt.Println("Error decoding chunk:", err)
        return c.Status(http.StatusInternalServerError).JSON(responses.Response{Status: http.StatusInternalServerError, Message: "Internal Server Error"})
    }

    return c.Status(http.StatusOK).JSON(responses.Response{Status: http.StatusOK, Message: "Success", Data: &fiber.Map{"chunk": foundChunk}})
}

