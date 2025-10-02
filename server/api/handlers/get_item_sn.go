package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/inventory"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func GetItemBySerialNumber(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	serialNumber := r.PathValue("sn")

	item, err := inventory.GetItem(serialNumber)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get item: %v", err), 500)
		return
	}

	if item == nil {
		http.Error(w, "Kein Item mit dieser Seriennummer gefunden", 404)
		return
	}

	responses.HandleRequest(w, r, item)
}
