package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/locations"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func GetLocations(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	res, err := locations.GetLocations()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get locations: %v", err), 500)
		return
	}

	responses.HandleRequest(w, r, res)
}
