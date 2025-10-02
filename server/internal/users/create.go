package users

import (
	"encoding/json"
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/auth"
	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type UserCreationRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	EMail     string `json:"email"`
	RoleID    int    `json:"role_id"`
	Username  string `json:"username"`
	Tel       string `json:"tel"`
	Password  string `json:"password"`
}

type PasswordUpdateRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func CreateUser(reqBody []byte) error {
	var creationRequest UserCreationRequest
	err := json.Unmarshal(reqBody, &creationRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	argon2id_string := auth.GenerateHash(creationRequest.Password)

	rawUser := db.RawUserInsert{
		FirstName:    creationRequest.FirstName,
		LastName:     creationRequest.LastName,
		EMail:        creationRequest.EMail,
		RoleID:       creationRequest.RoleID,
		Argon2IDHash: argon2id_string,
		Username:     creationRequest.Username,
		Tel:          creationRequest.Tel,
	}

	err = db.InsertUser(&rawUser)
	if err != nil {
		return fmt.Errorf("failed to insert user: %v", err)
	}

	return nil
}
