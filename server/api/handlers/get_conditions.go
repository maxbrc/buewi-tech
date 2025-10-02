package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/inventory"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func GetConditions(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	res, err := inventory.GetConditions()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get conditions: %v", err), 500)
	}

	responses.HandleRequest(w, r, res)
}
