package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/inventory"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func PatchItems(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", 500)
	}

	item_sn := r.PathValue("sn")

	err = inventory.UpdateItem(item_sn, reqBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update item: %v", err), 500)
	}

	responses.HandleRequest(w, r, nil)
}
