package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/manuals"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func PostManual(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	err = r.ParseMultipartForm(1024 * 1024 * 100) // 100 MiB
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to parse multipart form: %v", err), 400)
		return
	}

	file, _, err := r.FormFile("manual_file")
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get formfile: %v", err), 400)
		return
	}

	itemSerialNumber := r.FormValue("item_sn")
	if itemSerialNumber == "" {
		http.Error(w, "Received empty item serial number", 400)
		return
	}

	manualUUID := r.FormValue("manual_uuid")
	if manualUUID == "" {
		http.Error(w, "Received empty manual uuid", 400)
		return
	}

	defer file.Close()

	readFile, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read formfile: %v", err), 400)
		return
	}

	err = manuals.CreateManual(readFile, manualUUID, itemSerialNumber)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create manual entry: %v", err), 500)
		return
	}

	responses.HandleRequest(w, r, nil)
}
