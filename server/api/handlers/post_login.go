package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/responses"
)

type SuccessfulLoginResponse struct {
	AccessToken string `json:"access_token"`
}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 400)
		return
	}

	tokenBundle, code, err := auth.ProcessLogin(reqBody)
	if err != nil {
		if code == 401 {
			http.Error(w, "Invalid Credentials", code)
			return
		}
		http.Error(w, err.Error(), code)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokenBundle.RefreshToken,
		Path:     "/api/refresh-token",
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   31 * 24 * 60 * 60,
	})

	responses.HandleRequest(w, r, &SuccessfulLoginResponse{AccessToken: tokenBundle.AccessToken})
}
