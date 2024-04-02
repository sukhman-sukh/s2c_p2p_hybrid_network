package configs

import (
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
)

func CreateBucket (client *mongo.Client,bucketName string) *gridfs.Bucket {
	db := client.Database("db")
	bucket,err := gridfs.NewBucket(db)
	if err != nil {
		panic(err)
	}
	return bucket
}