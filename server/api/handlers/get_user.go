package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
	"github.com/bm-dynamics/buewi-tech/server/internal/users"
)

func GetUser(w http.ResponseWriter, r *http.Request) {
	_, _, err := auth.Authorize(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("authorization failed: %v", err), 401)
		return
	}

	rawUserID := r.PathValue("id")

	if rawUserID == "" {
		http.Error(w, "Must specify user id", 400)
		return
	}

	userID, err := strconv.Atoi(rawUserID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to parse user id: %v", err), 400)
	}

	res, err := users.GetUserByID(userID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	responses.HandleRequest(w, r, res)
}
