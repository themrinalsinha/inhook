package parser

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

func IsJSONContentType(contentType string) bool {
	return strings.Contains(contentType, "application/json")
}

func IsXMLContentType(contentType string) bool {
	return strings.Contains(contentType, "application/xml")
}

func IsTextContentType(contentType string) bool {
	return strings.Contains(contentType, "text/")
}

func IsYAMLContentType(contentType string) bool {
	return strings.Contains(contentType, "application/yaml")
}

func _process(r *http.Request) (string, error) {
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}
	fmt.Println("======>>> BODY BYTES >>>>>")
	fmt.Println(string(bodyBytes))
	fmt.Println("======>>> BODY BYTES >>>>>")
	return string(bodyBytes), nil
}

func ParseBody(r *http.Request, contentType string) (string, error) {
	if IsJSONContentType(contentType) {
		var rawBody interface{}
		dec := json.NewDecoder(r.Body)
		if err := dec.Decode(&rawBody); err != nil {
			return "", err
		}
		_bodyJSON, _ := json.Marshal(rawBody)
		return string(_bodyJSON), nil

	} else if IsXMLContentType(contentType) ||
		IsTextContentType(contentType) ||
		IsYAMLContentType(contentType) {
		fmt.Println("======>>> YAML CONTENT TYPE >>>>>")
		return _process(r)
	}

	return "", nil
}
