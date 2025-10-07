package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed assets/* index.html
var content embed.FS

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

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		data, err := content.ReadFile("index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write(data)
	})

	// Serve assets (js, css, etc.)
	assetsFS, err := fs.Sub(content, "assets")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(assetsFS))))

	log.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
