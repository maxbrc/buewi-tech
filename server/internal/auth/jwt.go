package auth

import (
	"crypto/ed25519"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/bm-dynamics/buewi-tech/server/config"
	"github.com/golang-jwt/jwt/v5"
)

type TokenType string

var (
	Access  TokenType = "access"
	Refresh TokenType = "refresh"
)

var (
	privKey ed25519.PrivateKey
	pubKey  ed25519.PublicKey
)

func LoadKeys() error {
	seed, err := os.ReadFile(config.AppConfig.Ed25519SeedPath)
	if err != nil {
		return fmt.Errorf("failed to read seed file: %v", err)
	}

	privKey = ed25519.NewKeyFromSeed(seed)
	pubKey = privKey.Public().(ed25519.PublicKey)

	return nil
}

type CustomClaims struct {
	Type   TokenType `json:"type"`
	RoleID int       `json:"role_id"`
	jwt.RegisteredClaims
}

func generateSignedToken(claims *CustomClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodEdDSA, claims)

	signedString, err := token.SignedString(privKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %v", err)
	}

	return signedString, nil
}

func CreateToken(tokenType TokenType, userID, roleID int) (string, error) {
	issuedAtTime := time.Now().UTC()
	var expiresAtTime time.Time
	switch tokenType {
	case Access:
		expiresAtTime = issuedAtTime.Add(15 * time.Minute)
	case Refresh:
		expiresAtTime = issuedAtTime.Add(30 * 24 * time.Hour)
	}

	claims := CustomClaims{
		Type:   tokenType,
		RoleID: roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.Itoa(userID),
			IssuedAt:  jwt.NewNumericDate(issuedAtTime),
			ExpiresAt: jwt.NewNumericDate(expiresAtTime),
		},
	}

	return generateSignedToken(&claims)
}

func parseToken(tokenString string) (*jwt.Token, error) {
	parser := jwt.NewParser(jwt.WithValidMethods([]string{jwt.SigningMethodEdDSA.Alg()}))

	token, err := parser.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (any, error) {
		return pubKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid (should not see this)")
	}

	return token, nil
}

func validateToken(token *jwt.Token, tokenType TokenType) error {
	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return fmt.Errorf("failed to parse claims (type conversion)")
	}

	ttype := claims.Type
	if ttype != tokenType {
		return fmt.Errorf("token has valid signature but invalid type")
	}

	currentTime := time.Now().UTC()

	issuedAtTime := claims.IssuedAt

	expiresAtTime := claims.ExpiresAt

	if currentTime.Before(issuedAtTime.Time) {
		return fmt.Errorf("token not valid yet")
	}

	if currentTime.After(expiresAtTime.Time) {
		return fmt.Errorf("token expired (at %s)", expiresAtTime.Time.Format(time.DateTime))
	}

	return nil
}

// User ID, Role ID, Error
func ValidateAndProcessToken(tokenString string, tokenType TokenType) (int, int, error) {
	token, err := parseToken(tokenString)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse token: %v", err)
	}

	err = validateToken(token, tokenType)
	if err != nil {
		return 0, 0, fmt.Errorf("token validation failed: %v", err)
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return 0, 0, fmt.Errorf("failed to parse claims (type conversion)")
	}

	userID, err := strconv.Atoi(claims.Subject)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse userID integer from sub claim")
	}

	roleID := claims.RoleID

	return userID, roleID, nil
}
