package main

import (
	"log"
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
}
