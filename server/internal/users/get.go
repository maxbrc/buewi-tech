package users

import (
	"fmt"

	"github.com/bm-dynamics/buewi-tech/server/internal/db"
)

type User struct {
	ID           int    `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	EMail        string `json:"email"`
	RoleID       int    `json:"role_id"`
	Argon2IDHash string `json:"argon2id_hash,omitempty"`
	CreatedAt    string `json:"created_at"`
	Username     string `json:"username"`
	Tel          string `json:"tel"`
}

func GetUserByID(id int) (*User, error) {
	rawUser, err := db.GetUserByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	user := User{
		ID:        rawUser.ID,
		FirstName: rawUser.FirstName,
		LastName:  rawUser.LastName,
		EMail:     rawUser.EMail,
		RoleID:    rawUser.RoleID,
		CreatedAt: rawUser.CreatedAt,
		Username:  rawUser.Username,
		Tel:       rawUser.Tel,
	}

	return &user, nil
}
