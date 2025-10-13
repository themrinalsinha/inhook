package parser

import (
	"encoding/json"
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

func _process(r *http.Request) (string, error) {
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}
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

	} else if IsXMLContentType(contentType) {
		return _process(r)

	} else if IsTextContentType(contentType) {
		return _process(r)
	}

	return "", nil
}
