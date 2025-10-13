package parser

import (
	"encoding/json"
	"net/http"
	"strings"
)

func IsJSONContentType(contentType string) bool {
	return strings.Contains(contentType, "application/json")
}

func ParseBody(r *http.Request, contentType string) (string, error) {
	if IsJSONContentType(contentType) {
		var bodyJSON map[string]interface{}
		dec := json.NewDecoder(r.Body)
		if err := dec.Decode(&bodyJSON); err != nil {
			return "", err
		}
		_bodyJSON, _ := json.Marshal(bodyJSON)
		return string(_bodyJSON), nil
	}
	return "", nil
}
