package main

import (
	"fmt"
	"os"

	"github.com/knadh/stuffbin"
)

func main() {
	fmt.Println("Hello, InHook! :)")

	// list the contents of the stuffbin
	path, _ := os.Executable()
	fs, _ := stuffbin.UnStuff(path)

	fmt.Println("Stuffbin contents:")
	for _, f := range fs.List() {
		fmt.Println(f)
	}
}
