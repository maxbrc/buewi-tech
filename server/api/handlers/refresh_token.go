package handlers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

type RefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
}

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookieValue, err := r.Cookie("refresh_token")
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			http.Error(w, "refresh_token cookie not found", 401)
			return
		}

		http.Error(w, fmt.Sprintf("Failed to get refresh_token cookie: %v", err), 401)
		return
	}

	userID, roleID, err := auth.ValidateAndProcessToken(cookieValue.Value, auth.Refresh)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	newAccessToken, err := auth.CreateToken(auth.Access, userID, roleID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create new access token: %v", err), 500)
		return
	}

	responses.HandleRequest(w, r, &RefreshTokenResponse{AccessToken: newAccessToken})
}
