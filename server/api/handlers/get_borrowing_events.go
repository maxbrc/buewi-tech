package handlers

import (
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/borrowing"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

func GetBorrowingEvents(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	getActiveEvents := r.URL.Query().Get("active")

	if getActiveEvents != "true" {
		res, err := borrowing.GetActiveEvents()
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to get active borrowing events: %v", err), 500)
			return
		}
		responses.HandleRequest(w, r, res)
	} else {
		res, err := borrowing.GetEvents()
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to get borrowing events: %v", err), 500)
			return
		}
		responses.HandleRequest(w, r, res)
	}

}
