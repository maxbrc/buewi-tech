package auth

import (
	"encoding/json"
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TokenBundle struct {
	RefreshToken string `json:"refresh_token"`
	AccessToken  string `json:"access_token"`
}

func ProcessLogin(reqBody []byte) (*TokenBundle, int, error) {
	var loginRequest LoginRequest
	err := json.Unmarshal(reqBody, &loginRequest)
	if err != nil {
		return nil, 400, fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	if loginRequest.Username == "" || loginRequest.Password == "" {
		return nil, 400, fmt.Errorf("username and password must not be empty")
	}

	foundUser, err := verifyUser(loginRequest.Username, loginRequest.Password)
	if err != nil {
		return nil, 401, fmt.Errorf("user verification failed: %v", err)
	}

	accessToken, err := CreateToken(Access, foundUser.ID, foundUser.RoleID)
	if err != nil {
		return nil, 500, fmt.Errorf("failed to create access token: %v", err)
	}

	refreshToken, err := CreateToken(Refresh, foundUser.ID, foundUser.RoleID)
	if err != nil {
		return nil, 500, fmt.Errorf("failed to create refresh token: %v", err)
	}

	tokenBundle := TokenBundle{
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
	}

	return &tokenBundle, 200, nil
}

func verifyUser(username, providedPassword string) (*db.RawUser, error) {
	rawUser, err := db.GetUserByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	err = ValidateHash(rawUser.Argon2IDHash, providedPassword)
	if err != nil {
		return nil, fmt.Errorf("password hash validation failed: %v", err)
	}

	return rawUser, nil
}
