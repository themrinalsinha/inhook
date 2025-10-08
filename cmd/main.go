package main

import (
	"log"
	"os"

	"github.com/knadh/stuffbin"
)

// //go:embed assets/* index.html
// var content embed.FS

var (
	buildVersion  string
	buildHash     string
	buildDate     string
	buildHashFull string
)

func main() {
	log.Println("Version:", buildVersion)
	log.Println("Hash:", buildHash)
	log.Println("Date:", buildDate)
	log.Println("Hash Full:", buildHashFull)

	path, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Executable path:", path)
	fs, _ := stuffbin.UnStuff(path)
	log.Println("Files:", fs.List())
}
