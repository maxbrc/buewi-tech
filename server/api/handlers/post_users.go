package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
	"github.com/bm-dynamics/buewi-tech/server/internal/users"
)

func PostUsers(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	err = users.CreateUser(reqBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create user: %v", err), 500)
		return
	}

	responses.HandleRequest(w, r, nil)
}
