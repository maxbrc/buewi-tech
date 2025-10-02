package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/manuals"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func GetManuals(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	res, err := manuals.GetManuals()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get manuals: %v", err), 500)
		return
	}

	responses.HandleRequest(w, r, res)
}
