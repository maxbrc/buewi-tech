package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/inventory"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func DeleteItems(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	item_sn := r.PathValue("sn")
	err = inventory.RemoveItem(item_sn)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to delete item: %v", err), 500)
	}

	responses.HandleRequest(w, r, nil)
}
