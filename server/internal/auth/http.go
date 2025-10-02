package auth

import (
	"fmt"
	"net/http"
	"strings"
)

func Authorize(httpRequest *http.Request) (int, int, error) {
	rawHeaderValue := httpRequest.Header.Get("Authorization")

	err := validateAuthorizationHeader(rawHeaderValue)
	if err != nil {
		return 0, 0, fmt.Errorf("Authorization header invalid: %v", err)
	}

	tokenString := strings.TrimPrefix(rawHeaderValue, "Bearer ")

	userID, roleID, err := ValidateAndProcessToken(tokenString, Access)
	if err != nil {
		return 0, 0, fmt.Errorf("jwt validation failed: %v", err)
	}

	return userID, roleID, nil
}

func validateAuthorizationHeader(rawHeaderValue string) error {
	if rawHeaderValue == "" {
		return fmt.Errorf("no Authorization header present or empty")
	}

	tokenStringWithSpace, foundPrefix := strings.CutPrefix(rawHeaderValue, "Bearer")
	if !foundPrefix {
		return fmt.Errorf("invalid authorization scheme (requiring Bearer token)")
	}

	tokenString, foundSpace := strings.CutPrefix(tokenStringWithSpace, " ")
	if !foundSpace {
		return fmt.Errorf("did not find space between auth scheme and token")
	}

	if strings.Contains(tokenString, " ") {
		return fmt.Errorf("found spaces in what should be token")
	}

	return nil
}
