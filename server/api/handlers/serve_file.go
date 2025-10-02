package handlers

import (
	"net/http"
	"os"
	"strings"
)

func ServerFile(w http.ResponseWriter, r *http.Request) {

	filename := strings.TrimPrefix(r.URL.Path, "/files/")

	file, err := os.Open("files/" + filename)

}
