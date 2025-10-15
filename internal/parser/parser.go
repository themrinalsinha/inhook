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

func IsYAMLContentType(contentType string) bool {
	return strings.Contains(contentType, "application/yaml")
}

func IsHTMLContentType(contentType string) bool {
	return strings.Contains(contentType, "text/html")
}

func IsFormURLEncodedContentType(contentType string) bool {
	return strings.Contains(contentType, "application/x-www-form-urlencoded")
}

func IsMultipartFormDataContentType(contentType string) bool {
	return strings.Contains(contentType, "multipart/form-data")
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

	} else if IsXMLContentType(contentType) ||
		IsTextContentType(contentType) ||
		IsYAMLContentType(contentType) ||
		IsHTMLContentType(contentType) {
		return _process(r)
	}

	return "", nil
}

func _ProcessFormURLEncoded(r *http.Request) (string, error) {
	err := r.ParseForm()
	if err != nil {
		return "", err
	}

	formDataMap := make(map[string]string)
	for key, values := range r.PostForm {
		formDataMap[key] = strings.Join(values, ", ")
	}

	formDataJSON, err := json.Marshal(formDataMap)
	if err != nil {
		return "", err
	}

	return string(formDataJSON), nil
}

func _ProcessMultipartFormData(r *http.Request) (string, error) {
	err := r.ParseMultipartForm(100 * 1024 * 1024) // 100MB
	if err != nil {
		return "", err
	}

	formDataMap := make(map[string]string)
	for key, values := range r.MultipartForm.Value {
		formDataMap[key] = strings.Join(values, ", ")
	}

	formDataJSON, err := json.Marshal(formDataMap)
	if err != nil {
		return "", err
	}
	return string(formDataJSON), nil
}

func ParseFormData(r *http.Request) (string, error) {
	if IsFormURLEncodedContentType(r.Header.Get("Content-Type")) {
		return _ProcessFormURLEncoded(r)
	} else if IsMultipartFormDataContentType(r.Header.Get("Content-Type")) {
		return _ProcessMultipartFormData(r)
	}
	return "", nil
}
